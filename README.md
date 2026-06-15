# Seapedia Backend

REST API untuk platform e-commerce produk laut Seapedia, dibangun dengan Node.js, Express, dan MongoDB.

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Instalasi & Setup](#instalasi--setup)
3. [Environment Variables](#environment-variables)
4. [Cara Menjalankan](#cara-menjalankan)
5. [Membuat Akun Admin](#membuat-akun-admin)
6. [Demo Accounts](#demo-accounts)
7. [Catatan Adaptasi SQL → MongoDB](#catatan-adaptasi-sql--mongodb)
8. [Business Rules](#business-rules)
9. [Catatan Keamanan](#catatan-keamanan)
10. [Panduan Pengujian End-to-End](#panduan-pengujian-end-to-end)
11. [Struktur Folder](#struktur-folder)
12. [Roles & Akses](#roles--akses)
13. [Riwayat Commit](#riwayat-commit)

---

## Tech Stack

| Kategori | Library |
|---|---|
| Runtime | Node.js 18+ (ES Modules) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Auth | jsonwebtoken + in-memory JTI blacklist |
| Validation | express-validator |
| Security | helmet, cors, express-mongo-sanitize, sanitize-html |
| Docs | swagger-jsdoc + swagger-ui-express |
| Scheduler | node-cron |

---

## Instalasi & Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd seapedia-be

# 2. Install dependencies
npm install

# 3. Salin file env dan isi nilainya
cp .env.example .env

# 4. Seed database dengan data demo
npm run seed
```

Pastikan MongoDB sudah berjalan sebelum menjalankan server atau seeder.

---

## Environment Variables

| Variable | Deskripsi | Default / Wajib |
|---|---|---|
| `PORT` | Port server | `3000` |
| `MONGODB_URI` | URI koneksi MongoDB | **wajib** |
| `JWT_SECRET` | Secret key JWT (min 32 karakter) | **wajib** |
| `JWT_EXPIRES_IN` | Masa berlaku token | `1d` |
| `NODE_ENV` | Environment (`development` / `production` / `test`) | `development` |
| `ENABLE_CRON` | Aktifkan cron job late-order | `false` |
| `LATE_ORDER_CRON_SCHEDULE` | Jadwal cron (sintaks cron) | `*/5 * * * *` |

> **Catatan `JWT_EXPIRES_IN`:** Nilai `1d` cocok untuk development. Untuk production dengan kebutuhan keamanan tinggi, pertimbangkan `15m` dengan refresh token flow.

---

## Cara Menjalankan

```bash
npm run dev      # Development dengan hot-reload (nodemon)
npm start        # Production
npm run seed     # Isi database dengan data demo
```

| Endpoint | Keterangan |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/docs` | Swagger UI — dokumentasi interaktif semua endpoint |

---

## Membuat Akun Admin

> **Penting:** Role `ADMIN` **tidak bisa dibuat melalui `POST /auth/register`** — diblokir by design agar admin tidak bisa self-register. Validator secara eksplisit menolak role ADMIN dari endpoint registrasi publik.

### Cara 1 — Seeder (Direkomendasikan)

```bash
npm run seed
```

Membuat akun `admin@seapedia.id` / `admin123` secara otomatis.

### Cara 2 — Insert Langsung ke MongoDB

```js
// Jalankan di mongosh atau MongoDB Compass Shell
const bcrypt = require("bcryptjs");
const hash = await bcrypt.hash("password_baru", 12);

db.users.insertOne({
  fullName: "Admin",
  email: "admin@example.com",
  password: hash,
  roles: ["ADMIN"],
  activeRole: "ADMIN",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

---

## Demo Accounts

Tersedia setelah menjalankan `npm run seed`.

| Role | Email | Password | Catatan |
|---|---|---|---|
| Admin | admin@seapedia.id | admin123 | Akses penuh `/api/admin/*` |
| Seller | seller@seapedia.id | seller123 | Toko "Toko Ikan Segar Bu Budi" + 5 produk |
| Buyer | buyer@seapedia.id | buyer123 | Wallet Rp500.000 |
| Driver | driver@seapedia.id | driver123 | — |
| Multi-role | multi@seapedia.id | multi123 | BUYER + SELLER + DRIVER, perlu pilih activeRole |

**Kode Diskon Demo:**

| Jenis | Kode | Diskon | Berlaku |
|---|---|---|---|
| Voucher | `SEAPEDIA10` | 10% | 30 hari |
| Voucher | `HEMAT50K` | Rp50.000 flat | 30 hari |
| Promo | `PROMO20` | 20% | 14 hari |
| Promo | `SEAFOOD15` | 15% | 7 hari |

---

## Catatan Adaptasi SQL → MongoDB

Proyek ini dibangun di MongoDB dengan pertimbangan berikut dibanding arsitektur SQL:

### Embedded vs Referenced Documents

| Pola SQL | Pendekatan MongoDB di Seapedia |
|---|---|
| Tabel terpisah `order_items` | Embedded `items[]` di dalam dokumen `Order` — snapshot data produk disimpan saat order dibuat, tidak terpengaruh jika produk diubah atau dihapus setelahnya |
| Foreign key `status` di tabel terpisah | Embedded `statusHistory[]` di `Order` — timeline tidak perlu JOIN, query cukup satu dokumen |
| Tabel pivot untuk relasi banyak-ke-banyak | Array `roles[]` di User — representasi multi-role tanpa tabel junction |

### Transaksi untuk Atomisitas

MongoDB tidak memiliki ACID multi-table secara otomatis. Untuk operasi yang menyentuh beberapa collection sekaligus (checkout, complete delivery job, proses refund), proyek ini menggunakan **Mongoose sessions + `startSession()` + `withTransaction()`** agar gagal di tengah jalan tidak meninggalkan data yang inkonsisten.

### Upsert sebagai Pengganti `INSERT OR IGNORE`

Wallet dan cart menggunakan `findOneAndUpdate` dengan `{ upsert: true, $setOnInsert: {...} }` untuk membuat dokumen jika belum ada sekaligus menghindari race condition — pola yang lebih idiomatis di MongoDB dibanding `INSERT OR IGNORE` SQL.

### Index

- `email` di User: `unique: true`
- `storeName` di Store: `unique: true, index: true`
- `code` di Voucher/Promo: `unique: true, uppercase`
- `order` di DeliveryJob: `unique: true` — satu order hanya boleh punya satu delivery job

---

## Business Rules

### Aturan One-Store Checkout (Single-Store Cart)

Keranjang belanja dibatasi **satu toko per sesi cart**. Jika buyer menambah produk dari toko berbeda, server menolak dengan `409` dan pesan:

> _"Keranjang sudah berisi produk dari toko lain. Kosongkan keranjang dulu."_

**Alasan:** Satu delivery job dibuat per order, dan satu order hanya boleh dikirim dari satu toko (satu titik pickup driver). Mengizinkan multi-toko dalam satu checkout akan memerlukan logika pembagian order yang jauh lebih kompleks.

### Kalkulasi Harga & PPN 12%

```
subtotal      = Σ(harga × qty) untuk semua item
discountAmount = voucher + promo (keduanya dihitung dari subtotal, dikap di subtotal)
ppnAmount     = Math.round((subtotal - discountAmount) × 0.12)
deliveryFee   = sesuai metode pengiriman
finalTotal    = subtotal - discountAmount + deliveryFee + ppnAmount
```

> **Posisi diskon vs PPN:** Diskon diberikan **sebelum** PPN dihitung. Buyer hanya membayar pajak atas nilai neto setelah diskon, bukan atas harga penuh. Ini adalah praktik umum di e-commerce Indonesia.

**Biaya pengiriman:**

| Metode | Biaya |
|---|---|
| `INSTANT` | Rp25.000 |
| `NEXT_DAY` | Rp15.000 |
| `REGULAR` | Rp9.000 |

### Kombinasi Diskon: Voucher + Promo

- Voucher dan promo **bisa dikombinasikan** dalam satu checkout
- Keduanya dihitung **dari subtotal yang sama** (tidak berantai/chained)
- `totalDiscount = discountVoucher + discountPromo` — dikap di subtotal (tidak bisa minus)
- Voucher punya `remainingUsage` yang berkurang setiap kali dipakai; promo tidak terbatas penggunaan

**Contoh kalkulasi:**

```
subtotal        = Rp200.000
voucher SEAPEDIA10 (10%)  → Rp20.000
promo PROMO20 (20%)       → Rp40.000
totalDiscount             = Rp60.000

ppnAmount = Math.round((200.000 - 60.000) × 0.12) = Rp16.800
deliveryFee (REGULAR)     = Rp9.000
finalTotal = 200.000 - 60.000 + 9.000 + 16.800 = Rp165.800
```

### Rumus Earning Driver

```
earning = deliveryFee × DRIVER_EARNING_RATE (0.8)
```

Earning dihitung saat seller menekan "Proses Order" dan disimpan di `DeliveryJob.earning`. Driver tidak menanggung PPN — earning adalah bagian bersih dari ongkir.

**Contoh:** ongkir `NEXT_DAY` Rp15.000 → driver mendapat Rp12.000 per pengiriman.

### Aturan SLA & Auto-Refund

Order memiliki `expiredAt` yang dihitung saat checkout:

```
expiredAt = waktu checkout + SLA_HOURS[deliveryMethod]
```

| Metode | SLA | Artinya |
|---|---|---|
| `INSTANT` | 3 jam | Order harus selesai dalam 3 jam |
| `NEXT_DAY` | 24 jam | Order harus selesai dalam 24 jam |
| `REGULAR` | 72 jam | Order harus selesai dalam 72 jam |

**Auto-refund:** Cron job (atau trigger manual) secara periodik mencari order yang `expiredAt < now` dan statusnya bukan `COMPLETED`/`RETURNED`. Order tersebut otomatis di-refund: saldo `finalTotal` dikembalikan ke wallet buyer, dan status diubah ke `RETURNED`.

### Simulasi Waktu (untuk Testing SLA)

Endpoint `POST /api/admin/simulate/next-day` memajukan jam sistem sebesar 24 jam tanpa mengubah clock server. Ini memungkinkan pengujian alur SLA tanpa menunggu berjam-jam.

```
POST /api/admin/simulate/next-day        → maju 24 jam
POST /api/admin/process-late-orders      → proses refund order yang sudah melewati SLA
```

Waktu sistem disimpan di collection `systemsettings` sebagai singleton. Jika tidak di-set, server menggunakan waktu nyata (`new Date()`).

---

## Catatan Keamanan

### NoSQL Injection

`express-mongo-sanitize` dipasang global di `app.js` — menyanitasi semua input dari `req.body`, `req.params`, dan `req.query`. Karakter operator MongoDB (`$`, `.`) dihapus dari input user sebelum mencapai query Mongoose.

### XSS & HTML Injection

`sanitize-html` digunakan via wrapper `src/utils/sanitize.js`. Semua konten teks bebas yang dibuat user (terutama komentar review) disanitasi sebelum disimpan ke database — semua tag HTML dan atribut dihapus.

### Validasi Input

Setiap endpoint mutasi (POST/PATCH) dilindungi validator `express-validator`. Tipe, format, dan range diperiksa sebelum data menyentuh service layer:
- Email: `isEmail()` + `normalizeEmail()`
- Nomor HP: `isMobilePhone("id-ID")`
- Harga/stok: `isFloat/isInt` dengan batas minimum
- Diskon persentase: dikap maksimal 100
- MongoId di route param: `param('id').isMongoId()` — mencegah CastError 500

### Autentikasi & Sesi

- JWT stateless dengan `jti` (UUID) di setiap token
- **Token blacklist in-memory** (`Map<jti, expiresAt>`): token yang sudah di-logout tidak bisa dipakai kembali meski belum expired. Entry dihapus otomatis saat token expire (auto-eviction on read — tidak ada memory leak)
- Keterbatasan: blacklist hilang saat server restart. Untuk multi-instance/persistent, ganti dengan Redis `SETEX`
- `protect` middleware: validasi JWT → cek blacklist → cek user masih ada di DB

### RBAC (Role-Based Access Control)

- `requireRole(...allowed)`: cek `user.activeRole` server-side, bukan dari klaim client
- Admin bypass: cek `user.roles.includes('ADMIN')` — tidak bergantung `activeRole`
- Role `ADMIN` tidak bisa di-assign via API publik — hanya via seeder/DB langsung
- Ownership check di service layer (bukan hanya route): produk/toko cek kepemilikan seller, order cek kepemilikan buyer, delivery job cek kepemilikan driver

---

## Panduan Pengujian End-to-End

Berikut alur demo lengkap menggunakan akun seeder. Gunakan Swagger UI di `/api/docs` atau Postman/REST client.

### Alur 1: Registrasi & Login

```
POST /api/auth/register
  body: { fullName, email, password, roles: ["BUYER"] }

POST /api/auth/login
  body: { email, password }
  → simpan token dari response

# Jika multi-role, pilih activeRole dulu:
PATCH /api/auth/active-role
  header: Authorization: Bearer <token>
  body: { role: "BUYER" }
```

### Alur 2: Belanja (sebagai Buyer)

```
# 1. Top up wallet dulu
POST /api/wallet/topup
  body: { amount: 500000 }

# 2. Lihat produk
GET /api/products

# 3. Tambah ke keranjang
POST /api/cart/items
  body: { productId: "<id>", quantity: 2 }

# 4. Tambah alamat pengiriman
POST /api/addresses
  body: { recipientName, phone, addressDetail }

# 5. Checkout dengan diskon
POST /api/checkout
  body: {
    addressId: "<id>",
    deliveryMethod: "NEXT_DAY",
    voucherCode: "SEAPEDIA10",
    promoCode: "PROMO20"
  }
  → simpan orderId dari response
```

### Alur 3: Proses Order (sebagai Seller)

```
# Login sebagai seller@seapedia.id
POST /api/auth/login

# Lihat order masuk
GET /api/orders/seller/incoming

# Proses order → status PACKING → WAITING_DELIVERY + buat delivery job
PATCH /api/orders/<orderId>/process
```

### Alur 4: Pengiriman (sebagai Driver)

```
# Login sebagai driver@seapedia.id
POST /api/auth/login

# Lihat job tersedia
GET /api/delivery/jobs/available

# Ambil job
PATCH /api/delivery/jobs/<jobId>/take

# Selesaikan → status DELIVERING → COMPLETED + earning masuk wallet
PATCH /api/delivery/jobs/<jobId>/complete

# Lihat dashboard & earning
GET /api/delivery/dashboard
```

### Alur 5: Simulasi SLA & Auto-Refund (sebagai Admin)

```
# Login sebagai admin@seapedia.id
POST /api/auth/login

# Buat order dulu (alur Buyer di atas, tapi jangan diselesaikan driver)

# Majukan waktu sistem agar order melewati SLA
POST /api/admin/simulate/next-day   # bisa dipanggil beberapa kali

# Lihat order yang overdue
GET /api/admin/orders/overdue

# Proses refund otomatis
POST /api/admin/process-late-orders
```

### Alur 6: Manajemen Diskon (sebagai Admin)

```
# Buat voucher baru
POST /api/admin/vouchers
  body: { name, code, discountType: "PERCENTAGE", discountValue: 25, remainingUsage: 50, expiryDate: "2027-01-01" }

# Update voucher
PATCH /api/admin/vouchers/<id>
  body: { remainingUsage: 100 }

# Hapus voucher
DELETE /api/admin/vouchers/<id>
```

---

## Struktur Folder

```
src/
├── config/
│   ├── db.js            # Koneksi MongoDB
│   └── env.js           # Validasi & export env vars
├── constants/
│   ├── enums.js         # ROLES, ORDER_STATUS, dll
│   └── config.js        # PPN_RATE, DELIVERY_FEE, SLA_HOURS, DRIVER_EARNING_RATE
├── controllers/         # Thin handler — hanya parse req/res, delegasi ke service
├── services/            # Business logic (checkout, delivery, admin, dll)
├── models/              # Mongoose schemas + instance methods
├── routes/              # Express routers + @openapi JSDoc annotations
├── middlewares/
│   ├── auth.middleware.js      # protect, requireActiveRole
│   ├── role.middleware.js      # requireRole (RBAC)
│   ├── validate.middleware.js  # express-validator result handler
│   └── error.middleware.js     # notFound + errorHandler global
├── validators/          # express-validator chain per endpoint
├── utils/
│   ├── ApiError.js         # Custom error class
│   ├── response.js         # sendSuccess, sendError helpers
│   ├── jwt.js              # signToken (+ jti), verifyToken
│   ├── tokenBlacklist.js   # In-memory JTI blacklist (Map + auto-eviction)
│   ├── sanitize.js         # sanitizeText wrapper untuk sanitize-html
│   └── priceCalculator.js  # calculateOrderTotals (subtotal, PPN, total)
├── docs/
│   └── swagger.js       # swagger-jsdoc config → serve di /api/docs
├── jobs/
│   └── lateOrder.cron.js  # node-cron untuk processLateOrders
├── seeders/
│   └── index.js         # Demo data seeder (idempotent)
├── app.js               # Express setup: middleware stack + routing
└── server.js            # Entry point: connectDB + cron + listen
```

---

## Roles & Akses

| Role | Akses Utama |
|---|---|
| `BUYER` | Keranjang, checkout, order (view), wallet, alamat, laporan belanja |
| `SELLER` | Toko, produk, order (proses incoming), laporan pendapatan |
| `DRIVER` | Delivery job (take/complete), dashboard earning |
| `ADMIN` | Monitoring semua data, CRUD voucher/promo, simulasi waktu, trigger refund |

**Aturan multi-role:**
- Satu user bisa memiliki beberapa role sekaligus
- `activeRole` harus dipilih via `PATCH /auth/active-role` sebelum mengakses endpoint role-specific
- Admin tidak perlu set `activeRole` — diizinkan otomatis via `user.roles.includes('ADMIN')`
- Role `ADMIN` tidak bisa di-assign sendiri via API publik

---

## Riwayat Commit

Setiap fitur diimplementasikan secara bertahap dalam commit terpisah, mencerminkan proses pengembangan yang terstruktur:

**Setup & Fondasi**
```
ad6a5db  chore: initialize node project and install dependencies
4130bf5  chore: setup project structure, constants and enums
0698106  feat: setup environment config and mongodb connection
6415c8a  feat: setup express app with base and security middlewares
```

**Auth**
```
05bdd65  feat: add user model with multi-role support
0d83f9e  feat: add jwt and auth utility helpers
6c8212b  feat: implement user registration endpoint
8076351  feat: implement login endpoint with role list response
7fe56a7  feat: implement active role selection endpoint
7759d24  feat: implement get current user profile endpoint
6ed8240  feat: implement logout endpoint
```

**Reviews, Stores, Products**
```
945cf00  feat: add review model
974ec2f  feat: implement create public app review endpoint
aaeaec6  feat: implement list public app reviews endpoint
e639cdc  feat: add store model with unique store name
1465aa7  feat: implement create store endpoint for seller
a2a6f2e  feat: implement get store endpoints (public and own)
4e8b379  feat: implement update store endpoint with ownership check
622f681  feat: add product model
aaebdd6  feat: implement create product endpoint for seller
e6d4289  feat: implement read product endpoints (public catalog and detail)
9dad16a  feat: implement update product endpoint with ownership check
da307f4  feat: implement delete product endpoint with ownership check
```

**Wallet & Address**
```
756ff7d  feat: add wallet and wallet transaction models
5f439ae  feat: implement get wallet and balance endpoint
b5ee0a6  feat: implement dummy wallet top-up endpoint
26dc937  feat: implement wallet transaction history endpoint
a3a5f7a  feat: add address model and create address endpoint
8f13774  feat: implement list, update and delete address endpoints
```

**Cart & Checkout**
```
70eb7c9  feat: add cart model with embedded items
f9c6030  feat: implement add to cart with single-store rule
a475062  feat: implement update cart item quantity endpoint
de3bad5  feat: implement remove cart item endpoint
25371a0  feat: implement get cart summary endpoint
b61c43f  feat: add order model with embedded items and status history
104439d  feat: add price calculation utility
e38f724  feat: implement checkout endpoint with stock and wallet handling
4cd8fa8  feat: implement buyer order history and detail endpoints
d945991  feat: implement seller incoming orders endpoint
```

**Diskon & Laporan**
```
88de8f9  feat: add voucher and promo models
63670e9  feat: implement admin create voucher endpoint
153e2eb  feat: implement list and detail endpoints for vouchers and promos
59ea380  feat: implement discount validation logic
522fdb1  feat: integrate discount into checkout flow
ab38671  feat: implement buyer spending report endpoint
8141221  feat: implement seller revenue report endpoint
```

**Delivery**
```
582535c  feat: add delivery job model
13200c0  feat: implement driver find available jobs endpoint
844a610  feat: implement driver view job detail endpoint
778c36e  feat: implement take delivery job endpoint with concurrency guard
364b7d8  feat: implement complete delivery job endpoint
12ea864  feat: implement driver dashboard with earnings and job history
```

**Admin Monitoring**
```
faf6623  feat: implement admin monitoring endpoints for users and stores
812e90a  feat: implement admin monitoring endpoints for products and orders
7ff5f16  feat: implement admin monitoring for discounts and delivery jobs
cceb523  feat: implement admin monitoring for overdue orders
```

**SLA Simulation & Auto-Refund**
```
61f82e6  feat: add system setting model for time simulation
4a19eb6  feat: implement simulate next day endpoint
e6cad32  feat: implement auto refund/return for late orders
dbd4480  feat: add cron scheduler for late order handling
b8b065d  feat: complete admin voucher and promo management endpoints
```

**Security Hardening**
```
20e1748  feat: add nosql injection sanitization and input sanitizer
0ae3715  feat: enforce input validation across all critical forms
e564fd5  feat: harden session and token expiry handling
e5aa8e5  feat: audit and enforce ownership and active-role checks
```

**Docs & Seeder**
```
0193fc2  docs: add swagger/openapi documentation
c6a44b8  feat: add database seeder with demo accounts and data
```

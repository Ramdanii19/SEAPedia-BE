# Seapedia Backend

REST API untuk platform e-commerce produk laut Seapedia, dibangun dengan Node.js, Express, dan MongoDB.

---

## Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express 5
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken) + in-memory token blacklist
- **Validation**: express-validator
- **Docs**: Swagger UI (`/api/docs`)

---

## Instalasi

```bash
git clone <repo-url>
cd seapedia-be
npm install
cp .env.example .env   # isi MONGODB_URI dan JWT_SECRET
```

---

## Environment Variables

| Variable | Deskripsi | Default |
|---|---|---|
| `PORT` | Port server | `3000` |
| `MONGODB_URI` | URI koneksi MongoDB | _(required)_ |
| `JWT_SECRET` | Secret key untuk JWT | _(required)_ |
| `JWT_EXPIRES_IN` | Masa berlaku token | `1d` |
| `NODE_ENV` | Environment | `development` |
| `ENABLE_CRON` | Aktifkan cron late-order | `false` |
| `LATE_ORDER_CRON_SCHEDULE` | Jadwal cron (cron syntax) | `*/5 * * * *` |

---

## Cara Menjalankan

```bash
npm run dev      # development (nodemon)
npm start        # production
npm run seed     # jalankan database seeder
```

Health check: `GET /api/health`
API Docs:     `GET /api/docs`

---

## Membuat Akun Admin

> **Penting:** Role `ADMIN` **tidak bisa** dibuat melalui endpoint `POST /auth/register` (diblokir by design — admin tidak boleh self-register).

Ada dua cara membuat akun admin:

### 1. Gunakan Seeder (Direkomendasikan)

```bash
npm run seed
```

Seeder membuat akun `admin@seapedia.id` / `admin123` secara otomatis.

### 2. Insert Langsung ke MongoDB

```js
// Jalankan di mongosh atau MongoDB Compass > Open Shell
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

## Demo Accounts (setelah `npm run seed`)

| Role | Email | Password | Catatan |
|---|---|---|---|
| Admin | admin@seapedia.id | admin123 | Akses semua endpoint `/api/admin/*` |
| Seller | seller@seapedia.id | seller123 | Punya toko + 5 produk contoh |
| Buyer | buyer@seapedia.id | buyer123 | Wallet Rp500.000 |
| Driver | driver@seapedia.id | driver123 | — |
| Multi-role | multi@seapedia.id | multi123 | BUYER + SELLER + DRIVER |

**Kode Diskon Demo:**

| Jenis | Kode | Diskon |
|---|---|---|
| Voucher | `SEAPEDIA10` | 10% |
| Voucher | `HEMAT50K` | Rp50.000 flat |
| Promo | `PROMO20` | 20% |
| Promo | `SEAFOOD15` | 15% |

---

## Struktur Folder

```
src/
├── config/          # env loader, koneksi DB
├── constants/       # enums, business config
├── controllers/     # request handler
├── services/        # business logic
├── models/          # Mongoose models
├── routes/          # Express routers
├── middlewares/     # auth, role, error handler, validate
├── validators/      # express-validator schemas
├── utils/           # ApiError, response, jwt, sanitize, tokenBlacklist
├── docs/            # Swagger/OpenAPI config (swagger.js)
├── jobs/            # Cron jobs (lateOrder.cron.js)
├── seeders/         # Database seeder
├── app.js           # Express app setup
└── server.js        # Entry point
```

---

## Roles & Akses

| Role | Akses Utama |
|---|---|
| `BUYER` | Keranjang, checkout, order (view), wallet, alamat, laporan belanja |
| `SELLER` | Toko, produk, order (proses), laporan pendapatan |
| `DRIVER` | Delivery job (take/complete), dashboard earning |
| `ADMIN` | Semua endpoint `/api/admin/*` — monitoring, voucher/promo CRUD, simulasi waktu |

- User bisa memiliki lebih dari satu role
- `activeRole` harus dipilih via `PATCH /auth/active-role` sebelum mengakses endpoint role-specific
- Admin tidak perlu set `activeRole` — bypass otomatis via `user.roles`

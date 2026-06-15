# Seapedia Backend

REST API untuk platform e-commerce produk laut Seapedia, dibangun dengan Node.js, Express, dan MongoDB.

---

## Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express 5
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken)
- **Validation**: express-validator

---

## Instalasi

```bash
# Clone repo
git clone <repo-url>
cd seapedia-be

# Install dependencies
npm install

# Salin env dan isi nilainya
cp .env.example .env
```

---

## Environment Variables

| Variable | Deskripsi | Contoh |
|---|---|---|
| `PORT` | Port server | `3000` |
| `MONGODB_URI` | URI koneksi MongoDB | `mongodb://localhost:27017/seapedia` |
| `JWT_SECRET` | Secret key untuk JWT | `changeme` |
| `JWT_EXPIRES_IN` | Masa berlaku JWT | `7d` |
| `NODE_ENV` | Environment | `development` |

---

## Cara Menjalankan

```bash
# Development (dengan nodemon)
npm run dev

# Production
npm start

# Seeder
npm run seed
```

Health check: `GET http://localhost:3000/api/health`

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
├── middlewares/     # auth, error handler, dll
├── validators/      # express-validator schemas
├── utils/           # ApiError, response helper, dll
├── docs/            # Swagger/OpenAPI spec
├── seeders/         # data seeder
├── app.js           # Express app setup
└── server.js        # Entry point
```

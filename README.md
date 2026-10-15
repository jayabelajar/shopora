# Shopora

Shopora adalah aplikasi e-commerce single-vendor full-stack berdasarkan `docs/PRD.MD`. Storefront mengikuti arah visual `docs/UI.HTML`, sedangkan admin menggunakan workspace privat yang terpisah dari UI publik.

## Fitur MVP

- Register, login, logout, profile, HTTP-only session, CSRF/origin protection, dan role-based access.
- Katalog dengan search, kategori, rentang harga, stok, sorting, dan pagination.
- Detail produk, persistent cart, cart drawer, quantity/stock validation.
- CRUD alamat, checkout preview, transactional checkout, idempotency, dan snapshot alamat.
- Pembayaran demo sukses/gagal, pembatalan idempoten, pemulihan stok, riwayat dan detail order.
- Admin overview, revenue, recent orders, low-stock alerts, product/category CRUD, image upload, inventory, dan fulfillment workflow.
- Responsive layout mulai 360px, loading/error/empty states, migration, 1.000 seeded products, unit tests, dan CI.

## Menjalankan lokal

Prasyarat: Node.js 22+, npm, Docker Desktop.

```powershell
Copy-Item apps/api/.env.example apps/api/.env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

- Storefront: `http://localhost:5173`
- REST API: `http://localhost:3000/api/v1`
- Health check: `http://localhost:3000/health`

Demo admin: `admin@shopora.test` / `Admin123!`  
Demo customer: `customer@shopora.test` / `Customer123!`

## Verifikasi

```powershell
npm test
npm run build
```

## Arsitektur dan dokumentasi

`Vue 3 SPA → Express REST API → Prisma ORM → MySQL 8`

- [PRD](docs/PRD.MD)
- [REST API](docs/API.md)
- [UI reference](docs/UI.HTML)

Semua harga disimpan sebagai integer IDR. Backend menjadi sumber kebenaran untuk harga, stok, total, otorisasi, dan transisi order.

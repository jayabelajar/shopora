# Shopora

Shopora adalah aplikasi e-commerce single-vendor full-stack dengan storefront responsif dan management portal terpisah. Aplikasi mencakup alur belanja dari katalog hingga fulfillment, menggunakan backend sebagai sumber kebenaran untuk harga, stok, total transaksi, dan otorisasi.

## Highlights

- Autentikasi berbasis HTTP-only session cookie, Argon2id, CSRF protection, rate limiting, dan role-based access control.
- Katalog 1.000 produk dengan pencarian, kategori, harga, stok, sorting, pagination, serta detail produk.
- Wishlist persisten, shopping cart persisten, pengelolaan alamat, dan profil customer.
- Checkout transaction-safe dengan validasi stok atomik, snapshot alamat, dan idempotency key.
- Simulasi pembayaran sukses/gagal, pembatalan idempoten, serta pemulihan stok tepat sekali.
- Riwayat dan detail order customer dengan status payment dan fulfillment terpisah.
- Admin portal untuk dashboard, product CRUD/archive, category CRUD/archive, upload gambar, inventory, order detail, dan fulfillment workflow.
- UI responsive mulai 360px berdasarkan referensi visual [`docs/UI.HTML`](docs/UI.HTML).
- Prisma migrations, deterministic demo seed, automated tests, TypeScript build, dan GitHub Actions CI.

## Technology

| Layer | Technology |
|---|---|
| Frontend | Vue 3, TypeScript, Vite, Vue Router, Pinia, Lucide |
| Backend | Node.js, Express, TypeScript, Zod, Argon2id |
| Database | MySQL 8, Prisma ORM |
| Testing | Vitest |
| Infrastructure | npm Workspaces, Docker Compose, GitHub Actions |

## Architecture

```text
Browser
  └─ Vue 3 SPA
       └─ /api/v1 (HTTP + JSON)
            └─ Express modular monolith
                 └─ Prisma ORM
                      └─ MySQL 8
```

Frontend menggunakan proxy same-origin saat development. Backend menghitung ulang harga dan total, memvalidasi ownership, dan melakukan checkout di dalam database transaction.

## Local setup

Prasyarat:

- Node.js 22 atau lebih baru
- npm
- Docker Desktop, atau instalasi MySQL 8 lokal

### Menggunakan Docker Desktop

```powershell
Copy-Item apps/api/.env.example apps/api/.env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

### Menggunakan MySQL lokal

Buat database dan user sesuai `DATABASE_URL` di `apps/api/.env`, lalu jalankan:

```powershell
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Jangan melewati `db:migrate` dan `db:seed`. API dapat tersambung ke MySQL tetapi tetap gagal mengakses login atau produk apabila tabel belum dibuat.

## URLs

| Service | URL |
|---|---|
| Storefront | `http://localhost:5173` |
| Customer login | `http://localhost:5173/login` |
| Admin login | `http://localhost:5173/admin/login` |
| REST API | `http://localhost:3000/api/v1` |
| Health check | `http://localhost:3000/health` |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@shopora.test` | `Admin123!` |
| Customer | `customer@shopora.test` | `Customer123!` |
| Customer | `naufal@shopora.test` | `Customer123!` |

Seed juga menyediakan kategori, 1.000 produk, alamat customer, isi cart, wishlist, order paid/delivered, dan order pending untuk demonstrasi dashboard.

## Environment configuration

```dotenv
DATABASE_URL="mysql://shopora:shopora@localhost:3306/shopora"
PORT=3000
WEB_ORIGIN="http://localhost:5173"
SESSION_COOKIE_NAME="shopora_session"
COOKIE_SAME_SITE="lax"
DEMO_MODE=true
```

Untuk deployment frontend/backend lintas-site melalui HTTPS:

- isi `VITE_API_URL` dengan URL API;
- tambahkan seluruh origin frontend ke `WEB_ORIGIN`, dipisahkan koma;
- gunakan `COOKIE_SAME_SITE=none`.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Menjalankan frontend dan API |
| `npm test` | Menjalankan seluruh test |
| `npm run build` | Typecheck dan production build |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Menerapkan migration development |
| `npm run db:seed` | Membuat deterministic demo data |

## Critical business rules

- Customer hanya dapat mengakses cart, alamat, wishlist, dan order miliknya.
- Endpoint admin hanya menerima session dengan role `ADMIN`.
- Produk/kategori yang diarsipkan tidak tampil di storefront.
- Client tidak dapat menentukan harga atau total order.
- Checkout mencegah stok negatif dan duplicate order.
- Payment failure dan cancellation hanya mengembalikan stok satu kali.
- Fulfillment mengikuti `PENDING → PROCESSING → SHIPPED → DELIVERED` dan hanya berlaku untuk order paid.

## Verification

```powershell
npm test
npm run build
curl.exe http://localhost:3000/health
```

Respons health yang sehat:

```json
{"success":true,"data":{"status":"ok","database":"connected"}}
```

## Documentation

- [Product requirements](docs/PRD.MD)
- [REST API](docs/API.md)
- [UI reference](docs/UI.HTML)

## Security notes

- Jangan commit file `.env` atau credentials production.
- `DEMO_MODE` harus dinonaktifkan di luar environment demonstrasi.
- Gunakan HTTPS dan secure cookies pada production.
- Upload dibatasi ke JPEG, PNG, dan WebP dengan ukuran maksimum 5 MB.

## License

Portfolio and educational project. Review and add an explicit license before redistributing.

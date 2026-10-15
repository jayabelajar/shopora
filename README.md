# Shopora

E-commerce single-vendor full-stack untuk portofolio. Storefront dibangun dengan Vue 3, sementara API menggunakan Express, Prisma, dan MySQL.

## Jalankan lokal

1. Salin `.env.example` menjadi `apps/api/.env`.
2. Jalankan `docker compose up -d`.
3. Jalankan `npm install`.
4. Jalankan `npm run db:generate && npm run db:migrate && npm run db:seed`.
5. Jalankan `npm run dev`.

Storefront: `http://localhost:5173` · API: `http://localhost:3000/api/v1`

Demo admin: `admin@shopora.test` / `Admin123!`  
Demo customer: `customer@shopora.test` / `Customer123!`

## Arsitektur

`Vue SPA → Express REST API → Prisma → MySQL`

API menyimpan sesi dalam cookie httpOnly dan seluruh harga, stok, checkout, serta otorisasi diputuskan server-side. Lihat [PRD](docs/PRD.MD) untuk ruang lingkup lengkap.

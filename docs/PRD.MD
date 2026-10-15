
# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# SHOPORA — E-COMMERCE WEB APPLICATION

**Version:** 1.0.0
**Status:** Ready for Development
**Project Type:** Fullstack Web Application
**Complexity:** Intermediate
**Business Model:** Single-Vendor B2C
**Development:** Solo Developer + AI Agents
**Architecture:** Modular Monolith
**Currency:** IDR
**Timezone:** Asia/Jakarta

---

## 1. PRODUCT OVERVIEW

Shopora adalah aplikasi e-commerce single-vendor berbasis web yang menyediakan pengalaman belanja end-to-end, mulai dari pencarian produk, keranjang belanja, checkout, pembayaran simulasi, hingga pengelolaan pesanan.

Aplikasi memiliki dua antarmuka utama:
1. Customer Storefront
2. Admin Dashboard

### 1.1 Product Goals

- Membangun aplikasi e-commerce fullstack yang fungsional.
- Mengimplementasikan RESTful API yang aman dan terstruktur.
- Mengelola transaksi menggunakan database relasional.
- Menerapkan authentication dan role-based authorization.
- Mengimplementasikan checkout dengan transaksi database yang konsisten.
- Menyediakan dashboard admin untuk operasional toko.
- Menghasilkan proyek portofolio yang siap didemonstrasikan.

### 1.2 Non-Goals

Fitur berikut tidak termasuk MVP:

- Multi-vendor marketplace
- Native mobile application
- AI recommendation engine
- Real-time chat
- Complex warehouse management
- Microservices
- Real shipping carrier integration
- Real-money production payment processing

### 1.3 Success Criteria

- Customer dapat melakukan registrasi dan login.
- Customer dapat mencari dan membeli produk.
- Keranjang tersimpan di database.
- Checkout menghasilkan order yang valid.
- Sistem mencegah pembelian melebihi stok.
- Admin dapat mengelola produk dan pesanan.
- Sistem dapat diakses melalui deployment publik.
- Pengujian alur kritis berhasil dijalankan.

---

## 2. TARGET USERS

### 2.1 Guest

Pengunjung yang belum login.

Capabilities:
- Melihat katalog produk
- Mencari produk
- Filter dan sorting produk
- Melihat detail produk
- Register dan login

### 2.2 Customer

Pengguna terdaftar yang dapat berbelanja.

Capabilities:
- Mengelola profil
- Mengelola alamat
- Menambahkan produk ke keranjang
- Mengubah jumlah produk
- Melakukan checkout
- Melihat riwayat pesanan
- Membatalkan pesanan yang memenuhi syarat

### 2.3 Administrator

Pengelola operasional toko.

Capabilities:
- Mengakses dashboard admin
- Mengelola kategori
- Mengelola produk
- Mengunggah gambar produk
- Mengatur harga dan stok
- Mengelola status pesanan
- Melihat ringkasan penjualan

---

## 3. PRODUCT SCOPE

### 3.1 MVP — Priority P0

1. Authentication & Authorization
2. Product Catalog
3. Product Detail
4. Search, Filter & Sorting
5. Shopping Cart
6. Address Management
7. Checkout
8. Simulated Payment
9. Order Management
10. Product Management
11. Category Management
12. Inventory Management
13. Admin Dashboard
14. Responsive UI
15. Automated Testing

### 3.2 Phase 2 — Priority P1

- Midtrans Sandbox Integration
- Wishlist
- Product Reviews
- Product Ratings
- Coupons & Discounts
- Product Variants
- Email Notifications
- Inventory Adjustment History
- Advanced Sales Analytics

### 3.3 Future — Priority P2

- Shipping API Integration
- Refund Workflow
- Customer Support Tickets
- Recommendation Engine
- Advanced Reporting

---

## 4. TECHNOLOGY STACK

### 4.1 Frontend

| Technology | Purpose |
|---|---|
| Vue 3 | Frontend Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Vue Router | Routing |
| Pinia | State Management |
| Tailwind CSS v4 | Styling |
| Axios | HTTP Client |
| VeeValidate + Zod | Form Validation |
| Lucide Icons | Icon Library |
| Vitest | Unit Testing |
| Vue Test Utils | Component Testing |
| Playwright | E2E Testing |

### 4.2 Backend

| Technology | Purpose |
|---|---|
| Node.js LTS | Runtime |
| TypeScript | Programming Language |
| Express.js | REST API Framework |
| Prisma ORM | Database Access |
| MySQL 8 | Relational Database |
| Zod | Request Validation |
| Argon2id | Password Hashing |
| Pino | Structured Logging |
| Vitest | Unit Testing |
| Supertest | API Testing |
| OpenAPI 3 | API Documentation |

### 4.3 Infrastructure

- npm Workspaces
- Docker Compose
- MySQL Database
- Cloud Image Storage
- GitHub Actions CI
- HTTPS Deployment
- Environment Variables

---

## 5. SYSTEM ARCHITECTURE

Architecture Pattern: Modular Monolith

```text
Customer / Admin
       |
       v
Vue 3 SPA
       |
       | HTTPS / REST API
       v
Node.js + Express
       |
       +-- Auth Module
       +-- Catalog Module
       +-- Cart Module
       +-- Address Module
       +-- Checkout Module
       +-- Orders Module
       +-- Admin Module
       |
       v
Prisma ORM
       |
       v
MySQL Database
```

### Architecture Principles

- Frontend dan backend dipisahkan.
- Komunikasi melalui REST API.
- Business logic berada di backend.
- Database hanya diakses backend.
- Harga dan stok dihitung serta divalidasi server.
- Gunakan modular monolith.
- Tidak menggunakan microservices pada MVP.
- Semua nominal uang disimpan sebagai integer IDR.

---

## 6. FUNCTIONAL REQUIREMENTS

### 6.1 Authentication

**FR-AUTH-001 — Registration**
- Pengguna mendaftar menggunakan nama, email, password.
- Email harus unik.
- Password minimal 8 karakter.
- Password di-hash menggunakan Argon2id.
- Role default adalah CUSTOMER.

**FR-AUTH-002 — Login**
- Login menggunakan email dan password.
- Menggunakan secure HTTP-only cookie session.
- Endpoint login menerapkan rate limiting.

**FR-AUTH-003 — Logout**
- Session dihapus atau dinonaktifkan.
- Cookie autentikasi dibersihkan.

**FR-AUTH-004 — Authorization**
- Customer tidak boleh mengakses endpoint admin.
- Semua endpoint privat memerlukan session valid.
- Otorisasi dilakukan pada backend.

**FR-AUTH-005 — Profile**
- Customer dapat melihat dan memperbarui profil.

Acceptance Criteria:
- Email duplikat menghasilkan HTTP 409.
- Login gagal menghasilkan HTTP 401.
- Akses tanpa login menghasilkan HTTP 401.
- Akses tanpa izin menghasilkan HTTP 403.
- Logout membuat session tidak valid.

### 6.2 Product Catalog

**FR-PROD-001 — Product Listing**
- Menampilkan produk aktif.
- Menampilkan nama, harga, gambar, dan ketersediaan.
- Mendukung pagination.

**FR-PROD-002 — Search**
- Pencarian berdasarkan nama dan deskripsi.

**FR-PROD-003 — Filtering**
- Berdasarkan kategori.
- Rentang harga minimum dan maksimum.
- Ketersediaan stok.

**FR-PROD-004 — Sorting**
- Newest
- Price Low to High
- Price High to Low
- Name A-Z

**FR-PROD-005 — Product Detail**
- Nama produk
- Deskripsi
- SKU
- Harga
- Gambar
- Stok
- Kategori

Acceptance Criteria:
- Produk nonaktif tidak tampil di katalog publik.
- Filter dan pagination dapat digunakan bersamaan.
- Produk tidak ditemukan menghasilkan HTTP 404.

### 6.3 Shopping Cart

**FR-CART-001 — Add to Cart**
- Customer dapat menambahkan produk aktif.
- Quantity harus bilangan bulat positif.
- Jumlah tidak boleh melebihi stok tersedia.

**FR-CART-002 — Update Cart**
- Customer dapat mengubah quantity.

**FR-CART-003 — Remove Item**
- Customer dapat menghapus item.

**FR-CART-004 — View Cart**
- Menampilkan produk, quantity, harga, subtotal.
- Harga dihitung ulang menggunakan data server.

**FR-CART-005 — Cart Persistence**
- Keranjang tersimpan di database.
- Guest cart tidak wajib pada MVP.

Acceptance Criteria:
- Penambahan produk sama memperbarui quantity.
- Quantity tidak valid ditolak.
- Customer tidak dapat mengakses cart orang lain.
- Harga dari client tidak dipercaya.

### 6.4 Address Management

**FR-ADDR-001 — Create Address**
- Recipient Name
- Phone Number
- Address Line
- City
- Province
- Postal Code
- Default Address

**FR-ADDR-002 — Update Address**
- Customer dapat memperbarui alamat sendiri.

**FR-ADDR-003 — Delete Address**
- Customer dapat menghapus alamat sendiri.

**FR-ADDR-004 — Default Address**
- Customer dapat menentukan alamat utama.

Acceptance Criteria:
- Field wajib divalidasi.
- Akses alamat milik orang lain ditolak.
- Perubahan alamat tidak mengubah alamat historis order.

### 6.5 Checkout

**FR-CHK-001 — Checkout Preview**
- Memvalidasi isi keranjang.
- Memvalidasi produk aktif.
- Memvalidasi stok.
- Memilih alamat pengiriman.
- Menghitung subtotal, ongkir, diskon, total.
- Ongkir MVP menggunakan nilai tetap yang dapat dikonfigurasi.
- Diskon MVP bernilai nol.

**FR-CHK-002 — Place Order**
- Customer mengirim permintaan checkout.
- Request menyertakan idempotency key.
- Backend memvalidasi ulang harga dan stok.
- Backend membuat order dan order items.
- Backend menyimpan snapshot alamat pengiriman.
- Backend mengurangi stok secara atomik.
- Backend menghapus item keranjang yang dibeli.
- Backend membuat payment record simulasi.
- Backend mengembalikan nomor order.

**FR-CHK-003 — Transaction Safety**
- Checkout menggunakan database transaction.
- Gunakan conditional stock update atau mekanisme setara.
- Sistem mencegah overselling.
- Request checkout berulang tidak menghasilkan order duplikat.

**FR-CHK-004 — Simulated Payment**
- Customer dapat mensimulasikan pembayaran sukses atau gagal.
- Payment status terpisah dari fulfillment status.
- Pembayaran gagal atau pembatalan mengembalikan stok tepat sekali.
- Simulasi pembayaran hanya aktif di lingkungan demo.

Acceptance Criteria:
- Checkout sukses membuat tepat satu order.
- Total dihitung oleh backend.
- Concurrent checkout tidak menyebabkan stok negatif.
- Checkout gagal tidak meninggalkan transaksi parsial.
- Idempotency key yang sama tidak membuat order baru.
- Pembatalan mengembalikan stok tepat sekali.

### 6.6 Order Management

**FR-ORD-001 — Order History**
- Customer dapat melihat riwayat order sendiri.

**FR-ORD-002 — Order Detail**
- Nomor order
- Tanggal
- Produk dan harga saat transaksi
- Alamat pengiriman
- Total
- Payment status
- Fulfillment status

**FR-ORD-003 — Cancel Order**
- Customer dapat membatalkan order belum dibayar.
- Pembatalan bersifat idempotent.

**FR-ORD-004 — Fulfillment**
- Admin memproses order yang sudah dibayar.

Payment Status:
- PENDING
- PAID
- FAILED
- CANCELED

Fulfillment Status:
- PENDING
- PROCESSING
- SHIPPED
- DELIVERED
- CANCELED

Valid Fulfillment Flow:

PENDING -> PROCESSING -> SHIPPED -> DELIVERED

Cancellation:

PENDING -> CANCELED

Acceptance Criteria:
- Customer hanya melihat order sendiri.
- Status transition tidak valid ditolak.
- Order belum dibayar tidak dapat dikirim.
- Order canceled tidak dapat diproses.

### 6.7 Admin Product Management

**FR-ADM-001 — Product CRUD**
- Create
- Read
- Update
- Archive

**FR-ADM-002 — Category CRUD**
- Create
- Update
- Archive

**FR-ADM-003 — Product Images**
- Upload gambar produk.
- Validasi MIME type dan ukuran.
- Menyimpan URL dan metadata gambar.
- Mendukung primary image.

**FR-ADM-004 — Inventory**
- Admin dapat memperbarui stok.
- Stok tidak boleh negatif.

**FR-ADM-005 — Soft Delete**
- Produk yang memiliki riwayat transaksi tidak dihapus permanen.

Acceptance Criteria:
- Hanya admin dapat mengubah katalog.
- SKU duplikat ditolak.
- Harga dan stok negatif ditolak.
- File gambar tidak valid ditolak.

### 6.8 Admin Dashboard

**FR-DASH-001 — Overview**
- Total Orders
- Paid Revenue
- Active Products
- Pending Orders
- Low Stock Products

**FR-DASH-002 — Recent Orders**
- Menampilkan pesanan terbaru.

**FR-DASH-003 — Sales Summary**
- Ringkasan pendapatan berdasarkan order yang sudah dibayar.

Acceptance Criteria:
- Data dihitung dari database.
- Dashboard hanya dapat diakses admin.
- Data kosong menampilkan zero state.

---

## 7. USER FLOWS

### 7.1 Customer Purchase Flow

1. Buka homepage.
2. Browse produk.
3. Cari atau filter produk.
4. Buka detail produk.
5. Login atau register.
6. Tambahkan produk ke cart.
7. Buka cart.
8. Perbarui quantity jika diperlukan.
9. Pilih alamat.
10. Review checkout.
11. Konfirmasi pesanan.
12. Simulasikan pembayaran.
13. Lihat konfirmasi dan riwayat pesanan.

### 7.2 Admin Product Flow

1. Login sebagai admin.
2. Buka admin dashboard.
3. Pilih Products.
4. Tambah atau edit produk.
5. Upload gambar.
6. Atur kategori, harga, stok.
7. Publish produk.
8. Verifikasi produk tampil di storefront.

### 7.3 Admin Order Flow

1. Login admin.
2. Buka Orders.
3. Pilih order yang sudah dibayar.
4. Ubah status menjadi PROCESSING.
5. Ubah status menjadi SHIPPED.
6. Ubah status menjadi DELIVERED.

---

## 8. UI/UX REQUIREMENTS

### 8.1 Public Pages

- /
- /products
- /products/:slug
- /login
- /register
- /404

### 8.2 Customer Pages

- /cart
- /checkout
- /checkout/success/:orderNumber
- /account
- /account/addresses
- /account/orders
- /account/orders/:id

### 8.3 Admin Pages

- /admin
- /admin/products
- /admin/products/new
- /admin/products/:id/edit
- /admin/categories
- /admin/orders
- /admin/orders/:id

### 8.4 Design Direction

Style:
- Modern
- Minimalist
- Clean
- Professional
- Responsive
- Accessible

UI Components:
- Navbar
- Product Card
- Product Grid
- Search Bar
- Filter Sidebar
- Shopping Cart Drawer
- Checkout Form
- Order Summary
- Data Table
- Admin Sidebar
- Dashboard Cards
- Modal
- Toast
- Pagination
- Loading Skeleton
- Empty State
- Error State

UX Requirements:
- Mobile-first responsive layout.
- Navigasi konsisten.
- Form memiliki validasi jelas.
- Feedback setelah aksi pengguna.
- Loading dan error state tersedia.
- Keyboard navigation didukung.
- Tidak ada tombol dekoratif tanpa fungsi.

---

## 9. DATABASE DESIGN

### 9.1 users

- id UUID PK
- name VARCHAR(150)
- email VARCHAR(255) UNIQUE
- password_hash VARCHAR(255)
- role ENUM(CUSTOMER, ADMIN)
- created_at DATETIME
- updated_at DATETIME

### 9.2 sessions

- id UUID PK
- user_id UUID FK
- token_hash VARCHAR(255) UNIQUE
- expires_at DATETIME
- created_at DATETIME

### 9.3 addresses

- id UUID PK
- user_id UUID FK
- recipient_name VARCHAR(150)
- phone VARCHAR(30)
- address_line TEXT
- city VARCHAR(100)
- province VARCHAR(100)
- postal_code VARCHAR(20)
- is_default BOOLEAN
- created_at DATETIME
- updated_at DATETIME

### 9.4 categories

- id UUID PK
- name VARCHAR(150)
- slug VARCHAR(180) UNIQUE
- is_active BOOLEAN
- created_at DATETIME
- updated_at DATETIME

### 9.5 products

- id UUID PK
- category_id UUID FK
- name VARCHAR(255)
- slug VARCHAR(280) UNIQUE
- sku VARCHAR(100) UNIQUE
- description TEXT
- price BIGINT
- stock INT
- is_active BOOLEAN
- created_at DATETIME
- updated_at DATETIME

### 9.6 product_images

- id UUID PK
- product_id UUID FK
- image_url TEXT
- storage_key VARCHAR(255)
- is_primary BOOLEAN
- sort_order INT

### 9.7 carts

- id UUID PK
- user_id UUID FK UNIQUE
- created_at DATETIME
- updated_at DATETIME

### 9.8 cart_items

- id UUID PK
- cart_id UUID FK
- product_id UUID FK
- quantity INT
- UNIQUE(cart_id, product_id)

### 9.9 orders

- id UUID PK
- user_id UUID FK
- order_number VARCHAR(50) UNIQUE
- idempotency_key VARCHAR(150)
- subtotal BIGINT
- shipping_fee BIGINT
- discount_amount BIGINT
- total_amount BIGINT
- payment_status ENUM
- fulfillment_status ENUM
- shipping_address_snapshot JSON
- created_at DATETIME
- updated_at DATETIME
- UNIQUE(user_id, idempotency_key)

### 9.10 order_items

- id UUID PK
- order_id UUID FK
- product_id UUID FK
- product_name VARCHAR(255)
- product_sku VARCHAR(100)
- unit_price BIGINT
- quantity INT
- line_total BIGINT

### 9.11 payments

- id UUID PK
- order_id UUID FK
- provider VARCHAR(50)
- provider_reference VARCHAR(150) NULL
- amount BIGINT
- status ENUM(PENDING, PAID, FAILED, CANCELED)
- paid_at DATETIME NULL
- created_at DATETIME
- updated_at DATETIME

### Database Rules

- Harga dan total tidak boleh negatif.
- Quantity harus lebih dari nol.
- Stok tidak boleh negatif.
- Foreign key harus diterapkan.
- Gunakan index pada kolom pencarian.
- Gunakan Prisma Migrations.
- Data transaksi historis tidak boleh rusak akibat perubahan katalog.

---

## 10. REST API SPECIFICATION

Base URL: /api/v1

### Authentication

POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me

### Catalog

GET    /products
GET    /products/:slug
GET    /categories

### Cart

GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id

### Addresses

GET    /addresses
POST   /addresses
PATCH  /addresses/:id
DELETE /addresses/:id

### Checkout

POST   /checkout/preview
POST   /checkout/orders
POST   /demo/payments/:orderId/succeed
POST   /demo/payments/:orderId/fail

### Orders

GET    /orders
GET    /orders/:id
POST   /orders/:id/cancel

### Admin Products

GET    /admin/products
POST   /admin/products
GET    /admin/products/:id
PATCH  /admin/products/:id
DELETE /admin/products/:id

### Admin Categories

GET    /admin/categories
POST   /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id

### Admin Orders

GET    /admin/orders
GET    /admin/orders/:id
PATCH  /admin/orders/:id/fulfillment

### Admin Dashboard

GET    /admin/dashboard/overview
GET    /admin/dashboard/sales

### Upload

POST   /admin/uploads/products

### Health Check

GET    /health

### Success Response

{
  "success": true,
  "data": {},
  "message": "Operation completed"
}

### Error Response

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  }
}

### HTTP Status Codes

200 — Success
201 — Created
204 — No Content
400 — Bad Request
401 — Unauthorized
403 — Forbidden
404 — Not Found
409 — Conflict
422 — Business Validation Error
429 — Too Many Requests
500 — Internal Server Error

---

## 11. BUSINESS RULES

BR-001: Hanya produk aktif yang dapat dibeli.

BR-002: Quantity cart harus bilangan bulat positif.

BR-003: Harga ditentukan oleh backend.

BR-004: Checkout wajib memvalidasi stok terbaru.

BR-005: Pembuatan order dan pengurangan stok bersifat atomik.

BR-006: Duplicate checkout tidak boleh menghasilkan order ganda.

BR-007: Harga historis order tidak berubah.

BR-008: Customer hanya mengakses resource miliknya.

BR-009: Operasi admin membutuhkan role ADMIN.

BR-010: Produk yang diarsipkan tetap muncul di riwayat transaksi.

BR-011: Order belum dibayar tidak dapat dikirim.

BR-012: Restorasi stok saat pembatalan dilakukan tepat sekali.

BR-013: Payment status terpisah dari fulfillment status.

BR-014: Semua nominal menggunakan integer IDR.

BR-015: Total order yang sudah dibayar tidak dapat diedit langsung.

BR-016: Demo payment harus terisolasi dari live payment.

---

## 12. SECURITY REQUIREMENTS

SEC-001: Password menggunakan Argon2id.

SEC-002: Authentication menggunakan HTTP-only Secure cookies.

SEC-003: Mutasi berbasis cookie dilindungi CSRF protection.

SEC-004: CORS menggunakan allowlist origin.

SEC-005: Input divalidasi menggunakan Zod.

SEC-006: RBAC diterapkan pada backend.

SEC-007: Endpoint login menerapkan rate limiting.

SEC-008: Password hash dan secrets tidak dikirim ke client.

SEC-009: Upload file divalidasi berdasarkan tipe dan ukuran.

SEC-010: Query database menggunakan Prisma.

SEC-011: Security headers dikonfigurasi.

SEC-012: Logging tidak menyimpan password atau session token.

SEC-013: Credentials disimpan di environment variables.

SEC-014: Ownership validation diterapkan pada resource privat.

SEC-015: Demo payment hanya aktif pada lingkungan demo.

SEC-016: Checkout dilindungi dari request duplikat.

---

## 13. NON-FUNCTIONAL REQUIREMENTS

NFR-001: Responsive mulai dari lebar 360px.

NFR-002: Form dan navigasi mendukung aksesibilitas dasar.

NFR-003: Katalog mendukung minimal 1.000 seeded products.

NFR-004: Target p95 API latency di bawah 500ms untuk common read endpoints pada kondisi pengujian yang terdokumentasi.

NFR-005: Semua halaman memiliki loading dan error states.

NFR-006: Backend menggunakan centralized error handler.

NFR-007: Logging menggunakan request ID.

NFR-008: API memiliki versioning.

NFR-009: Local setup dapat direproduksi.

NFR-010: CI menjalankan lint, typecheck, test, dan build.

NFR-011: Environment variables terdokumentasi.

NFR-012: Database migrations terkontrol.

NFR-013: Tidak ada credentials di repository.

NFR-014: Checkout aman terhadap concurrent requests.

NFR-015: Mendukung browser Chrome, Firefox, dan Edge modern.

---

## 14. PROJECT STRUCTURE

shopora/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── router/
│   │   │   ├── stores/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── catalog/
│       │   │   ├── cart/
│       │   │   ├── addresses/
│       │   │   ├── checkout/
│       │   │   ├── orders/
│       │   │   └── admin/
│       │   ├── lib/
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── package.json
│
├── packages/
│   └── shared/
│       └── src/
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── database.md
│   ├── api-spec.md
│   ├── testing.md
│   └── deployment.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md

---

## 15. TESTING STRATEGY

### 15.1 Unit Testing

- Product price calculation
- Cart subtotal calculation
- Order total calculation
- Input validation
- Order status transition
- Inventory restoration

### 15.2 Integration Testing

- Registration dan login
- Authentication dan authorization
- Product CRUD
- Cart persistence
- Checkout transaction
- Insufficient stock
- Duplicate checkout
- Concurrent purchase
- Order ownership
- Payment success/failure
- Cancellation

### 15.3 End-to-End Testing

E2E-001: Register dan login.

E2E-002: Browse dan search katalog.

E2E-003: Add to cart.

E2E-004: Update cart quantity.

E2E-005: Complete checkout.

E2E-006: Simulate payment success.

E2E-007: View order history.

E2E-008: Admin create product.

E2E-009: Admin update inventory.

E2E-010: Admin process order.

### Test Rules

- Gunakan database testing terpisah.
- Reset database test secara terkontrol.
- Gunakan deterministic fixtures.
- Test authorization dan negative cases.
- CI gagal apabila critical tests gagal.
- Prioritaskan checkout, stok, dan pembayaran.

---

## 16. DEVELOPMENT ROADMAP

### Sprint 1 — Foundation

Tasks:
- Setup monorepo
- Setup Vue + Express
- Setup TypeScript
- Setup MySQL + Prisma
- Setup design system
- Implement authentication
- Setup CI

Deliverable:
Functional authentication and application skeleton.

### Sprint 2 — Product Catalog

Tasks:
- Category CRUD
- Product CRUD
- Image upload
- Product listing
- Product detail
- Search
- Filtering
- Sorting
- Pagination

Deliverable:
Functional storefront catalog.

### Sprint 3 — Cart & Checkout

Tasks:
- Shopping cart
- Address management
- Checkout preview
- Transactional checkout
- Order persistence
- Simulated payment
- Customer order history

Deliverable:
End-to-end purchasing workflow.

### Sprint 4 — Admin & Deployment

Tasks:
- Admin dashboard
- Order fulfillment
- Automated testing
- Bug fixes
- API documentation
- Deployment
- Demo data
- GitHub README

Deliverable:
Portfolio-ready MVP.

### Phase 2

- Midtrans Sandbox
- Wishlist
- Reviews
- Coupons
- Email notifications

---

## 17. AI AGENT DEVELOPMENT RULES

AGENT-001: Read this PRD before implementation.

AGENT-002: Implement one module at a time.

AGENT-003: Do not add unapproved features.

AGENT-004: Preserve modular monolith architecture.

AGENT-005: Use MySQL as the database.

AGENT-006: Do not introduce microservices.

AGENT-007: Use TypeScript on frontend and backend.

AGENT-008: Connect UI to real backend APIs.

AGENT-009: Validate every mutation.

AGENT-010: Use Prisma migrations.

AGENT-011: Write tests for critical business rules.

AGENT-012: Run lint, typecheck, tests, and build.

AGENT-013: Never hardcode credentials.

AGENT-014: Update documentation after interface changes.

AGENT-015: Never claim untested functionality is complete.

AGENT-016: Report modified files and test results.

AGENT-017: Do not overwrite unrelated code.

AGENT-018: Maintain responsive and accessible UI.

AGENT-019: Backend is authoritative for price and stock.

AGENT-020: Ask approval before expanding MVP scope.

---

## 18. DEFINITION OF DONE

Sebuah fitur dianggap selesai apabila:

- Sesuai dengan functional requirements.
- Frontend dan backend terintegrasi.
- Input validation diterapkan.
- Authentication dan authorization berfungsi.
- Error dan loading state tersedia.
- Test terkait berhasil.
- Typecheck dan lint berhasil.
- Tidak mengekspos data sensitif.
- Dokumentasi diperbarui.
- Fitur telah diverifikasi secara manual.

---

## 19. MVP RELEASE CHECKLIST

- [ ] Authentication works
- [ ] RBAC works
- [ ] Product catalog works
- [ ] Product search and filters work
- [ ] Product details work
- [ ] Cart persists
- [ ] Address management works
- [ ] Checkout totals are correct
- [ ] Checkout prevents overselling
- [ ] Duplicate checkout is prevented
- [ ] Orders persist correctly
- [ ] Payment simulation works
- [ ] Order history works
- [ ] Admin product CRUD works
- [ ] Admin category CRUD works
- [ ] Admin fulfillment works
- [ ] Dashboard metrics are correct
- [ ] Critical tests pass
- [ ] API documentation is available
- [ ] Responsive UI is verified
- [ ] Demo deployment is live
- [ ] README is complete
- [ ] No secrets are committed

---

## 20. PORTFOLIO DELIVERABLES

1. Public GitHub repository
2. Live storefront demo
3. Admin demo account
4. Seeded sample products
5. Architecture diagram
6. Database ERD
7. API documentation
8. Automated tests
9. Deployment guide
10. Responsive screenshots
11. Short demonstration video
12. Professional README

---

## 21. RISKS & MITIGATIONS

### RISK-001 — Inventory Overselling
Mitigation:
Atomic stock updates and transactional checkout.

### RISK-002 — Duplicate Orders
Mitigation:
Idempotency keys and unique constraints.

### RISK-003 — Unauthorized Access
Mitigation:
Server-side RBAC and ownership validation.

### RISK-004 — Scope Creep
Mitigation:
Strict MVP boundaries.

### RISK-005 — Payment Inconsistency
Mitigation:
Explicit payment states and idempotent handling.

### RISK-006 — Deployment Complexity
Mitigation:
Docker Compose and environment documentation.

### RISK-007 — AI Agent Code Defects
Mitigation:
Small tasks, code review, automated testing, and verification.

---

## 22. FINAL PROJECT OBJECTIVE

Build Shopora as a complete and maintainable
single-vendor e-commerce web application.

The project must demonstrate:

- Vue.js frontend development
- TypeScript proficiency
- Node.js and Express REST API development
- MySQL relational database design
- Secure authentication and authorization
- Shopping cart and checkout implementation
- Transactional order processing
- Inventory consistency
- Admin dashboard development
- Automated testing
- Production-minded deployment

END OF PRD
  
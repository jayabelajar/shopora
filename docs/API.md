# Shopora REST API

Base URL: `/api/v1`. Semua respons memakai bentuk `{ success, data, message }` atau `{ success, error }`. Endpoint privat memakai cookie session HTTP-only. Mutasi dari browser mengirim header `X-CSRF-Token` yang sama dengan cookie `shopora_csrf`.

## Public and authentication

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register customer |
| POST | `/auth/login` | Create session (rate-limited) |
| POST | `/auth/logout` | Revoke current session |
| GET/PATCH | `/auth/me` | Read/update profile |
| GET | `/categories` | Active categories |
| GET | `/products` | Search, filter, sort, paginate catalog |
| GET | `/products/:slug` | Product detail |

Product query parameters: `search`, `category`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`, and `limit`.

## Customer

| Method | Path | Description |
|---|---|---|
| GET | `/cart` | Persistent cart |
| POST | `/cart/items` | Add product and quantity |
| PATCH/DELETE | `/cart/items/:id` | Update/remove owned cart item |
| GET/POST | `/addresses` | List/create owned addresses |
| PATCH/DELETE | `/addresses/:id` | Update/delete owned address |
| POST | `/checkout/preview` | Validate cart/address and calculate totals |
| POST | `/checkout/orders` | Idempotent transactional checkout |
| GET | `/orders` | Owned order history |
| GET | `/orders/:id` | Owned order detail |
| POST | `/orders/:id/cancel` | Cancel eligible unpaid order |
| POST | `/demo/payments/:orderId/succeed` | Simulate paid result |
| POST | `/demo/payments/:orderId/fail` | Simulate failed result and restore stock |

## Administrator

| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard/overview` | Metrics, recent orders, low stock |
| GET | `/admin/dashboard/sales` | Paid sales summary |
| GET/POST | `/admin/products` | List/create products |
| GET/PATCH/DELETE | `/admin/products/:id` | Detail/update/archive product |
| GET/POST | `/admin/categories` | List/create categories |
| PATCH/DELETE | `/admin/categories/:id` | Update/archive category |
| GET | `/admin/orders` | All orders |
| GET | `/admin/orders/:id` | Admin order detail |
| PATCH | `/admin/orders/:id/fulfillment` | Advance valid fulfillment state |
| POST | `/admin/uploads/products` | JPEG/PNG/WebP upload, maximum 5 MB |

Valid fulfillment sequence: `PENDING → PROCESSING → SHIPPED → DELIVERED`. An order must be paid before fulfillment advances.

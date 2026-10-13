# CraveKart REST API Specification

Welcome to the **CraveKart API Documentation**. The API follows standard RESTful principles with JSON request bodies and consistent response structures.

## Base URLs
- Local Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

---

## Response Envelopes

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token & HttpOnly cookie | No |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer token) |
| `PUT` | `/api/auth/profile` | Update user name, phone, or password | Yes |
| `POST` | `/api/auth/forgot-password`| Send password reset instructions | No (Rate limited) |
| `POST` | `/api/auth/reset-password` | Set new password using token | No |

---

## Restaurant Endpoints (`/api/restaurants`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/restaurants` | List restaurants | `search`, `cuisine`, `minRating`, `maxDeliveryTime`, `priceRange`, `vegOnly`, `sort`, `page`, `limit` |
| `GET` | `/api/restaurants/featured` | Top restaurants for homepage | None |
| `GET` | `/api/restaurants/:idOrSlug` | Full restaurant details with menu | None |

---

## Food & Category Endpoints (`/api/foods`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/foods/popular` | Popular dishes for homepage | None |
| `GET` | `/api/foods/categories` | Categories with item counts | None |
| `GET` | `/api/foods/search` | Global search across restaurants and dishes | `q` |
| `GET` | `/api/foods/:id` | Dish details with customizations | None |

---

## Coupon Endpoints (`/api/coupons`)

| Method | Endpoint | Description | Body / Parameters |
|---|---|---|---|
| `GET` | `/api/coupons/active` | Get all active, unexpired coupons | None |
| `POST` | `/api/coupons/validate` | Validate code against cart subtotal | `{ "code": "CRAVE50", "subtotal": 500 }` |

---

## Order Management Endpoints (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/orders` | Create order with server price check | Customer |
| `GET` | `/api/orders/my-orders` | Paginated customer orders history | Customer |
| `GET` | `/api/orders/:identifier` | Order tracking by ID or Order Number | Customer / Admin |
| `POST` | `/api/orders/:id/cancel` | Cancel order before food prep | Customer / Admin |

---

## Payment Endpoints (`/api/payments`)

| Method | Endpoint | Description | Verification |
|---|---|---|---|
| `POST` | `/api/payments/verify` | Verify Razorpay payment signature | HMAC SHA256 signature match |
| `POST` | `/api/payments/webhook` | Webhook receiver for Razorpay events | Webhook secret HMAC |

---

## User Profile Endpoints (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/addresses` | List saved delivery addresses | Customer |
| `POST` | `/api/users/addresses` | Add new delivery address | Customer |
| `PUT` | `/api/users/addresses/:id` | Edit delivery address | Customer |
| `DELETE` | `/api/users/addresses/:id` | Delete delivery address | Customer |
| `GET` | `/api/users/favorites` | List favorite restaurants | Customer |
| `POST` | `/api/users/favorites/toggle` | Toggle bookmark on restaurant/dish | Customer |

---

## Admin Endpoints (`/api/admin`)
*All admin endpoints require `Role = ADMIN`.*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Aggregated sales, order counts, customer counts from database |
| `GET` | `/api/admin/orders` | Admin orders list with status and customer search |
| `PATCH` | `/api/admin/orders/:id/status` | Update order status with valid transition enforcement |
| `GET` | `/api/admin/restaurants` | View partner restaurants |
| `POST` | `/api/admin/restaurants` | Create new partner restaurant |
| `PUT` | `/api/admin/restaurants/:id` | Update restaurant details and operating hours |
| `GET` | `/api/admin/foods` | List dishes |
| `POST` | `/api/admin/foods` | Add dish to restaurant menu |
| `PUT` | `/api/admin/foods/:id` | Update dish pricing and stock status |
| `GET` | `/api/admin/coupons` | List all promotional coupons |
| `POST` | `/api/admin/coupons` | Create new promotional coupon |
| `PUT` | `/api/admin/coupons/:id` | Update coupon active status or limits |
| `GET` | `/api/admin/users` | List registered customers |
| `PATCH` | `/api/admin/users/:id/status` | Activate or suspend customer account |
| `GET` | `/api/admin/audit-logs` | Retrieve immutable administrative audit trail |

# CraveKart | Good Food. Delivered Fresh.

![CraveKart Banner](https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80)

**CraveKart** is a production-ready, full-stack online food delivery platform built with a modern light-theme visual design, responsive layouts across desktop, tablet, and mobile devices, secure Node.js/Express REST backend, PostgreSQL & SQLite Prisma ORM integration, customer account management, live order tracking, and a comprehensive administrative management dashboard.

---

## 🎨 Visual Identity & Design System

- **Primary Brand Color:** Warm Orange (`#F97316`)
- **Secondary:** Deep Charcoal (`#242424`)
- **Background:** Off-White (`#FAFAF8`)
- **Surface:** Pure White (`#FFFFFF`)
- **Text:** Dark Charcoal (`#222222`) / Secondary Gray (`#737373`)
- **Status Indicators:** Success Green (`#16A34A`), Danger Red (`#DC2626`), Warning Amber (`#F59E0B`)
- **Typography:** Plus Jakarta Sans & Inter
- **Icons:** Lucide React

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query, Lucide Icons, Axios |
| **Backend** | Node.js v22, Express.js, TypeScript, REST API Architecture, Zod validation |
| **Database** | PostgreSQL & SQLite with Prisma ORM 5.x |
| **Security & Auth** | JWT Authentication, Argon2/bcrypt password hashing, HttpOnly cookies, RBAC, Rate Limiting, Helmet |
| **Payments** | Razorpay Integration (with HMAC SHA-256 signature verification & Sandbox test mode), Cash on Delivery (COD) |
| **Testing** | Vitest, Supertest (18/18 API tests + Frontend unit test suite) |
| **DevOps** | Docker, Docker Compose, Multi-stage Dockerfiles, Nginx SPA Reverse Proxy |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** v20.x or v22.x
- **npm** v10+

### 2. Installation
Clone the repository and install dependencies in both client and server:

```bash
# In the project root:
cd server
npm install
npx prisma generate --schema=prisma/schema.sqlite.prisma
npx prisma db push --schema=prisma/schema.sqlite.prisma
npm run db:seed

cd ../client
npm install
```

### 3. Run the Development Servers

In terminal 1 (Backend API):
```bash
cd server
npm run dev
# Starts backend server on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Starts Vite frontend on http://localhost:3000
```

Open your browser at `http://localhost:3000` to browse CraveKart!

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Customer** | `rahul@example.com` | `Password123!` | Ordering, Saved Addresses, Tracking, Favorites |
| **Admin** | `admin@cravekart.com` | `AdminPassword123!` | Management Console, Catalog CRUD, Order Transitions, Metrics, Audit Logs |

*(Quick 1-click fill buttons are also available on the Sign In page for instant testing).*

---

## 🧪 Running Automated Tests

### Backend Test Suite (Vitest + Supertest)
```bash
cd server
npm test
```
*Covers health endpoints, user registration/login, restaurant/food filtering, active coupons, atomic checkout with COD, customer order history, and RBAC protection on administrative routes.*

### Frontend Test Suite (Vitest)
```bash
cd client
npm test
```
*Covers shopping cart calculations, taxes, delivery thresholds, and coupon discount caps.*

---

## 📦 Docker & PostgreSQL Deployment

To run with live PostgreSQL container via Docker Compose:

```bash
docker compose up -d --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 📂 Project Architecture

```
cravekart/
├── client/                     # Frontend React TypeScript Application
│   ├── public/                 # Static assets & SVG icons
│   └── src/
│       ├── components/
│       │   ├── common/         # Button, Input, Modal, Badge, Skeleton, EmptyState
│       │   ├── layout/         # Navbar, Footer, LocationModal
│       │   ├── food/           # FoodCard, FoodCustomizationModal, VegBadge
│       │   └── restaurant/     # RestaurantCard
│       ├── context/            # AuthContext, CartContext, LocationContext, ToastContext
│       ├── layouts/            # RootLayout, CustomerLayout, AdminLayout
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── RestaurantsPage.tsx
│       │   ├── RestaurantDetailPage.tsx
│       │   ├── CartPage.tsx
│       │   ├── CheckoutPage.tsx
│       │   ├── OrderTrackingPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── customer/       # Orders, Addresses, Favorites, Profile
│       │   └── admin/          # Metrics Dashboard, Orders, Restaurants, Foods, Coupons, Users, Audit Logs
│       ├── services/           # Axios API services
│       └── types/              # TypeScript interfaces
├── server/                     # Backend Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Production PostgreSQL schema
│   │   ├── schema.sqlite.prisma# Standalone local development schema
│   │   └── seed.ts             # Comprehensive database seed script
│   ├── src/
│   │   ├── config/             # DB client, env validation
│   │   ├── controllers/        # Auth, Restaurant, Food, Cart, Order, Payment, User, Admin
│   │   ├── middleware/         # JWT Auth, RBAC, Rate Limiting, Error Handling
│   │   ├── routes/             # REST route declarations
│   │   ├── utils/              # Password hashing, Razorpay integration, Audit Logger
│   │   ├── app.ts              # Express setup & security headers
│   │   └── server.ts           # Graceful shutdown entrypoint
│   └── tests/                  # Integration tests
├── docs/
│   ├── API.md                  # Complete REST API specification
│   └── DEPLOYMENT.md           # Production deployment guide
├── docker-compose.yml          # Containerized deployment
├── Dockerfile.client           # Multi-stage frontend Dockerfile with Nginx
├── Dockerfile.server           # Multi-stage backend Dockerfile
├── .env.example                # Documented environment template
└── README.md
```

---

## 🔒 Security Best Practices
- Strict input validation with **Zod**
- Password hashing with **bcryptjs** (10 salt rounds)
- Role-Based Access Control enforcing `CUSTOMER` vs `ADMIN`
- Payment validation via **server-side cryptographic HMAC SHA-256 signatures**
- Cross-restaurant cart isolation protecting against multi-vendor delivery conflicts
- Rate limiting on authentication routes to mitigate brute-force attempts
- Centralized audit logging for administrative actions

---

## 📄 License
This project is open-source under the MIT License.

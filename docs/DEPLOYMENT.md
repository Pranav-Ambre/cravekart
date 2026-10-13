# CraveKart Deployment & Production Guide

This guide details instructions for deploying CraveKart to production environments.

---

## 1. Prerequisites
- Docker & Docker Compose OR Node.js v20+ / v22+
- Managed PostgreSQL database (e.g. AWS RDS, Neon, Supabase, DigitalOcean Managed PostgreSQL)
- Domain with SSL certificate (HTTPS)
- Razorpay Merchant Account (for live Indian payment processing)
- Resend API key (for automated order receipts and transactional emails)

---

## 2. Environment Variables Checklist

Ensure the following variables are configured in production:

| Variable | Description | Example / Note |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | API Server port | `5000` |
| `CLIENT_URL` | Frontend origin for CORS | `https://cravekart.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/cravekart?sslmode=require` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Random string >= 32 characters |
| `COOKIE_SECRET` | Secret key for signed cookies | Random string >= 32 characters |
| `RAZORPAY_KEY_ID` | Razorpay Live Key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Live Key Secret | Obtained from Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET`| Secret used to sign payment webhooks | Set in Razorpay Webhooks settings |
| `RESEND_API_KEY` | Resend API key for emails | Optional in dev, required in production |
| `EMAIL_FROM` | Verified sender address | `orders@cravekart.com` |

---

## 3. Database Migration Commands

Before starting the server in production, apply database schema changes:

```bash
# In the server directory:
npx prisma migrate deploy --schema=prisma/schema.prisma
```

> **Warning:** Do not run `prisma db seed` in production. Seed scripts contain mock demo credentials and test orders intended for local development only.

---

## 4. Docker Deployment (Recommended)

1. Clone repository to your server:
   ```bash
   git clone https://github.com/your-org/cravekart.git
   cd cravekart
   ```

2. Copy and populate the production `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your production credentials
   ```

3. Launch via Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. Verify services:
   ```bash
   docker compose ps
   curl http://localhost:5000/health
   ```

---

## 5. Security Checklist
- [x] SSL/TLS termination enabled (HTTPS)
- [x] HttpOnly, SameSite cookies enabled
- [x] Rate limiting enabled on authentication endpoints
- [x] CORS configured strictly to `CLIENT_URL`
- [x] Razorpay cryptographic signature verification enabled on all payment callbacks
- [x] Role-Based Access Control protecting all administrative endpoints
- [x] Sensitive parameters excluded from client responses and application logs

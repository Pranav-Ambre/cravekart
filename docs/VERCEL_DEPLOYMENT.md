# CraveKart - Complete Vercel Deployment Guide

This guide provides step-by-step instructions to deploy **CraveKart** to production using **Vercel**.

---

## 🏗️ Architecture Overview

CraveKart is a full-stack application:
- **Frontend**: React + Vite SPA
- **Backend API**: Express.js + REST API
- **Database**: PostgreSQL with Prisma ORM

On Vercel, serverless execution environments are ephemeral and read-only. Therefore, you need a **cloud-hosted PostgreSQL database** (free options: **Neon** or **Supabase**).

---

## 📋 Step 1: Provision a Free Cloud PostgreSQL Database

You need a live PostgreSQL connection string (`postgresql://...`).

### Option A: Neon (Recommended - 60 seconds setup)
1. Go to [https://neon.tech](https://neon.tech) and sign up for a free account.
2. Click **Create Project** -> Name it `cravekart` -> Select region closest to you.
3. Copy the **Connection String** from the dashboard. It looks like:
   ```env
   postgresql://alex:AbC123xyz@ep-cool-flower-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Go to **Project Settings** -> **Database** -> **Connection string** (URI).
3. Copy the pooled connection string.

---

## 📦 Step 2: Push Schema & Seed Data to Cloud Database

Before deploying to Vercel, push the database schema and load sample restaurants, dishes, coupons, and demo accounts into your cloud database from your local machine:

1. Open a terminal in the `server` directory:
   ```bash
   cd server
   ```

2. Temporarily set your cloud `DATABASE_URL` in `server/.env`:
   ```env
   DATABASE_URL="your_neon_or_supabase_postgres_connection_string"
   ```

3. Push the PostgreSQL schema:
   ```bash
   npx prisma db push --schema=prisma/schema.prisma
   ```

4. Run the seed script to populate demo data:
   ```bash
   npx tsx prisma/seed.ts
   ```

*Your cloud PostgreSQL database is now loaded with all CraveKart partner restaurants, dishes, and coupons!*

---

## 🚀 Step 3: Deploying on Vercel

You can deploy using either the **Vercel Web Dashboard** (via GitHub) or the **Vercel CLI**.

---

### Method A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "chore: prepare for Vercel deployment"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [https://vercel.com/new](https://vercel.com/new).
   - Select your `cravekart` repository and click **Import**.

3. **Configure Project Settings**:
   - **Framework Preset**: Other (or auto-detected Vite)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/dist`

4. **Add Environment Variables**:
   Under **Environment Variables**, add:

   | Variable Name | Value | Note |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://...` | Your Neon / Supabase connection string |
   | `JWT_SECRET` | `super-secret-cravekart-jwt-key-min-32-chars-long` | Random secure string |
   | `COOKIE_SECRET` | `super-secret-cravekart-cookie-key-56789` | Random secure string |
   | `NODE_ENV` | `production` | Set to production |
   | `RAZORPAY_KEY_ID` | `rzp_test_placeholder_key_id` | Or your Razorpay test/live key |
   | `RAZORPAY_KEY_SECRET` | `rzp_test_placeholder_key_secret` | Or your Razorpay test/live secret |

5. Click **Deploy**.
   Vercel will install dependencies, generate the Prisma client, compile the Vite frontend, package the serverless API, and provide you with a live URL (e.g. `https://cravekart.vercel.app`)!

---

### Method B: Deploy via Vercel CLI (From Terminal)

1. Install the Vercel CLI globally (if not already installed):
   ```powershell
   npm install -g vercel
   ```

2. Run `vercel` from the project root:
   ```powershell
   vercel
   ```

3. Follow the interactive prompts:
   - *Set up and deploy?* -> `Y`
   - *Which scope?* -> Select your account
   - *Link to existing project?* -> `N`
   - *What's your project's name?* -> `cravekart`
   - *In which directory is your code located?* -> `./`
   - *Want to modify settings?* -> `N`

4. Set your production environment variables:
   ```powershell
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```

5. Deploy to production:
   ```powershell
   vercel --prod
   ```

---

## ⚡ Alternative Architecture: Split Deployment (Vercel + Render)

Many developers prefer hosting the frontend on Vercel's global edge CDN while running Express as a persistent 24/7 web service on **Render** or **Railway**:

1. **Deploy Backend to Render** ([https://render.com](https://render.com)):
   - New **Web Service** -> Connect GitHub repo.
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate --schema=prisma/schema.prisma && npm run build`
   - Start Command: `npm start`
   - Add Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
   - Render gives you an API URL: `https://cravekart-api.onrender.com`.

2. **Deploy Frontend to Vercel** ([https://vercel.com](https://vercel.com)):
   - New Project -> Root Directory: `client`.
   - Framework Preset: **Vite** (auto-detected).
   - Environment Variable:
     ```env
     VITE_API_URL=https://cravekart-api.onrender.com/api
     ```
   - Click **Deploy**.

---

## ✅ Post-Deployment Verification Checklist

1. Open your live Vercel URL in your browser.
2. Test browsing restaurants and categories.
3. Test signing in with the demo customer account (`rahul@example.com` / `Password123!`).
4. Add dishes to cart and test the checkout flow using Cash on Delivery (COD) or Razorpay Test Sandbox.
5. Check live order tracking at `/orders/:orderNumber`.
6. Log in with the admin account (`admin@cravekart.com` / `AdminPassword123!`) and verify the Admin Dashboard at `/admin`.

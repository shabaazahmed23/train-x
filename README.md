# FITLIFE — Premium Gym Membership Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-12%2F12%20Passing-brightgreen?style=flat)](file:///Users/mohamedrashid/Documents/train-x/tests)

A full-stack, enterprise-grade Gym Membership Management platform engineered for premium fitness clubs and designed as a college final-year capstone project. 

FITLIFE replaces disparate spreadsheets and basic landing pages with an integrated, secure, database-backed ecosystem featuring an administrative command center, member portal, turnstile QR check-in kiosk, dynamic plan calculator, coupon engine, trainer booking calendar, and an **automated membership expiry & renewal email engine** with idempotency safeguards and date preservation.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Database Entity Relationship Diagram (ERD)](#2-database-entity-relationship-diagram-erd)
3. [Core Feature Breakdown](#3-core-feature-breakdown)
4. [Technology Stack](#4-technology-stack)
5. [Prerequisites](#5-prerequisites)
6. [Local Installation & Setup](#6-local-installation--setup)
7. [Database Setup, Migration & Seeding](#7-database-setup-migration--seeding)
8. [Administrator Credentials & RBAC](#8-administrator-credentials--rbac)
9. [Automated Expiry & Renewal Reminders Engine](#9-automated-expiry--renewal-reminders-engine)
10. [Transactional Email Configuration & Local Mock](#10-transactional-email-configuration--local-mock)
11. [Running Automated Tests](#11-running-automated-tests)
12. [API Reference](#12-api-reference)
13. [Production Deployment Guide](#13-production-deployment-guide)
14. [Security & Data Isolation Measures](#14-security--data-isolation-measures)
15. [Known Limitations & Extensibility Roadmap](#15-known-limitations--extensibility-roadmap)

---

## 1. System Architecture

FITLIFE adopts a modular monolithic architecture within Next.js 16 (App Router) to maximize developer velocity, type safety, and runtime performance while avoiding microservice latency.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                               │
├───────────────────────┬───────────────────────┬────────────────────────┤
│     Public Website    │     Member Portal     │      Admin Portal      │
│  - Luxury Landing UI  │  - Biometrics Tracker │  - Real-time KPIs      │
│  - Live Calculator    │  - Plan Renewal (UPI) │  - Member CRUD & CSV   │
│  - Trainers & Offers  │  - QR Gate Pass       │  - Turnstile Kiosk     │
│  - Booking Inquiries  │  - Workout & Diet     │  - Email Dispatch Logs │
└───────────┬───────────┴───────────┬───────────┴────────────┬───────────┘
            │                       │                        │
            ▼                       ▼                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SERVER ACTIONS & API                          │
│  - Server-Side Authorization (`requireAuth`, `requireAdmin`)           │
│  - Form & Payload Validation (Zod + Decimal Coercion)                  │
│  - Safe Next.js Cache Revalidation (`safeRevalidate`)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             SERVICE TIER                               │
├───────────────────────┬───────────────────────┬────────────────────────┤
│    Identity / Auth    │   Reminders Engine    │     Email Service      │
│  - bcrypt Salted Hash │  - 7d, 3d, 1d, 0d cron│  - Resend REST API     │
│  - `jose` HS256 JWT   │  - Idempotency guard  │  - Local Mock Dev Inbox│
│  - HTTP-Only Cookies  │  - Renewal cancellation - Luxury HTML Templates│
└───────────┬───────────┴───────────┬───────────┴────────────┬───────────┘
            │                       │                        │
            ▼                       ▼                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            DATA ACCESS TIER                            │
│  - Prisma ORM 6.19 Client (Connection Pool Singleton)                 │
│  - PostgreSQL 16 Normalized Database (24 Models)                       │
│  - Atomic Multi-Table Transactions for Payments & Renewals             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Entity Relationship Diagram (ERD)

FITLIFE's schema is fully normalized and enforces strict referential integrity across 24 models:

```mermaid
erDiagram
    User ||--o| MemberProfile : "has profile"
    User ||--o| Trainer : "linked trainer profile"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "initiates admin actions"
    User ||--o{ PasswordResetToken : "requests reset"

    MemberProfile ||--o{ Membership : "holds"
    MemberProfile ||--o{ MembershipRenewal : "applies renewals"
    MemberProfile ||--o{ Payment : "makes payments"
    MemberProfile ||--o{ Attendance : "logs visits"
    MemberProfile ||--o{ TrainerBooking : "books sessions"
    MemberProfile ||--o{ WorkoutPlan : "assigned"
    MemberProfile ||--o{ DietPlan : "assigned"
    MemberProfile ||--o{ FitnessProgressRecord : "logs biometrics"
    MemberProfile ||--o{ CouponRedemption : "redeems"

    MembershipPlan ||--o{ Membership : "defines tier"
    MembershipPlan ||--o{ MembershipRenewal : "target plan"

    Membership ||--o{ EmailReminder : "triggers reminders"
    Membership ||--o{ Payment : "paid via"

    Trainer ||--o{ TrainerAvailability : "defines weekly hours"
    Trainer ||--o{ TrainerBooking : "conducts sessions"
    Trainer ||--o{ WorkoutPlan : "designs"

    WorkoutTemplate ||--o{ WorkoutExercise : "contains"
    WorkoutPlan ||--o{ WorkoutExercise : "contains"

    Offer ||--o{ CouponRedemption : "tracked by"

    EmailReminder ||--o| EmailLog : "logged in audit"
```

---

## 3. Core Feature Breakdown

### A. Public Website (`/`)
- **Theme & Aesthetics:** Charcoal Black (`#111111`), Deep Graphite (`#1A1A1A`), Warm White (`#F5F5F0`), and Restrained Brushed Gold (`#C8A96B`).
- **Dynamic Content:** Real-time database queries fetch active plans, certified coaches, and promotional discounts without requiring recompilation.
- **Interactive Price Calculator:** Members can select their desired plan, tenure, and add-on personal coaching to inspect an instant itemized breakdown in INR (`₹`).
- **Legal Compliance:** Dedicated `/privacy` and `/terms` disclosure routes with physical facility liability disclaimers.

### B. Admin Command Center (`/admin`)
- **Executive Telemetry:** 5 KPI cards (Total Members, Active Roster, Expiring Soon, Collected Revenue, Today's Footfall) + Recharts dynamic revenue growth and membership tier distribution graphs.
- **Member Management (`/admin/members`):** Search by name, email, or membership ID (`FL-2026-XXXX`), filter by status, and **1-Click CSV Export** via `/api/admin/export-members`.
- **Turnstile Attendance Kiosk (`/admin/attendance`):** Scan or enter a Member ID. Validates active membership status, denies expired passes, and rejects duplicate turnstile scans within a configurable 2-hour window.
- **Plan & Offer Engine (`/admin/plans`, `/admin/offers`):** Create, publish, archive, and adjust pricing. Configure fixed or percentage coupons with minimum spend thresholds and server-side redemption validation.
- **Trainer & Booking Grid (`/admin/trainers`, `/admin/bookings`):** Add coaches, define hourly working slots, and manage member appointments with automated overlap conflict rejection.
- **Workout & Diet Designer (`/admin/workouts`, `/admin/diets`):** Reusable workout blueprints with exercise sets/reps/rest periods and structured meal schedules (with medical nutrition disclaimers).
- **Email Dispatch Log (`/admin/emails`):** Complete audit ledger displaying dispatch status (`SENT`, `FAILED`, `PENDING`), attempt counts, provider message IDs, and a **"Retry Failed Email"** action.
- **System Settings (`/admin/settings`):** Configurable gym name, operational hours, currency code, contact details, and adjustable reminder lead intervals (e.g. `[7, 3, 1, 0]`).

### C. Member Portal (`/member`)
- **Personalized Roster:** Real-time remaining days badge, status indicator (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`), and assigned tier details.
- **Digital QR Turnstile Pass (`/member/attendance`):** Instant QR code containing the member's cryptographically linked membership ID for gate entry.
- **Frictionless Renewal (`/member/renew`):** Select higher tiers or extend current subscriptions. Supports coupon codes (`FITLIFE20`), instant savings calculation, and **automatic early-renewal duration preservation**.
- **Biometrics Tracker (`/member/progress`):** Log weight, body fat percentage, and muscle mass with visual progress charting over time.
- **Printable Invoices (`/member/payments`):** Modal invoice generator with tax calculation, gym credentials, and printable receipt layout.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4 (App Router) | Server-Side Rendering, Server Actions, Dynamic API Routes |
| **Language** | TypeScript 5 (Strict) | End-to-end type safety, runtime type guards |
| **Styling** | Tailwind CSS 4 + Lucide Icons | Luxury dark palette, responsive flex/grid layouts |
| **Database** | PostgreSQL 16 | Relational data persistence, foreign key cascades |
| **ORM** | Prisma 6.19.3 | Type-safe queries, schema migrations, transactions |
| **Authentication** | `jose` (JWT) + `bcryptjs` | HTTP-only cookie sessions, salted password hashing |
| **Charts** | Recharts 2.15 | Executive revenue and biometric progress visualization |
| **Email Service** | Resend REST API | Branded HTML transactional dispatches with mock fallback |
| **Validation** | Zod + Decimal Coercion | Server-side request sanitization |

---

## 5. Prerequisites

Before installing, ensure the following utilities are installed on your host machine:
- **Node.js**: v18.18.0 or newer (tested on v24.18.0)
- **npm**: v9.0.0 or newer
- **PostgreSQL**: v14.0 or newer (tested on PostgreSQL 16)
- **Git**

---

## 6. Local Installation & Setup

1. **Clone the repository and enter the directory:**
   ```bash
   git clone <repository_url> fitlife
   cd fitlife
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment template to `.env`:
   ```bash
   cp .env.example .env
   ```

   Verify or adjust the variables in `.env`:
   ```env
   # Database connection string
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/fitlife_db?schema=public"

   # Authentication session secret (must be at least 32 characters)
   JWT_SECRET="fitlife-super-secret-jwt-encryption-key-production-2026-secure"

   # App Base URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Cron Endpoint Authentication Secret
   CRON_SECRET="fitlife-cron-secret-super-secure-token-9988"

   # Transactional Email (Resend)
   # Leave blank or mock during local development to use the built-in Mock Logger
   RESEND_API_KEY=""
   EMAIL_FROM="FITLIFE Fitness Club <reminders@fitlife.club>"
   ENABLE_EMAIL_MOCK="true"

   # Razorpay Online Payment Gateway (Test Mode)
   RAZORPAY_KEY_ID="rzp_test_placeholder"
   RAZORPAY_KEY_SECRET="rzp_secret_placeholder"
   ```

---

## 7. Database Setup, Migration & Seeding

### Option A: Local PostgreSQL Setup
1. **Ensure PostgreSQL is running locally:**
   ```bash
   brew services start postgresql@16 # macOS
   sudo systemctl start postgresql  # Linux
   ```
2. **Create the local database:**
   ```bash
   createdb fitlife_db
   ```
3. **Push schema & seed:**
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

### Option B: Supabase Hosted PostgreSQL Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database** → **Connection string** → **Prisma**.
3. Copy the pooled connection string into `DATABASE_URL` (port 6543) and direct connection string into `DIRECT_URL` (port 5432) in your `.env`.
4. Deploy the schema and seed sample data:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

---

## 8. Administrator Credentials & RBAC

The seed script creates a privileged administrator and 4 diverse sample member accounts:

### Administrator Account
- **Email:** `admin@fitlife.com`
- **Password:** `Admin@Fitlife2026!`
- **Role:** `ADMIN`
- **Permissions:** Unrestricted access to `/admin/*`, member CRUD, plan authoring, financial ledger, attendance kiosk, and email audit logs.

### Sample Member Accounts
| Name | Email | Password | Tier | Status / Days |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Verma** | `rahul.verma@example.com` | `Member@123` | Gold Performance | Active (60 Days) |
| **Sneha Patel** | `sneha.patel@example.com` | `Member@123` | Platinum Elite | Expiring Soon (3-4 Days) |
| **Arjun Mehta** | `arjun.mehta@example.com` | `Member@123` | Silver Fitness | Expired (-15 Days) |
| **Kavita Rao** | `kavita.rao@example.com` | `Member@123` | Black Diamond VIP | Active (340 Days) |

---

## 9. Automated Expiry & Renewal Reminders Engine

The automated reminder system is a core feature of FITLIFE, engineered to ensure gym members are notified proactively before their access lapses.

### Configurable Schedule
By default, the engine evaluates memberships against four lead milestones:
- **7 Days Prior:** First gentle courtesy notice.
- **3 Days Prior:** Urgent reminder highlighting remaining days.
- **1 Day Prior:** Final day renewal warning.
- **0 Days (Expiry Day):** Access lapse notification with renewal CTA.

### Engine Idempotency & Duplicate Prevention
- A composite unique constraint in Prisma (`@@unique([membershipId, reminderType])`) guarantees that **no member can ever receive the same reminder twice**, even if the cron job executes multiple times per day.
- When an administrator or member completes a renewal, any pending reminders for the previous subscription are automatically flagged as `CANCELLED`, preventing stale warnings.

### Triggering the Reminder Job
1. **Automated Scheduled Cron (Vercel Cron):**
   Configured in `vercel.json` to execute daily at midnight UTC:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/reminders",
         "schedule": "0 0 * * *"
       }
     ]
   }
   ```

2. **Triggering via cURL (Secure Authorization):**
   ```bash
   curl -X GET http://localhost:3000/api/cron/reminders \
     -H "Authorization: Bearer fitlife-cron-secret-super-secure-token-9988"
   ```

3. **Manual Trigger from Admin Dashboard:**
   Administrators can trigger an on-demand batch run directly from `/admin/emails` with a single click.

---

## 10. Transactional Email Configuration & Local Mock

FITLIFE includes an enterprise email architecture with zero external runtime dependencies during development:

### Local Development Mock Mode (`ENABLE_EMAIL_MOCK=true`)
When `RESEND_API_KEY` is absent or `ENABLE_EMAIL_MOCK` is active:
1. No external HTTP requests are made.
2. A beautiful, formatted terminal notification block displays the recipient, subject, template, and message ID.
3. The email is logged to the PostgreSQL `EmailLog` and `EmailReminder` tables with a mock ID (e.g. `mock-email-1791894072794-x2i6xt`).
4. Administrators can inspect the rendered message directly in `/admin/emails`.

### Production Resend Configuration
To enable live transactional delivery:
1. Sign up at [Resend](https://resend.com) and verify your gym's custom domain (e.g. `fitlife.club`).
2. Add your DNS records (SPF, DKIM, DMARC) in your domain registrar.
3. Set your production environment variables:
   ```env
   RESEND_API_KEY="re_1234567890abcdef"
   EMAIL_FROM="FITLIFE Notifications <info@fitlife.club>"
   ENABLE_EMAIL_MOCK="false"
   ```

---

## 11. Running Automated Tests

FITLIFE includes a comprehensive automated test suite testing business logic, RBAC, date calculations, booking overlap prevention, attendance validation, and the reminder idempotency engine:

```bash
npm test
```

### Test Suite Summary:
```
✔ Authentication: hashes and verifies passwords correctly
✔ Session: creates and verifies JWT session cookies with RBAC payload
✔ Attendance Engine: rejects expired membership check-in attempt
✔ Attendance Engine: validates active member pass and blocks duplicate within 2h
✔ Booking Engine: detects overlapping trainer booking time slots
✔ Business Logic: calculateRemainingDays returns accurate date differentials
✔ Business Logic: early renewal date preservation calculation
✔ Business Logic: server-side coupon validation enforces constraints
✔ Reminder Engine: maps day thresholds to appropriate ReminderType enum
✔ Email Service: builds branded luxury HTML email template
✔ Email Service: mock development provider dispatches and records to DB without errors
✔ Reminder Engine: automated reminder job executes and enforces idempotency

ℹ tests 12 | pass 12 | fail 0 (Duration: ~310ms)
```

---

## 12. API Reference

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/cron/reminders` | `GET` / `POST` | Bearer Token (`CRON_SECRET`) or Admin Session | Scans active memberships and dispatches due expiry notices |
| `/api/admin/export-members` | `GET` | Admin Session Cookie | Generates and downloads sanitized CSV of gym member records |
| Server Action: `loginAction` | `POST` | Public | Validates credentials, sets HTTP-only JWT cookie |
| Server Action: `registerAction` | `POST` | Public | Registers member account, generates unique Member ID |
| Server Action: `checkInAttendanceAction` | `POST` | Admin Session Cookie | Validates turnstile pass, checks active status, prevents duplicate scans |
| Server Action: `renewMembershipAction` | `POST` | Member / Admin Session | Calculates renewal price, validates coupon, preserves remaining days |
| Server Action: `createTrainerBookingAction` | `POST` | Member Session | Validates trainer schedule and blocks overlapping appointments |

---

## 13. Production Deployment Guide

### Deploying to Vercel + Neon / Supabase PostgreSQL

1. **Database Setup:**
   - Provision a PostgreSQL database instance via [Neon](https://neon.tech), [Supabase](https://supabase.com), or [AWS RDS].
   - Copy the connection string with SSL parameters (`?sslmode=require`).

2. **Vercel Project Creation:**
   - Import the repository into the Vercel dashboard.
   - Configure Environment Variables in **Project Settings → Environment Variables**:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `CRON_SECRET`
     - `NEXT_PUBLIC_APP_URL` (Set to your custom domain or `https://<project>.vercel.app`)
     - `RESEND_API_KEY`
     - `EMAIL_FROM`
     - `ENABLE_EMAIL_MOCK` (`false` for real emails)

3. **Run Production Build:**
   ```bash
   npm run build
   ```
   *The build executes Turbopack compilation, strict TypeScript verification, and route generation.*

4. **Execute Remote Migrations & Seed:**
   From your local terminal pointing to the production database:
   ```bash
   DATABASE_URL="<production-url>" npx prisma db push
   DATABASE_URL="<production-url>" npx tsx prisma/seed.ts
   ```

---

## 14. Security & Data Isolation Measures

- **Zero Plaintext Credentials:** Passwords salted with 10 rounds of `bcryptjs`.
- **HTTP-Only Cookie Isolation:** JWT tokens are signed via `jose` HS256 and stored with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` in production.
- **Server-Side Authorization:** Every mutation independently calls `requireAuth()` or `requireAdmin()` on the server. Frontend button hiding is never treated as security.
- **Tenant Isolation:** In `/member/*` routes, queries strictly filter by `member.userId === session.userId`. Members cannot view or mutate another member's records.
- **Financial Integrity:** Transaction sums are calculated server-side based on database plan pricing and validated discounts. Client-supplied price payloads are strictly ignored.

---

## 15. Known Limitations & Extensibility Roadmap

- **Online Payment Provider Sandbox:** The application includes Razorpay order structure signatures and test UPI/Cash confirmation. Live production capture requires adding verified webhook endpoints (`/api/webhooks/razorpay`) with signature verification before going live with real credit cards.
- **Biometric Hardware Integration:** The attendance kiosk currently supports optical QR scanning and manual Member ID input. Hardware turnstile relays (via Wiegand or RS485 controllers) can be integrated by adding an MQTT or WebSocket event listener to `checkInAttendanceAction`.
- **Automated SMS Reminders:** Email dispatches are currently the primary reminder channel. WhatsApp Business API / Twilio SMS can be attached to `src/lib/reminders.ts` alongside email dispatches.

---

## License

Developed for academic evaluation and commercial gym deployment. © 2026 FITLIFE Fitness Club. All Rights Reserved.

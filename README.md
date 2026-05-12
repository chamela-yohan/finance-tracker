# Finance Tracker

A full-stack personal finance and budget tracking application built with Next.js 16, Prisma, and PostgreSQL.

## Live Demo
[https://finance-tracker-ten-bay.vercel.app/](https://finance-tracker-ten-bay.vercel.app/)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Recharts |
| Backend | Next.js Route Handlers (REST API) |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Prisma 7 |
| Authentication | Clerk |
| State Management | TanStack React Query |
| Deployment | Vercel |

## Features

- **Authentication** — Sign up, login, logout via Clerk
- **Transactions** — Add, edit, delete, filter income & expenses
- **Categories** — Custom income/expense categories with colors
- **Budgets** — Monthly budget limits with real-time progress tracking
- **Dashboard** — Visual charts and financial summary
  - Expense distribution (donut chart)
  - Monthly income vs expenses (bar chart)
  - Budget vs actual spending (grouped bar chart)
  - Recent transactions list

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- Clerk account

### 1. Clone the repository
```bash
git clone https://github.com/chamela-yohan/finance-tracker.git
cd finance-tracker
```

### 2. Install dependencies
```bash
npm install
```

> This automatically runs `prisma generate` via the `postinstall` hook.

### 3. Set up environment variables

Copy the example file and fill in your values:
```bash
cp .env.example .env.local
```

```env
# Database (from Neon dashboard)
DATABASE_URL="postgresql://...?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://...?sslmode=require"

# Clerk (from Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

### 4. Run database migrations
```bash
npx prisma migrate dev
```

### 5. Run the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Setup

This project uses [Neon](https://neon.tech) serverless PostgreSQL.

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project named `finance-tracker`
3. Copy the **pooled** connection string → `DATABASE_URL`
4. Copy the **direct** connection string → `DIRECT_URL`

## Authentication Setup

This project uses [Clerk](https://clerk.com) for authentication.

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the API keys to your `.env.local`
4. Set up a webhook endpoint pointing to `/api/webhooks/clerk`
5. Subscribe to `user.created` and `user.deleted` events

## Project Structure

finance-tracker/
├── app/
│   ├── (auth)/          # Sign in / Sign up pages
│   ├── (dashboard)/     # Protected dashboard pages
│   │   ├── dashboard/   # Main dashboard with charts
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── categories/
│   └── api/             # REST API routes
│       ├── dashboard/
│       ├── transactions/
│       ├── budgets/
│       ├── categories/
│       └── webhooks/
├── components/
│   ├── dashboard/       # Chart components
│   ├── transactions/    # Transaction form + filters
│   ├── budgets/         # Budget card + form
│   ├── categories/      # Category form
│   └── layout/          # Sidebar, navbar, mobile menu
├── hooks/               # React Query hooks
├── lib/                 # Prisma client, utils, navigation
└── prisma/
    └── schema.prisma    # Database schema

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Dashboard summary + charts data |
| GET | `/api/transactions` | List transactions (with filters) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/[id]` | Update transaction |
| DELETE | `/api/transactions/[id]` | Delete transaction |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Delete category |
| GET | `/api/budgets` | List budgets with spending |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/[id]` | Update budget amount |
| DELETE | `/api/budgets/[id]` | Delete budget |
| POST | `/api/webhooks/clerk` | Clerk user sync webhook |

## ER Diagram

[View ER Diagram →](https://dbdiagram.io/d/6a02c7ef7a923b947287bbd3)
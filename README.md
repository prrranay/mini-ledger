# Smart Mini Ledger

A production-grade, multi-user SaaS personal finance dashboard designed to track income, expenses, and overall financial health. Built with a focus on performance, minimal UI, and engineering excellence.

## Project Overview

Smart Mini Ledger goes beyond a simple CRUD application. It provides users with a comprehensive view of their finances through:
- **Intelligent Dashboard**: Visualizes cash flow and category distribution using `Recharts`.
- **Financial Health Score**: An algorithm evaluates your savings rate and expense trends.
- **Smart Insights**: Generates natural language insights (e.g., "You saved 31% this month").
- **Activity Log**: Audits all actions taken on the account.
- **Async Notifications**: Sends emails when new transactions are recorded without blocking the UI.

## Architecture & Technical Decisions

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Auth.js (NextAuth v5) - Google & Credentials
- **Styling**: Tailwind CSS v4 & shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Validation**: Zod + React Hook Form

### Key Engineering Improvements (Over Standard AI Scaffolding)
1. **Integer Money Storage**: AI initially proposed `Float` for money. This was corrected to use `Int` (storing cents) to avoid JavaScript floating-point math errors. A dedicated `currency.ts` utility handles conversions to/from UI displays.
2. **Unified Dashboard API**: Instead of fetching charts, metrics, and activities separately, a unified `/api/dashboard` endpoint calculates everything securely on the server, drastically reducing client-side waterfalls.
3. **Non-Blocking Emails**: Email notifications via Nodemailer are dispatched asynchronously (`Promise.resolve().then(...)`) so transaction creation remains fast and responsive. Failures are logged gracefully to the Activity table.
4. **Debounced Querying & Optimistic Updates**: TanStack Query is configured to cache data and automatically invalidate upon successful mutations, yielding a snappy UX.

## Folder Structure

```
mini-ledger/
├── prisma/                 # Database schema and migrations
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (dashboard)/    # Authenticated routes (Dashboard, Transactions, Settings)
│   │   ├── api/            # API endpoints (auth, dashboard, export, settings, transactions)
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── components/         # Reusable UI components (shadcn, layout, modals)
│   ├── lib/                # Core utilities (activity, currency, email, insights, prisma)
│   └── providers/          # React context providers (TanStack Query)
└── .env                    # Environment variables
```

## Setup & Environment Variables

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure your `.env` file (see `.env.example`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/miniledger?schema=public"
   AUTH_SECRET="your_secure_random_secret"
   SMTP_HOST="smtp.mailtrap.io"
   SMTP_PORT="2525"
   SMTP_USER="user"
   SMTP_PASS="pass"
   ```

3. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## AI Usage

This project was built with the assistance of advanced agentic AI, specifically optimizing boilerplate generation, UI scaffolding (shadcn/ui), and validation logic.

**Where AI was corrected by engineering oversight:**
- **Floating Point Math**: Corrected to integer cents.
- **Email Blocking**: Refactored to prevent SMTP latency from affecting the user experience.
- **Component Reusability**: Extracted scattered logic into centralized `lib/` utilities.

## Future Improvements

- Add comprehensive CSV Import with robust row validation and error reporting.
- Implement more granular OAuth providers (GitHub, Apple).
- Expand financial prediction algorithms.

# Prompt: Build Full SaaS App for TaxMate

Build a full production-ready SaaS application called **TaxMate** – an AI-powered tax assistant for freelancers and small businesses.

---

## 🔧 Tech Stack

- **Frontend**: Next.js + TailwindCSS
- **Hosting**: Vercel
- **Auth**: Supabase Auth (magic link)
- **Database**: Supabase Postgres
- **Billing**: Stripe Checkout
- **Async Jobs**: Fly.io worker for long-running form generation
- **Short tasks**: Supabase Edge Functions

---

## 🧠 Core Features

- Upload expenses via CSV or Plaid (mocked)
- Categorize expenses using OpenAI (optional)
- Generate IRS forms (Schedule C, 1099s)
- Export audit-safe PDF reports
- Async processing via Fly.io worker and job polling

---

## ✅ Auth & Access Control

- Supabase Auth with magic link (email login)
- Do **not** query `auth.users` directly — instead, capture the user ID from the Supabase session and store all user metadata in a public `users` table managed by your application
- All `/app/*` routes are protected
- Users must be subscribed to access form generation and reports
- Implement verbose error handling for Supabase queries — especially for row-level security (RLS) errors, which are silent and return empty sets
- For every table with RLS, enable policies **and** use `supabase.auth.getUser()` to ensure the current session has access

---

## 💳 Stripe Billing Plans

- Free Trial: $0 (7-day limited use)
- Solo Plan: $20/month
- Seasonal Plan: $149/year

Store subscription info in Supabase `subscriptions` table and enforce access controls.

---

## 🗃 Supabase Schema

### `users`
- id (UUID from auth), email, created_at
- Ensure this is created at signup via `onAuthStateChange` or Supabase edge function

### `transactions`
- id, user_id, date, amount, merchant, category, notes
- All RLS policies should restrict access to rows with `user_id = auth.uid()`

### `form_jobs`
- id, user_id, type (schedule_c, 1099), status (queued, processing, done, error), result_url

### `subscriptions`
- id, user_id, stripe_customer_id, plan, status, started_at, ends_at

---

## ⚙️ Fly.io Worker

- Exposes POST `/generate-form` endpoint (accepts user_id + form type)
- Connects to Supabase, fetches transaction data
- Generates PDF forms and uploads to S3 or Supabase Storage
- Writes back `result_url` and job status
- Polling from frontend via job ID
- Use a centralized configuration system for all env/secrets (e.g., `config.ts`, `config.go`)
- Enforce presence of required environment variables at startup
- Always add secrets, `.env`, and configuration files to `.gitignore`
- Always commit and push changes to version control (e.g., GitHub) after each functional unit is completed

---

## 🔄 Frontend Polling for Job Status

- After form submission, insert into `form_jobs`
- Show a loading spinner while polling job status via `/api/form-jobs/:id`
- When `status = complete`, display download link from `result_url`
- If `status = error`, show retry option with friendly message

---

## 🤖 AI-Powered Expense Categorization (Optional)

- Add "Auto-Categorize" button in transaction dashboard
- Batch send user transactions to Supabase Edge Function using OpenAI API
- LLM assigns categories such as: meals, travel, software, home office, misc
- Results update `transactions.category` and flag `categorization_source = 'ai'`
- Secure access to only user's own transactions

---

## 🧰 Admin Tools (Optional)

- Admin-only dashboard at `/admin`:
  - View users, subscriptions, and job statuses
  - Trigger retries or deletions for jobs
- Stripe webhook receiver (edge function `/stripe-webhook`):
  - Listen for `checkout.session.completed`, `customer.subscription.updated`
  - Update `subscriptions` table
  - Validate requests using Stripe signature header

---

## 📊 Monitoring & Notifications

- Log job failures to Supabase `errors` table or send to Sentry
- Send user email upon job completion using Resend or Postmark

---

## 🧭 Routes to Implement

- `/`: Marketing landing page
- `/pricing`: Pricing with Stripe checkout links
- `/login`, `/signup`, `/account`
- `/app`: Dashboard for uploading, viewing, and managing tax data
- `/support`, `/privacy`
- `/admin`: Admin dashboard (optional, access-controlled)

---

## 🚀 Deployment Scripts

The agent may create deploy scripts and attempt deployments (e.g., Fly.io, Vercel, Supabase), but must always validate required parameters. Configuration should always be sourced from `.env` or centralized config files.

### 1. Supabase

```bash
# Initialize Supabase
npx supabase init

# Apply schema
npx supabase db push

# Start Supabase locally (for dev)
npx supabase start
```

### 2. Fly.io Worker

```bash
# Create and deploy worker
flyctl launch --name taxmate-worker --region ord
flyctl secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...

# Deploy updates
flyctl deploy
```

### 3. Vercel Frontend

```bash
# Install Vercel CLI
npm i -g vercel

# Set up project
vercel link
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY

# Deploy
vercel --prod
```

### 4. .gitignore

Ensure the following are added to `.gitignore`:
```
.env
.env.local
.env.*.local
supabase/.env
supabase/secrets.*
config.ts
config.js
```

---

## ✨ UX and Quality

- Use Tailwind for consistent styling
- Add loading states for job polling
- Ensure all routes work, protected routes redirect unauthenticated users
- Stripe plans should be testable and working
- Clearly handle Supabase RLS errors with friendly messages
- Centralize environment variable definitions and fail-fast on missing configuration
- Always commit and push working functionality to version control incrementally
- Validate required parameters before executing deploys or scripts; source them from `.env` or config files

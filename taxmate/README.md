# TaxMate

AI-powered tax assistant for freelancers and small businesses.

## Features

- 📊 **Transaction Management**: Upload and categorize business expenses
- 🤖 **AI Categorization**: Automatically categorize expenses using OpenAI
- 📄 **Form Generation**: Generate IRS Schedule C and 1099 forms
- 💳 **Subscription Billing**: Integrated with Stripe for payments
- 🔒 **Secure Authentication**: Magic link authentication via Supabase
- ⚡ **Async Processing**: Background job processing with Fly.io

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL), Supabase Edge Functions
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Background Jobs**: Fly.io (Go worker)
- **Deployment**: Vercel (frontend), Fly.io (worker)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI
- Stripe CLI
- Fly.io CLI
- Vercel CLI

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/taxmate.git
cd taxmate
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# External Services
FLY_WORKER_URL=https://taxmate-worker.fly.dev
OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
```

4. Set up Supabase:
```bash
chmod +x scripts/setup-supabase.sh
./scripts/setup-supabase.sh
```

5. Set up Stripe:
```bash
chmod +x scripts/setup-stripe.sh
./scripts/setup-stripe.sh
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses the following main tables:

- `users`: User profiles linked to Supabase Auth
- `transactions`: Business expense records
- `form_jobs`: Background job queue for form generation
- `subscriptions`: Stripe subscription data

All tables have Row Level Security (RLS) enabled.

## Deployment

### Deploy Frontend to Vercel

```bash
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

### Deploy Worker to Fly.io

```bash
chmod +x scripts/deploy-worker.sh
./scripts/deploy-worker.sh
```

### Continuous Deployment

The project includes GitHub Actions workflows for automatic deployment:

1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `FLY_API_TOKEN`
   - All the environment variables from `.env.local`

2. Push to the `main` branch to trigger deployment.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│   Supabase   │────▶│  PostgreSQL │
│  Frontend   │     │   Backend    │     │   Database  │
└─────────────┘     └──────────────┘     └─────────────┘
      │                    │                     │
      │                    │                     │
      ▼                    ▼                     │
┌─────────────┐     ┌──────────────┐            │
│   Stripe    │     │   Fly.io     │────────────┘
│  Payments   │     │   Worker     │
└─────────────┘     └──────────────┘
```

## API Routes

- `/api/auth/callback` - Supabase auth callback
- `/api/stripe/create-checkout-session` - Create Stripe checkout
- `/api/stripe/webhook` - Handle Stripe webhooks
- `/api/categorize` - AI expense categorization
- `/api/forms/generate` - Initiate form generation
- `/api/forms/status/[jobId]` - Check job status

## Worker Endpoints

- `/generate-form` - Process form generation jobs
- `/health` - Health check endpoint

## Security

- All API routes are protected with authentication
- Database access controlled via Row Level Security
- Sensitive operations require active subscriptions
- Environment variables stored securely
- HTTPS enforced in production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@taxmate.app or open an issue in this repository.
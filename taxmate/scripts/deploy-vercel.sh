#!/bin/bash

# Deploy to Vercel
echo "Deploying TaxMate to Vercel..."

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | xargs)
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Set environment variables
echo "Setting environment variables..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production < <(echo "$NEXT_PUBLIC_SUPABASE_URL")
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < <(echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY")
vercel env add SUPABASE_SERVICE_ROLE_KEY production < <(echo "$SUPABASE_SERVICE_ROLE_KEY")
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production < <(echo "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
vercel env add STRIPE_SECRET_KEY production < <(echo "$STRIPE_SECRET_KEY")
vercel env add STRIPE_WEBHOOK_SECRET production < <(echo "$STRIPE_WEBHOOK_SECRET")
vercel env add NEXT_PUBLIC_APP_URL production < <(echo "$NEXT_PUBLIC_APP_URL")
vercel env add FLY_WORKER_URL production < <(echo "$FLY_WORKER_URL")
vercel env add OPENAI_API_KEY production < <(echo "$OPENAI_API_KEY")
vercel env add RESEND_API_KEY production < <(echo "$RESEND_API_KEY")

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo "Deployment complete!"
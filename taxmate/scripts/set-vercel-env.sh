#!/bin/bash

# Source environment variables
set -e
set -a
source .env.local
set +a

# Add environment variables to Vercel
echo "Setting environment variables in Vercel..."

echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production 2>/dev/null || true
echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production 2>/dev/null || true
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production 2>/dev/null || true
echo "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production 2>/dev/null || true
echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production 2>/dev/null || true
echo "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production 2>/dev/null || true
echo "$NEXT_PUBLIC_APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production 2>/dev/null || true
echo "$FLY_WORKER_URL" | vercel env add FLY_WORKER_URL production 2>/dev/null || true
echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production 2>/dev/null || true
echo "$RESEND_API_KEY" | vercel env add RESEND_API_KEY production 2>/dev/null || true
echo "$NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID" | vercel env add NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID production 2>/dev/null || true
echo "$NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID" | vercel env add NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID production 2>/dev/null || true

echo "Environment variables set successfully!"
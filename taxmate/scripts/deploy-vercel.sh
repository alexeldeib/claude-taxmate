#!/bin/bash

# Deploy to Vercel
echo "Deploying TaxMate to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Link to Vercel project if not already linked
if [ ! -f .vercel/project.json ]; then
    echo "Linking to Vercel project..."
    vercel link --yes
fi

# Load environment variables from .env.local
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local..."
  while IFS='=' read -r key value; do
    # Skip empty lines and comments
    if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
      # Trim whitespace and export the variable
      key=$(echo "$key" | xargs)
      # Remove trailing newlines and whitespace from value
      value=$(echo "$value" | sed 's/[[:space:]]*$//')
      export "$key=$value"
    fi
  done < .env.local
fi

# Set environment variables
echo "Setting environment variables..."
[ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ] && echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --yes 2>/dev/null || true
[ ! -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes 2>/dev/null || true
[ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ] && echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production --yes 2>/dev/null || true
[ ! -z "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ] && echo "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production --yes 2>/dev/null || true
[ ! -z "$STRIPE_SECRET_KEY" ] && echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production --yes 2>/dev/null || true
[ ! -z "$STRIPE_WEBHOOK_SECRET" ] && echo "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production --yes 2>/dev/null || true
[ ! -z "$NEXT_PUBLIC_APP_URL" ] && echo "$NEXT_PUBLIC_APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production --yes 2>/dev/null || true
[ ! -z "$FLY_WORKER_URL" ] && echo "$FLY_WORKER_URL" | vercel env add FLY_WORKER_URL production --yes 2>/dev/null || true
[ ! -z "$OPENAI_API_KEY" ] && echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production --yes 2>/dev/null || true
[ ! -z "$RESEND_API_KEY" ] && echo "$RESEND_API_KEY" | vercel env add RESEND_API_KEY production --yes 2>/dev/null || true

# Deploy to production
echo "Deploying to production..."
vercel --prod --yes

echo "Deployment complete!"
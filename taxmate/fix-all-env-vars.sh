#!/bin/bash

echo "Fixing all environment variables with trailing newlines..."

# Array of variables to fix
ENV_VARS=(
  "NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID"
  "NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "OPENAI_API_KEY"
  "RESEND_API_KEY"
  "FLY_WORKER_URL"
  "NEXT_PUBLIC_APP_URL"
)

# Fix each variable
for VAR_NAME in "${ENV_VARS[@]}"; do
  echo "Processing $VAR_NAME..."
  
  # Get the value from .env.local
  VALUE=$(grep "^$VAR_NAME=" .env.local | cut -d'=' -f2 | sed 's/[[:space:]]*$//')
  
  if [ ! -z "$VALUE" ]; then
    echo "  Removing old value..."
    vercel env rm "$VAR_NAME" production --yes 2>/dev/null || true
    
    echo "  Adding clean value..."
    printf "%s" "$VALUE" | vercel env add "$VAR_NAME" production
    echo "  Done!"
  else
    echo "  Variable not found in .env.local, skipping..."
  fi
done

echo "All environment variables fixed!"
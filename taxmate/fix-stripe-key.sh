#!/bin/bash

# Fix Stripe secret key
echo "Fixing Stripe secret key in Vercel..."

# Load the key from .env.local
STRIPE_SECRET_KEY=$(grep "^STRIPE_SECRET_KEY=" .env.local | cut -d'=' -f2 | sed 's/[[:space:]]*$//')

echo "Key length: ${#STRIPE_SECRET_KEY}"
echo "Removing old key..."
vercel env rm STRIPE_SECRET_KEY production --yes || true

echo "Adding clean key..."
printf "%s" "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production

echo "Done!"
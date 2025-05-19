#!/bin/bash

# Setup Stripe
echo "Setting up Stripe..."

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "Stripe CLI not found. Please install from https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Login to Stripe
echo "Logging in to Stripe..."
stripe login

# Create products and prices
echo "Creating products and prices..."

# Create Solo plan
SOLO_PRODUCT=$(stripe products create \
  --name="TaxMate Solo" \
  --description="Monthly subscription for freelancers and solopreneurs" \
  --active \
  --format json | jq -r '.id')

SOLO_PRICE=$(stripe prices create \
  --product=$SOLO_PRODUCT \
  --unit-amount=2000 \
  --currency=usd \
  --recurring[interval]=month \
  --format json | jq -r '.id')

# Create Seasonal plan
SEASONAL_PRODUCT=$(stripe products create \
  --name="TaxMate Seasonal" \
  --description="Annual subscription with advanced features" \
  --active \
  --format json | jq -r '.id')

SEASONAL_PRICE=$(stripe prices create \
  --product=$SEASONAL_PRODUCT \
  --unit-amount=14900 \
  --currency=usd \
  --recurring[interval]=year \
  --format json | jq -r '.id')

# Create webhook endpoint
echo "Creating webhook endpoint..."
WEBHOOK_ENDPOINT=$(stripe webhook_endpoints create \
  --url="https://taxmate.vercel.app/api/stripe/webhook" \
  --enabled-events=checkout.session.completed,customer.subscription.updated,customer.subscription.deleted \
  --format json | jq -r '.id')

WEBHOOK_SECRET=$(stripe webhook_endpoints retrieve $WEBHOOK_ENDPOINT \
  --format json | jq -r '.secret')

echo ""
echo "Stripe setup complete!"
echo ""
echo "Add these to your .env.local file:"
echo "NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID=$SOLO_PRICE"
echo "NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID=$SEASONAL_PRICE"
echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET"
echo ""
echo "Don't forget to add your Stripe API keys:"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "STRIPE_SECRET_KEY=sk_test_..."
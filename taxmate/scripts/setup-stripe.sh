#!/bin/bash

# Setup Stripe
echo "Setting up Stripe..."

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "Stripe CLI not found. Please install from https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Create products and prices
echo "Creating products and prices..."

# Create Solo plan
echo "Creating Solo product..."
SOLO_PRODUCT_RESULT=$(stripe products create \
  --name="TaxMate Solo" \
  --description="Monthly subscription for freelancers and solopreneurs" \
  --active)

SOLO_PRODUCT=$(echo "$SOLO_PRODUCT_RESULT" | grep -o '"id": "[^"]*' | grep -o 'prod_[^"]*' | head -1)
echo "Solo product ID: $SOLO_PRODUCT"

echo "Creating Solo price..."
SOLO_PRICE_RESULT=$(stripe prices create \
  --product=$SOLO_PRODUCT \
  --currency=usd \
  --unit-amount=2000 \
  --recurring.interval=month)

SOLO_PRICE=$(echo "$SOLO_PRICE_RESULT" | grep -o '"id": "[^"]*' | grep -o 'price_[^"]*' | head -1)
echo "Solo price ID: $SOLO_PRICE"

# Create Seasonal plan
echo "Creating Seasonal product..."
SEASONAL_PRODUCT_RESULT=$(stripe products create \
  --name="TaxMate Seasonal" \
  --description="Annual subscription with advanced features" \
  --active)

SEASONAL_PRODUCT=$(echo "$SEASONAL_PRODUCT_RESULT" | grep -o '"id": "[^"]*' | grep -o 'prod_[^"]*' | head -1)
echo "Seasonal product ID: $SEASONAL_PRODUCT"

echo "Creating Seasonal price..."
SEASONAL_PRICE_RESULT=$(stripe prices create \
  --product=$SEASONAL_PRODUCT \
  --currency=usd \
  --unit-amount=14900 \
  --recurring.interval=year)

SEASONAL_PRICE=$(echo "$SEASONAL_PRICE_RESULT" | grep -o '"id": "[^"]*' | grep -o 'price_[^"]*' | head -1)
echo "Seasonal price ID: $SEASONAL_PRICE"

# Update webhook endpoint URL to use actual domain
APP_URL=${NEXT_PUBLIC_APP_URL:-"https://tax.acebutt.xyz"}
WEBHOOK_URL="${APP_URL}/api/stripe/webhook"

# Create webhook endpoint
echo "Creating webhook endpoint at $WEBHOOK_URL..."
WEBHOOK_RESULT=$(stripe webhook_endpoints create \
  --url="$WEBHOOK_URL" \
  --enabled-events="checkout.session.completed" \
  --enabled-events="customer.subscription.updated" \
  --enabled-events="customer.subscription.deleted")

WEBHOOK_ENDPOINT=$(echo "$WEBHOOK_RESULT" | grep -o '"id": "[^"]*' | grep -o 'we_[^"]*' | head -1)
echo "Webhook endpoint ID: $WEBHOOK_ENDPOINT"

# Get webhook secret
if [ ! -z "$WEBHOOK_ENDPOINT" ]; then
    WEBHOOK_SECRET_RESULT=$(stripe webhook_endpoints retrieve $WEBHOOK_ENDPOINT)
    WEBHOOK_SECRET=$(echo "$WEBHOOK_SECRET_RESULT" | grep -o '"secret": "[^"]*' | grep -o 'whsec_[^"]*' | head -1)
else
    echo "Failed to create webhook endpoint"
    WEBHOOK_SECRET=""
fi

echo ""
echo "Stripe setup complete!"
echo ""
echo "Add these to your .env.local file:"
echo "NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID=$SOLO_PRICE"
echo "NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID=$SEASONAL_PRICE"
echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET"
echo ""
echo "Note: Make sure to update the webhook URL if your Vercel deployment URL is different."
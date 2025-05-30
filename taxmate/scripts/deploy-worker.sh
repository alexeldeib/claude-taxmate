#!/bin/bash

# Deploy Worker to Fly.io
echo "Deploying TaxMate Worker to Fly.io..."

cd ../worker

# Check if Fly CLI is installed
if ! command -v flyctl &> /dev/null; then
    echo "Fly CLI not found. Please install from https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Load environment variables
if [ -f ../.env.worker ]; then
  export $(cat ../.env.worker | grep -v '^#' | xargs)
fi

# Check if we're logged in
if ! flyctl auth whoami > /dev/null 2>&1; then
    echo "Not logged in to Fly.io. Running 'flyctl auth login'..."
    flyctl auth login
fi

# Check if app exists
if flyctl apps list | grep -q "taxmate-worker"; then
    echo "App taxmate-worker already exists"
else
    # Create app if it doesn't exist
    echo "Creating Fly app..."
    flyctl launch --name taxmate-worker --region ord --no-deploy
fi

# Set secrets
echo "Setting secrets..."
flyctl secrets set \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# Deploy
echo "Deploying..."
flyctl deploy

echo "Worker deployment complete!"
echo "Worker URL: https://taxmate-worker.fly.dev"

cd ../taxmate
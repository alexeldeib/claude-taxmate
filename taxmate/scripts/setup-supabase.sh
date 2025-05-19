#!/bin/bash

# Setup Supabase
echo "Setting up Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing..."
    brew install supabase/tap/supabase
fi

# Initialize Supabase (if not already initialized)
echo "Initializing Supabase..."
supabase init || true

# Start Supabase locally
echo "Starting Supabase locally..."
supabase start

# Apply migrations
echo "Applying database migrations..."
supabase db push

# Get local credentials
echo ""
echo "Local Supabase credentials:"
supabase status

echo ""
echo "To create a production project:"
echo "1. Go to https://app.supabase.com"
echo "2. Create a new project"
echo "3. Run the migrations: supabase db push --db-url YOUR_DATABASE_URL"
echo "4. Copy the API keys to your .env.local file"
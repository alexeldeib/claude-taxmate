#!/bin/bash

# Setup Supabase
echo "Setting up Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing..."
    brew install supabase/tap/supabase
fi

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if we have required env vars
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: Missing required environment variables."
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    exit 1
fi

# Extract project ID from Supabase URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')
echo "Using Supabase project: $PROJECT_ID"

# Link to the remote project
echo "Linking to Supabase project..."
supabase link --project-ref $PROJECT_ID

# Push migrations to production (will prompt for password)
echo "Applying database migrations..."
echo ""
echo "NOTE: You will be prompted for your database password."
echo "Find this in your Supabase dashboard under Settings > Database"
echo ""
supabase db push

echo ""
echo "Supabase setup complete!"
echo ""
echo "Production database migrations have been applied."
echo ""
echo "Storage buckets will be created automatically when forms are generated."
echo ""
echo "Make sure your .env.local contains:"
echo "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>"
echo "SUPABASE_SERVICE_ROLE_KEY=<your service role key>"
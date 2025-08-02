#!/bin/bash

# Script to set up environment variables in Railway

echo "Setting up environment variables for Railway deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Install it with: npm i -g @railway/cli"
    echo "Then run 'railway login' to authenticate"
    exit 1
fi

# Check if logged in
railway whoami || { echo "Please run 'railway login' first"; exit 1; }

# Get environment variables from .env file
if [ -f .env ]; then
    source .env
fi

# Set the variables in Railway
echo "Adding QuickNode RPC URL..."
if [ -n "$VITE_QUICKNODE_RPC_URL" ]; then
    railway variables set QUICKNODE_RPC_URL="$VITE_QUICKNODE_RPC_URL" --yes
    railway variables set VITE_QUICKNODE_RPC_URL="$VITE_QUICKNODE_RPC_URL" --yes
    echo "✅ Set QuickNode RPC URL"
else
    echo "⚠️ VITE_QUICKNODE_RPC_URL not found in .env file"
    echo "Please manually set QUICKNODE_RPC_URL in Railway dashboard"
fi

echo "Adding Privy credentials..."
if [ -n "$PRIVY_APP_ID" ] && [ -n "$PRIVY_APP_SECRET" ]; then
    railway variables set PRIVY_APP_ID="$PRIVY_APP_ID" --yes
    railway variables set PRIVY_APP_SECRET="$PRIVY_APP_SECRET" --yes
    echo "✅ Set Privy credentials"
else
    echo "⚠️ PRIVY_APP_ID or PRIVY_APP_SECRET not found in .env file"
    echo "Please manually set Privy credentials in Railway dashboard"
fi

echo "Adding Supabase configuration..."
if [ -n "$VITE_SUPABASE_URL" ] && [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
    railway variables set VITE_SUPABASE_URL="$VITE_SUPABASE_URL" --yes
    railway variables set VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" --yes
    echo "✅ Set Supabase configuration"
else
    echo "⚠️ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env file"
    echo "Please manually set Supabase variables in Railway dashboard"
fi

# Set production environment variables
railway variables set NODE_ENV=production --yes
railway variables set PORT=3000 --yes

echo "✅ Set NODE_ENV=production and PORT=3000"
echo ""
echo "Environment variables have been set in Railway."
echo "You can now deploy your application with 'railway up'" 
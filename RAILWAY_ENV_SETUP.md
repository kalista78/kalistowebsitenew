# Setting Up Environment Variables on Railway

To ensure proper functioning of the Kalisto application, you must set the following environment variables in your Railway project:

## Required Environment Variables

Add these variables in the Railway dashboard under your project's Variables tab:

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `QUICKNODE_RPC_URL` | Your QuickNode RPC URL for Solana | `https://warmhearted-wider-paper.solana-mainnet.quiknode.pro/...` |
| `PRIVY_APP_ID` | Your Privy App ID | `cm3hducj402zf5p44sbmdxvg4` |
| `PRIVY_APP_SECRET` | Your Privy App Secret | `3rNKAHBHzrA1NEeeu7b1qaPyRY4tnqXwc2Ykr3HJtegz8gpQzBfZHp5cGYiHLargnh8UqEoWpyCanrnX3YrHfHYt` |
| `PORT` | The port on which the server runs | `3000` |
| `NODE_ENV` | The Node environment | `production` |

## Frontend Environment Variables

For variables that need to be accessible by the frontend (Vite), make sure to add them with the `VITE_` prefix:

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `VITE_QUICKNODE_RPC_URL` | Same as QUICKNODE_RPC_URL above, for frontend usage | `https://warmhearted-wider-paper.solana-mainnet.quiknode.pro/...` |
| `VITE_SUPABASE_URL` | Your Supabase URL | `https://yezdsptmjnggyajyyubs.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## Important Notes

1. **Environment Handling**: Our application is designed to work with both `QUICKNODE_RPC_URL` and `VITE_QUICKNODE_RPC_URL`. If only one is provided, the value will be copied to the other variable at runtime.

2. **Secret Values**: Make sure to keep sensitive values like `PRIVY_APP_SECRET` and `VITE_SUPABASE_ANON_KEY` secure. Railway encrypts these values, but you should still be careful about sharing them.

3. **Updating Values**: If you need to update any environment variables, change them in Railway's Variables tab, and a new deployment will automatically be triggered.

4. **Troubleshooting**: If you're experiencing environment-related issues, check the application logs in Railway to see if the variables are being correctly loaded.

## Setting Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on the "Variables" tab
3. Click "New Variable"
4. Enter the variable name and value
5. Click "Add" to save the variable

After setting all required variables, redeploy your application to ensure they are properly applied. 
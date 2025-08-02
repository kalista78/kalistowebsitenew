# Deploying to Railway

This guide will walk you through deploying the Kalisto application to Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account
2. [Railway CLI](https://docs.railway.app/develop/cli) installed (optional, but recommended)
3. Git repository with your project (already set up)

## Deployment Steps

### 1. Connect Your GitHub Repository

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository (kalista78/kalistowebsite)
5. Railway will automatically detect the configuration

### 2. Configure Environment Variables

Add the following environment variables in the Railway dashboard:

```
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
PORT=3000
NODE_ENV=production
VITE_QUICKNODE_RPC_URL=your_quicknode_rpc_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy the Project

1. Railway will automatically deploy your application when you push to the main branch
2. You can also manually trigger a deployment from the Railway dashboard

### 4. Verify the Deployment

1. Once deployed, Railway will provide a URL for your application
2. Visit the URL to ensure your application is running correctly
3. Check the logs for any errors

## Advanced Configuration

### Custom Domain

To set up a custom domain:

1. Go to the "Settings" tab of your Railway project
2. Click on "Domains"
3. Add your custom domain
4. Update your DNS records as instructed by Railway

### Monitoring

Railway provides built-in logging and monitoring:

1. Go to the "Metrics" tab to view resource usage
2. Go to the "Logs" tab to view application logs

## Troubleshooting

### Common Issues

1. **Build failures**: Check your build logs for errors
2. **Application crashes**: Verify environment variables are correctly set
3. **Missing dependencies**: Ensure all dependencies are in package.json

### Getting Help

If you encounter issues:

1. Check Railway's [documentation](https://docs.railway.app/)
2. Use the `/api/health` endpoint to verify the server is running
3. Review server logs for specific error messages 
import express from 'express';
import cors from 'cors';
import { Connection, ConnectionConfig } from '@solana/web3.js';
import { PrivyClient } from '@privy-io/server-auth';
import { executeJupiterSwap } from './jupiter.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Print all available environment variables for debugging
console.log('Environment variables available:', Object.keys(process.env).join(', '));

// Default fallback for production (using Solana's public RPC)
const FALLBACK_RPC_URL = 'https://api.mainnet-beta.solana.com';

// Get RPC URL from any of the available environment variables
const rpcUrl = process.env.QUICKNODE_RPC_URL || 
               process.env.VITE_QUICKNODE_RPC_URL || 
               (process.env.NODE_ENV === 'production' ? FALLBACK_RPC_URL : undefined);

if (!rpcUrl) {
  console.error('⚠️ Missing QuickNode RPC URL in environment variables. Please set QUICKNODE_RPC_URL or VITE_QUICKNODE_RPC_URL');
  process.exit(1);
}

console.log(`Using RPC URL: ${rpcUrl.substring(0, 20)}...`);

// Default Privy credentials for development only
const DEFAULT_PRIVY_APP_ID = process.env.NODE_ENV === 'production' ? undefined : 'cm3hducj402zf5p44sbmdxvg4';
const DEFAULT_PRIVY_APP_SECRET = process.env.NODE_ENV === 'production' ? undefined : '3rNKAHBHzrA1NEeeu7b1qaPyRY4tnqXwc2Ykr3HJtegz8gpQzBfZHp5cGYiHLargnh8UqEoWpyCanrnX3YrHfHYt';

const privyAppId = process.env.PRIVY_APP_ID || DEFAULT_PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET || DEFAULT_PRIVY_APP_SECRET;

if (!privyAppId || !privyAppSecret) {
  console.error('⚠️ Missing Privy credentials in environment variables. Please set PRIVY_APP_ID and PRIVY_APP_SECRET');
  process.exit(1);
}

// Configure connection
const config: ConnectionConfig = {
  commitment: 'confirmed',
};

// Create the connection
const connection = new Connection(rpcUrl, config);

// Initialize Privy client with appId and appSecret as separate arguments
const privyClient = new PrivyClient(privyAppId, privyAppSecret);

// Enable CORS for frontend - add Railway URLs to allowed origins
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://kalisto-production.up.railway.app', /.+\.railway\.app$/],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers
  });
  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  console.log('Serving static files from:', path.join(__dirname, '../dist'));
}

app.post('/api/swap', async (req, res) => {
  try {
    console.log('Received swap request');
    const { quoteResponse } = req.body;
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    console.log('Request details:', {
      quoteResponse,
      authToken: authToken ? `${authToken.substring(0, 10)}...` : 'none'
    });

    if (!authToken) {
      console.log('No auth token provided');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    if (!quoteResponse) {
      console.log('No quote response provided');
      return res.status(400).json({ error: 'No quote response provided' });
    }

    console.log('Processing swap with quote:', quoteResponse);

    const txid = await executeJupiterSwap(
      connection,
      privyClient,
      authToken,
      quoteResponse
    );

    console.log('Swap successful:', { txid });
    res.json({ txid });
  } catch (error: any) {
    console.error('Swap error details:', {
      error,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: error.message || 'Swap failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    rpcConnected: true
  });
});

// Add a health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    rpcConnected: true
  });
});

// The "catchall" handler: for any request that doesn't
// match an API route, send back React's index.html file.
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Available routes:');
  console.log('- POST /api/swap');
  console.log('- GET /health');
  console.log('- GET /api/health');
});

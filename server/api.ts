import express from 'express';
import { PrivyClient, SolanaSignTransactionRpcInputType, WalletApiSolanaSignTransactionRpcResponseType, WalletWithMetadata } from '@privy-io/server-auth';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { executeJupiterSwap } from './jupiter.js';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Constants
const RPC_URL = process.env.QUICKNODE_RPC_URL;
const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET || !RPC_URL) {
  throw new Error('Missing required environment variables');
}

// Initialize Privy client
const privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

// Initialize Solana connection
const connection = new Connection(RPC_URL);

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Transfer endpoint
app.post('/transfer', async (req, res) => {
  console.log('Received transfer request');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    const { userAddress, recipientAddress, amount } = req.body;

    if (!userAddress || !recipientAddress || amount === undefined) {
      console.error('Missing required parameters:', { userAddress, recipientAddress, amount });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get the authorization token from header
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      console.error('No authorization token found');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Verify the Privy token and get the user's DID
    let verifiedToken;
    try {
      verifiedToken = await privyClient.verifyAuthToken(authToken);
    } catch (error) {
      console.error('Invalid Privy auth token:', error);
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    // Get user's delegated wallets
    console.log('Getting user details for DID:', verifiedToken.userId);
    const user = await privyClient.getUser(verifiedToken.userId);
    
    // Find all embedded wallets
    const embeddedWallets = user.linkedAccounts.filter(
      (account): account is WalletWithMetadata =>
        account.type === 'wallet' && account.walletClientType === 'privy'
    );

    // Find delegated wallets
    const delegatedWallets = embeddedWallets.filter(wallet => wallet.delegated);
    
    // Verify the wallet is delegated
    const isWalletDelegated = delegatedWallets.some(wallet => wallet.address.toLowerCase() === userAddress.toLowerCase());
    
    if (!isWalletDelegated) {
      console.error('Wallet not delegated:', userAddress);
      return res.status(403).json({ error: 'Wallet not delegated' });
    }

    // Create Solana transfer transaction
    console.log('Creating transfer instruction...');
    const instruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(userAddress),
      toPubkey: new PublicKey(recipientAddress),
      lamports: Math.floor(amount * LAMPORTS_PER_SOL)
    });

    console.log('Creating transaction...');
    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(userAddress);

    // Use Privy's walletApi.rpc to sign the transaction
    const request: SolanaSignTransactionRpcInputType = {
      address: userAddress,
      chainType: 'solana' as const,
      method: 'signTransaction' as const,
      params: {
        transaction
      }
    };

    console.log('Sending request to Privy wallet API...');
    console.log('Request:', request);

    const response = await privyClient.walletApi.rpc(request) as WalletApiSolanaSignTransactionRpcResponseType<Transaction>;
    
    if (!response.data.signedTransaction) {
      throw new Error('No signed transaction in response');
    }

    // Send the signed transaction to Solana
    console.log('Sending signed transaction to Solana...');
    const serializedTx = response.data.signedTransaction.serialize();
    const txSignature = await connection.sendRawTransaction(serializedTx);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(txSignature);
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    console.log('Transaction successful:', txSignature);
    res.json({ signature: txSignature });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Transfer failed' });
  }
});

// Jupiter swap endpoint
app.post('/swap', async (req, res) => {
  console.log('Received swap request');
  console.log('Headers:', req.headers);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { quoteResponse, decimals, isBuy, inputDecimals, outputDecimals } = req.body;

    if (!quoteResponse) {
      console.error('Missing quote response');
      return res.status(400).json({ error: 'Missing quote response' });
    }

    console.log('Processing swap with params:', {
      decimals,
      isBuy,
      inputDecimals,
      outputDecimals
    });

    // Get the authorization token from header
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      console.error('No authorization token found');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    console.log('Executing Jupiter swap...');
    const txid = await executeJupiterSwap(
      connection,
      privyClient,
      authToken,
      quoteResponse,
      decimals,
      isBuy,
      inputDecimals,
      outputDecimals
    );

    console.log('Swap successful:', txid);
    res.json({ signature: txid });
  } catch (error) {
    console.error('Swap error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Swap failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  app._router.stack.forEach((r: any) => {
    if (r.route && r.route.path) {
      console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
    }
  });
});

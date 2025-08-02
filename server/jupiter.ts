import { Connection, PublicKey, VersionedTransaction, SystemProgram, LAMPORTS_PER_SOL, TransactionMessage, Transaction } from '@solana/web3.js';
import { PrivyClient, SolanaSignTransactionRpcInputType, WalletApiSolanaSignTransactionRpcResponseType } from '@privy-io/server-auth';
import fetch from 'cross-fetch';

const FEE_COLLECTOR = new PublicKey("ESMNwDW8FCTHXC8UEopL7MkjMaXCnecFghVtmmESyoLs");
const FEE_BPS = 100; // 1%

interface JupiterQuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot?: number;
  timeTaken?: number;
}

export async function executeJupiterSwap(
  connection: Connection,
  privyClient: PrivyClient,
  authToken: string,
  quoteResponse: JupiterQuoteResponse,
  decimals: number = 6,
  isBuy: boolean = true,
  inputDecimals?: number,
  outputDecimals?: number,
  slippageBps?: number,
  priorityLevel: string = 'Medium'
) {
  try {
    console.log('Executing swap with quote:', {
      quoteResponse,
      decimals,
      isBuy,
      inputDecimals,
      outputDecimals,
      slippageBps,
      priorityLevel
    });
    
    // Verify the Privy token and get the user's DID
    const verifiedToken = await privyClient.verifyAuthToken(authToken);
    
    // Get user's delegated wallets
    const user = await privyClient.getUser(verifiedToken.userId);
    
    // Find all embedded wallets
    const embeddedWallets = user.linkedAccounts.filter(
      (account): account is any =>
        account.type === 'wallet' && account.walletClientType === 'privy'
    );

    // Find delegated wallets
    const delegatedWallets = embeddedWallets.filter(wallet => wallet.delegated);
    
    if (delegatedWallets.length === 0) {
      throw new Error('No delegated wallet found');
    }

    // Use the first delegated wallet
    const userAddress = delegatedWallets[0].address;
    const userPublicKey = new PublicKey(userAddress);
    console.log('Using delegated wallet:', userAddress);

    // Create a Helius connection specifically for Jupiter swaps
    const heliusConnection = new Connection(
      'https://mainnet.helius-rpc.com/?api-key=22750fa3-7d47-477f-b12a-ca4fd937e933',
      { 
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 30000,
        httpHeaders: { 'x-api-key': '22750fa3-7d47-477f-b12a-ca4fd937e933' }
      }
    );

    // Get swap instructions from Jupiter without priority fee first
    console.log('Getting initial swap instructions from Jupiter...');
    const initialSwapRequestBody = {
      quoteResponse: {
        ...quoteResponse,
        swapMode: quoteResponse.swapMode || 'ExactIn',
        slippageBps: slippageBps || 100 // Use user-specified slippage or default to 1%
      },
      userPublicKey: userAddress,
      wrapAndUnwrapSol: true,
      useSharedAccounts: false,
      prioritizationFeeLamports: 0, // Initially set to 0
      asLegacyTransaction: true, // Changed to true to get Transaction instead of VersionedTransaction
      dynamicComputeUnitLimit: true,
      inputDecimals,
      outputDecimals
    };

    console.log('Initial swap request:', JSON.stringify(initialSwapRequestBody, null, 2));

    const initialSwapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(initialSwapRequestBody)
    });

    if (!initialSwapResponse.ok) {
      const errorText = await initialSwapResponse.text();
      console.error('Jupiter swap API error:', {
        status: initialSwapResponse.status,
        statusText: initialSwapResponse.statusText,
        error: errorText
      });
      throw new Error(`Jupiter API error: ${errorText}`);
    }

    const initialSwapData = await initialSwapResponse.json();
    if (!initialSwapData.swapTransaction) {
      throw new Error('No swap transaction returned from Jupiter');
    }

    // Get priority fee estimate from Helius
    console.log('Getting priority fee estimate from Helius...');
    const priorityFeeResponse = await fetch('https://mainnet.helius-rpc.com/?api-key=22750fa3-7d47-477f-b12a-ca4fd937e933', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getPriorityFeeEstimate',
        params: [{
          transaction: initialSwapData.swapTransaction,
          options: {
            includeAllPriorityFeeLevels: true
          }
        }]
      })
    });

    if (!priorityFeeResponse.ok) {
      console.warn('Failed to fetch priority fee from Helius, using default');
    }

    const priorityFeeData = await priorityFeeResponse.json();
    let priorityFee = 3333333; // Default to medium priority if API fails

    if (priorityFeeData?.result?.priorityFeeLevels) {
      const levels = priorityFeeData.result.priorityFeeLevels;
      // Map priority level to corresponding fee
      switch (priorityLevel.toLowerCase()) {
        case 'low':
          priorityFee = levels.low;
          break;
        case 'medium':
          priorityFee = levels.medium;
          break;
        case 'high':
          priorityFee = levels.high;
          break;
        case 'very high':
          priorityFee = levels.veryHigh;
          break;
        default:
          priorityFee = levels.medium;
      }
    }

    console.log('Using priority fee:', {
      level: priorityLevel,
      fee: priorityFee
    });

    // Get final swap instructions from Jupiter with the estimated priority fee
    console.log('Getting final swap instructions with priority fee...');
    const swapRequestBody = {
      ...initialSwapRequestBody,
      prioritizationFeeLamports: priorityFee
    };

    console.log('Final swap request:', JSON.stringify(swapRequestBody, null, 2));

    const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(swapRequestBody)
    });

    if (!swapResponse.ok) {
      const errorText = await swapResponse.text();
      console.error('Jupiter swap API error:', {
        status: swapResponse.status,
        statusText: swapResponse.statusText,
        error: errorText
      });
      throw new Error(`Jupiter API error: ${errorText}`);
    }

    const swapData = await swapResponse.json();
    console.log('Jupiter swap response:', JSON.stringify(swapData, null, 2));

    if (!swapData.swapTransaction) {
      throw new Error('No swap transaction returned from Jupiter');
    }

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash('confirmed');

    // Create a new transaction
    const transaction = new Transaction();

    // Add Jupiter swap instruction
    const swapInstruction = Transaction.from(Buffer.from(swapData.swapTransaction, 'base64'));
    transaction.add(...swapInstruction.instructions);

    // Calculate and add fee transfer instruction
    if (isBuy) {
      // For buy orders: Take fee from input SOL amount
      const inAmount = BigInt(quoteResponse.inAmount);
      const feeAmount = Number((inAmount * BigInt(FEE_BPS)) / BigInt(10000));
      
      console.log('Buy fee calculation:', {
        inputAmount: inAmount.toString(),
        feePercentage: FEE_BPS / 10000,
        calculatedFee: feeAmount,
        expectedPercentage: '1%'
      });

      // Add the fee transfer instruction before swap
      const feeInstruction = SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: FEE_COLLECTOR,
        lamports: feeAmount
      });
      
      // For buy orders, fee transfer must come first
      transaction.instructions.unshift(feeInstruction);
    } else {
      // For sell orders: Take fee from output SOL amount
      const outAmount = BigInt(quoteResponse.outAmount);
      const feeAmount = Number((outAmount * BigInt(FEE_BPS)) / BigInt(10000));
      
      console.log('Sell fee calculation:', {
        outputAmount: outAmount.toString(),
        feePercentage: FEE_BPS / 10000,
        calculatedFee: feeAmount,
        expectedPercentage: '1%'
      });

      // Add the fee transfer instruction after swap
      const feeInstruction = SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: FEE_COLLECTOR,
        lamports: feeAmount
      });
      
      // For sell orders, fee transfer must come after
      transaction.add(feeInstruction);
    }

    // Set recent blockhash and fee payer
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPublicKey;
    
    // Sign the transaction using Privy's delegated signing
    console.log('Signing transaction with Privy...');
    const request: SolanaSignTransactionRpcInputType = {
      address: userAddress,
      chainType: 'solana' as const,
      method: 'signTransaction' as const,
      params: {
        transaction: transaction
      }
    };

    console.log('Privy request:', JSON.stringify(request, null, 2));
    const response = await privyClient.walletApi.rpc(request) as WalletApiSolanaSignTransactionRpcResponseType<Transaction>;

    if (!response.data.signedTransaction) {
      throw new Error('No signed transaction in response');
    }

    console.log('Got signed transaction from Privy');

    // Submit the transaction to Solana using Helius
    console.log('Submitting transaction to Solana via Helius...');
    const signature = await heliusConnection.sendRawTransaction(response.data.signedTransaction.serialize(), {
      skipPreflight: true,
      maxRetries: 2,
      preflightCommitment: 'confirmed'
    });
    
    console.log('Transaction submitted:', signature);
    
    // Wait for confirmation using polling instead of WebSocket
    console.log('Waiting for confirmation...');
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 2000; // 2 seconds
    
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const status = await heliusConnection.getSignatureStatus(signature);
        console.log(`Attempt ${i + 1} - Status:`, status.value?.confirmationStatus);
        
        if (status.value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }
        
        if (status.value?.confirmationStatus === 'confirmed' || 
            status.value?.confirmationStatus === 'finalized') {
          console.log('Transaction confirmed!');
          return signature;
        }
        
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      } catch (error) {
        console.log(`Confirmation attempt ${i + 1} failed:`, error);
        if (i === MAX_RETRIES - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    throw new Error('Transaction confirmation timed out');
  } catch (error) {
    console.error('Jupiter swap error:', error);
    throw error;
  }
}

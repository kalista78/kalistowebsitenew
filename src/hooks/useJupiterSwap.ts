import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { API_URL } from '@/lib/constants';

interface UseJupiterSwapProps {
  tokenCA?: string;  // Contract address of the token
  decimals?: number; // Token decimals
}

interface SwapQuote {
  expectedOutput: string;
  priceImpact: number;
}

interface JupiterQuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode?: string;
  priceImpactPct?: number;
  routePlan?: any[];
  contextSlot?: number;
  error?: string;
}

interface PriorityFeeResponse {
  priorityFeeEstimate: number;
  priorityFeeLevels: {
    min: number;
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
    unsafeMax: number;
  };
}

const SOL_DECIMALS = 9;
const DEFAULT_TOKEN_DECIMALS = 9; // Fallback if token decimals not specified
const FEE_COLLECTOR = new PublicKey("ESMNwDW8FCTHXC8UEopL7MkjMaXCnecFghVtmmESyoLs");
const FEE_BPS = 100; // 1% fee

export function useJupiterSwap({ tokenCA, decimals }: UseJupiterSwapProps) {
  const { getAccessToken } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);

  const getQuote = async (amount: number, isBuy: boolean) => {
    try {
      if (!amount || amount <= 0) {
        console.log('Invalid amount for quote:', amount);
        throw new Error('Invalid amount');
      }

      setLoading(true);
      
      const tokenDecimals = decimals ?? DEFAULT_TOKEN_DECIMALS;
      
      // For buy orders, we need to account for the fee that will be taken
      const actualAmount = isBuy 
        ? amount * (1 - FEE_BPS/10000) // Remove 1% for fee
        : amount;

      console.log('Getting quote with params:', {
        tokenCA,
        originalAmount: amount,
        actualAmount,
        isBuy,
        tokenDecimals,
        solDecimals: SOL_DECIMALS,
        operation: isBuy ? 'BUY (SOL -> Token)' : 'SELL (Token -> SOL)'
      });

      // For buy: SOL -> Token
      // For sell: Token -> SOL
      const inputMint = isBuy 
        ? 'So11111111111111111111111111111111111111112'  // SOL mint address
        : tokenCA;
      const outputMint = isBuy 
        ? tokenCA 
        : 'So11111111111111111111111111111111111111112';  // SOL mint address

      if (!inputMint || !outputMint) {
        console.error('Invalid token addresses:', { inputMint, outputMint });
        throw new Error('Invalid token addresses');
      }

      console.log('Using mints:', {
        inputMint,
        outputMint,
        operation: isBuy ? 'BUY (SOL -> Token)' : 'SELL (Token -> SOL)'
      });

      // Convert amount to lamports/base units based on input token
      const amountInLamports = isBuy 
        ? Math.round(actualAmount * Math.pow(10, SOL_DECIMALS))  // If buying, input is SOL (after fee)
        : Math.round(amount * Math.pow(10, tokenDecimals));  // If selling, input is token

      if (amountInLamports <= 0) {
        console.error('Amount too small after conversion:', {
          originalAmount: amount,
          actualAmount,
          amountInLamports,
          decimals: isBuy ? SOL_DECIMALS : tokenDecimals
        });
        throw new Error('Amount too small');
      }

      console.log('Amount conversion:', {
        original: amount,
        actual: actualAmount,
        converted: amountInLamports,
        inputDecimals: isBuy ? SOL_DECIMALS : tokenDecimals,
        outputDecimals: isBuy ? tokenDecimals : SOL_DECIMALS,
        operation: isBuy ? 'BUY (SOL -> Token)' : 'SELL (Token -> SOL)'
      });

      const quoteUrl = new URL('https://quote-api.jup.ag/v6/quote');
      quoteUrl.searchParams.append('inputMint', inputMint);
      quoteUrl.searchParams.append('outputMint', outputMint);
      quoteUrl.searchParams.append('amount', amountInLamports.toString());
      quoteUrl.searchParams.append('slippageBps', '0');
      quoteUrl.searchParams.append('feeBps', '0');
      quoteUrl.searchParams.append('onlyDirectRoutes', 'false');
      quoteUrl.searchParams.append('asLegacyTransaction', 'false');
      quoteUrl.searchParams.append('platformFeeBps', '0');
      quoteUrl.searchParams.append('restrictIntermediateTokens', 'true');

      console.log('Fetching quote from:', quoteUrl.toString());

      const response = await fetch(quoteUrl.toString());
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Jupiter API error:', errorData);
        throw new Error(errorData.error || 'Failed to get quote');
      }

      const data = await response.json() as JupiterQuoteResponse;
      
      console.log('Quote response:', {
        ...data,
        operation: isBuy ? 'BUY (SOL -> Token)' : 'SELL (Token -> SOL)',
        inputAmount: amount,
        actualAmount,
        inputDecimals: isBuy ? SOL_DECIMALS : tokenDecimals,
        outputDecimals: isBuy ? tokenDecimals : SOL_DECIMALS
      });

      if (!data || !data.outAmount || data.error) {
        console.error('Invalid quote response:', data);
        throw new Error(data.error || 'Failed to get quote');
      }

      // Log the route details
      if (data.routePlan) {
        console.log('Route plan:', data.routePlan);
      }

      // Convert outAmount from base units to display units based on output token
      const expectedOutput = data.outAmount;

      // Calculate price impact if available
      const priceImpact = data.priceImpactPct || 0;

      const quoteData = {
        expectedOutput: expectedOutput.toString(),
        priceImpact,
        inputDecimals: isBuy ? SOL_DECIMALS : tokenDecimals,
        outputDecimals: isBuy ? tokenDecimals : SOL_DECIMALS,
        operation: isBuy ? 'BUY (SOL -> Token)' : 'SELL (Token -> SOL)'
      };

      console.log('Processed quote:', quoteData);
      setQuote(quoteData);

      return data;
    } catch (error) {
      console.error('Error getting Jupiter quote:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPriorityFee = async (transaction: string, priorityLevel: string): Promise<number> => {
    try {
      const response = await fetch('https://mainnet.helius-rpc.com/?api-key=22750fa3-7d47-477f-b12a-ca4fd937e933', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getPriorityFeeEstimate',
          params: [{
            transaction,
            options: {
              includeAllPriorityFeeLevels: true
            }
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch priority fee estimate');
      }

      const data = await response.json();
      const levels = data.result.priorityFeeLevels;

      // Map priority level to corresponding fee
      switch (priorityLevel.toLowerCase()) {
        case 'low':
          return levels.low;
        case 'medium':
          return levels.medium;
        case 'high':
          return levels.high;
        case 'very high':
          return levels.veryHigh;
        default:
          return levels.medium;
      }
    } catch (error) {
      console.error('Error fetching priority fee:', error);
      // Default to medium priority (50th percentile) if API fails
      return 3333333;
    }
  };

  const executeSwap = async (amount: number, isBuy: boolean, slippageBps?: number, priorityLevel: string = 'Medium') => {
    try {
      setLoading(true);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const tokenDecimals = decimals ?? DEFAULT_TOKEN_DECIMALS;

      console.log('Executing swap with params:', {
        amount,
        isBuy,
        tokenDecimals,
        solDecimals: SOL_DECIMALS,
        tokenCA,
        feeCollector: FEE_COLLECTOR.toString(),
        feeBps: FEE_BPS,
        slippageBps,
        priorityLevel
      });

      const quoteResponse = await getQuote(amount, isBuy);
      console.log('Quote data for swap:', quoteResponse);

      const swapRequest = {
        quoteResponse,
        decimals: tokenDecimals,
        isBuy,
        inputDecimals: isBuy ? SOL_DECIMALS : tokenDecimals,
        outputDecimals: isBuy ? tokenDecimals : SOL_DECIMALS,
        feeCollector: FEE_COLLECTOR.toString(),
        feeBps: FEE_BPS,
        slippageBps: slippageBps || 100,
        priorityLevel,
        originalAmount: amount
      };

      console.log('Sending swap request to server:', {
        url: `${API_URL}/api/swap`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.substring(0, 10)}...`
        },
        body: swapRequest
      });

      const response = await fetch(`${API_URL}/api/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(swapRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Swap failed');
      }

      const result = await response.json();
      console.log('Swap result:', result);
      return result;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    quote,
    getQuote,
    executeSwap
  };
}

import { useEffect, useState, useCallback } from 'react';
import { useRequestQueue } from '../utils/requestQueue';

interface DexScreenerTokenData {
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  priceChange24h: number;
}

interface DexScreenerResponse {
  pairs: Array<{
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
      h24: {
        buys: number;
        sells: number;
      };
    };
    volume: {
      h24: number;
    };
    priceChange: {
      h24: number;
    };
    liquidity?: {
      usd: number;
    };
    fdv: number;
  }>;
}

export function useDexScreener(tokenAddress: string) {
  const [tokenData, setTokenData] = useState<DexScreenerTokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create the fetch callback
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch DexScreener data');
      }

      const data: DexScreenerResponse = await response.json();
      
      // Find the main pair (usually the one with highest liquidity)
      const mainPair = data.pairs?.[0];
      
      if (!mainPair) {
        throw new Error('No trading pairs found');
      }

      setTokenData({
        price: Number(mainPair.priceUsd) || 0,
        marketCap: mainPair.fdv || 0,
        volume24h: mainPair.volume?.h24 || 0,
        liquidity: mainPair.liquidity?.usd || 0,
        priceChange24h: mainPair.priceChange?.h24 || 0
      });

      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching DexScreener data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }, [tokenAddress]);

  // Use the request queue with a 2-minute interval
  // This means each token will update every 2 minutes, allowing us to handle up to 50 tokens
  // while staying under the 30 rpm limit
  useRequestQueue(
    `dexscreener-${tokenAddress}`,
    fetchData,
    120000 // 2 minutes
  );

  return { tokenData, isLoading, error };
}

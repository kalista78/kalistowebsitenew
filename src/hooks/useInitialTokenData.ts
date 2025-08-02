import { useEffect } from 'react';
import { useTokensStore } from '@/store/tokensStore';
import useTokenStore from '@/store/tokenStore';
import { getUSDToTRYRate } from '@/utils/solana';
import { useDexScreener } from './useDexScreener';

export function useInitialTokenData() {
  const { tokens } = useTokensStore();
  const { fetchTokenData } = useTokenStore();
  
  useEffect(() => {
    const fetchAllTokenData = async () => {
      try {
        // Get TRY rate once for all tokens
        const tryRate = await getUSDToTRYRate();
        
        // Fetch data for all tokens
        const fetchPromises = tokens.map(async (token) => {
          if (token.ca) {
            try {
              // Use DexScreener for each token
              const response = await fetch(
                `https://api.dexscreener.com/latest/dex/tokens/${token.ca}`
              );
              const data = await response.json();
              const pair = data.pairs?.[0];
              
              if (pair) {
                await fetchTokenData(token.ca, tryRate, {
                  price: parseFloat(pair.priceUsd) || 0,
                  marketCap: pair.fdv || 0,
                  volume24h: pair.volume.h24 || 0,
                  liquidity: pair.liquidity.usd || 0,
                  priceChange24h: pair.priceChange.h24 || 0,
                });
              }
            } catch (error) {
              console.error(`Error fetching data for token ${token.symbol}:`, error);
            }
          }
        });

        await Promise.all(fetchPromises);
      } catch (error) {
        console.error('Error fetching initial token data:', error);
      }
    };

    fetchAllTokenData();
    
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(fetchAllTokenData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [tokens, fetchTokenData]);
}

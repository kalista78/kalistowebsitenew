import { useState, useEffect } from 'react';
import { FEATURED_COINS } from '@/config/tokens';
import { useExchangeRateStore } from '@/store/exchangeRateStore';

export interface TokenPrice {
  id: string;
  priceUSD: number;
  priceTRY: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
}

const PRICE_UPDATE_INTERVAL = 30 * 1000; // 30 seconds

export function useTokenPrices() {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(true);
  const { tryRate } = useExchangeRateStore();

  useEffect(() => {
    let mounted = true;

    async function fetchPrices() {
      if (!mounted || !tryRate) return;

      try {
        setLoading(true);
        const promises = FEATURED_COINS.map(async (token) => {
          try {
            const response = await fetch(
              `https://api.dexscreener.com/latest/dex/tokens/${token.ca}`
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch price for ${token.id}`);
            }

            const data = await response.json();
            const pair = data.pairs?.[0];
            
            if (!pair) return null;

            return {
              id: token.id,
              priceUSD: Number(pair.priceUsd || 0),
              priceTRY: Number(pair.priceUsd || 0) * tryRate,
              priceChange24h: Number(pair.priceChange?.h24 || 0),
              marketCap: Number(pair.fdv || 0),
              volume24h: Number(pair.volume?.h24 || 0),
              liquidity: Number(pair.liquidity?.usd || 0)
            };
          } catch (error) {
            console.error(`Error fetching ${token.id} price:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        const newPrices: Record<string, TokenPrice> = {};
        
        results.forEach((result) => {
          if (result) {
            newPrices[result.id] = result;
          }
        });

        if (mounted) {
          setPrices(newPrices);
        }
      } catch (err) {
        console.error('Error fetching token prices:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, PRICE_UPDATE_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [tryRate]);

  return { prices, loading };
} 
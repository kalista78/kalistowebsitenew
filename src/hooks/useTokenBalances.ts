import { useState, useEffect, useCallback } from 'react';
import { getTokenBalances, TokenBalance } from '@/utils/solana';

const REFRESH_INTERVAL = 30000; // 30 seconds

export function useTokenBalances(address: string | null) {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchBalances = useCallback(async () => {
    if (!address) {
      setTokens([]);
      setLoading(false);
      return;
    }

    try {
      const balances = await getTokenBalances(address);
      setTokens(balances);
    } catch (error) {
      console.error('Error fetching token balances:', error);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchWithInterval = async () => {
      if (!mounted) return;
      
      await fetchBalances();
      
      // Schedule next update
      timeoutId = setTimeout(fetchWithInterval, REFRESH_INTERVAL);
    };

    if (address) {
      setLoading(true);
      fetchWithInterval();
    }

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [address, fetchBalances]);

  return { 
    tokens, 
    loading,
    refetch: fetchBalances // Expose refetch but don't encourage frequent use
  };
}

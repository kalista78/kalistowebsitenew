import { useEffect, useRef } from 'react';
import { useExchangeRateStore } from '@/store/exchangeRateStore';

const FETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export function useExchangeRate() {
  const { tryRate, lastUpdated, isLoading, error, fetchRate } = useExchangeRateStore();
  const initialFetchDone = useRef(false);

  useEffect(() => {
    // Only do the initial fetch if it hasn't been done yet
    if (!initialFetchDone.current && !lastUpdated) {
      console.log('Performing initial exchange rate fetch...'); // Debug log
      fetchRate();
      initialFetchDone.current = true;
    }

    // Set up interval for subsequent fetches
    const intervalId = setInterval(() => {
      console.log('Performing interval exchange rate fetch...'); // Debug log
      fetchRate();
    }, FETCH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchRate, lastUpdated]);

  return {
    tryRate,
    lastUpdated,
    isLoading,
    error
  };
}

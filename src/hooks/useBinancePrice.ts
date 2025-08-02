import { useExchangeRateStore } from '@/store/exchangeRateStore';

export function useBinancePrice() {
  const { tryRate, isLoading, error } = useExchangeRateStore();
  return { tryRate, isLoading, error };
}
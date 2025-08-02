import { create } from 'zustand';

interface ExchangeRateState {
  tryRate: number | null;
  lastUpdated: number | null;
  isLoading: boolean;
  error: string | null;
  fetchRate: () => Promise<void>;
}

// Get the last stored rate from localStorage or return null
const getInitialRate = (): { rate: number | null; lastUpdated: number | null } => {
  if (typeof window === 'undefined') {
    return { rate: null, lastUpdated: null }; // No fallback for SSR
  }
  
  const stored = localStorage.getItem('tryRate');
  if (stored) {
    try {
      const { rate, timestamp } = JSON.parse(stored);
      // Only use stored rate if it's less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return { rate, lastUpdated: timestamp };
      }
    } catch (e) {
      console.warn('Failed to parse stored TRY rate:', e);
    }
  }
  
  return { rate: null, lastUpdated: null };
};

const { rate: initialRate, lastUpdated: initialLastUpdated } = getInitialRate();

export const useExchangeRateStore = create<ExchangeRateState>((set, get) => ({
  tryRate: initialRate,
  lastUpdated: initialLastUpdated,
  isLoading: false,
  error: null,
  fetchRate: async () => {
    const currentState = get();
    
    // Don't fetch if we already have a recent rate (less than 5 minutes old)
    if (
      currentState.tryRate !== null && 
      currentState.lastUpdated !== null && 
      Date.now() - currentState.lastUpdated < 5 * 60 * 1000 &&
      !currentState.isLoading // Allow refetch if previous attempt was loading
    ) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=USDTTRY'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch USDT/TRY rate');
      }

      const data = await response.json();
      const rate = parseFloat(data.price);

      if (isNaN(rate)) {
        throw new Error('Invalid rate received from Binance');
      }

      const timestamp = Date.now();
      
      // Store in localStorage
      localStorage.setItem('tryRate', JSON.stringify({
        rate,
        timestamp
      }));

      set({
        tryRate: rate,
        lastUpdated: timestamp,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching TRY rate:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch rate',
        isLoading: false
      });
    }
  }
}));

// Initialize store with more frequent updates
if (typeof window !== 'undefined') {
  // Fetch immediately
  useExchangeRateStore.getState().fetchRate();

  // Then fetch every minute
  setInterval(() => {
    useExchangeRateStore.getState().fetchRate();
  }, 60 * 1000); // Every minute
}

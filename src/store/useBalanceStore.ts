import { create } from 'zustand';
import { TokenBalance } from '@/utils/solana';
import { persist } from 'zustand/middleware';

interface BalanceState {
  solBalance: number;
  tokenBalances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  setSolBalance: (balance: number) => void;
  setTokenBalances: (balances: TokenBalance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set) => ({
      solBalance: 0,
      tokenBalances: [],
      isLoading: false,
      error: null,
      setSolBalance: (balance) => {
        console.log('Setting SOL balance in store:', balance);
        set({ solBalance: balance });
      },
      setTokenBalances: (balances) => {
        console.log('Setting token balances in store:', balances);
        set({ tokenBalances: balances });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'balance-storage',
      partialize: (state) => ({
        solBalance: state.solBalance,
        tokenBalances: state.tokenBalances,
      }),
    }
  )
);

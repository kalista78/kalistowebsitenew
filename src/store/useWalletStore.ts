import { create } from 'zustand';
import { StateCreator } from 'zustand';

interface WalletState {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  solBalance: number;
  setSolBalance: (balance: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  walletAddress: null,
  setWalletAddress: (address: string | null) => set({ walletAddress: address }),
  solBalance: 0,
  setSolBalance: (balance: number) => set({ solBalance: balance }),
}));

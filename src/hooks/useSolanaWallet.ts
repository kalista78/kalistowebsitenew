import { usePrivy, useWallets, type WalletData } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

export function useSolanaWallet() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [wallet, setWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    if (!authenticated) {
      setWallet(null);
      return;
    }

    const solanaWallet = wallets.find(w => w.walletClientType === 'solana');
    setWallet(solanaWallet || null);
  }, [authenticated, wallets]);

  return wallet;
} 
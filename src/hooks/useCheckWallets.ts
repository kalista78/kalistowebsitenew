import { usePrivy, useWallets, useSolanaWallets, WalletWithMetadata } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/useWalletStore';

interface CheckWalletsResult {
  ready: boolean;
  hasSolanaWallet: boolean;
  walletAddress: string | null;
  solanaWallets: any[];
  solanaAddress: string | null;
}

export function useCheckWallets(): CheckWalletsResult {
  const { authenticated, user, ready: privyReady } = usePrivy();
  const { wallets: allWallets, ready: walletsReady } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const [ready, setReady] = useState(false);
  const [hasSolanaWallet, setHasSolanaWallet] = useState(false);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const setWalletAddress = useWalletStore((state) => state.setWalletAddress);
  const walletAddress = useWalletStore((state) => state.walletAddress);

  // Effect for checking wallet existence
  useEffect(() => {
    let mounted = true;

    async function initializeWallet() {
      console.log('Initializing wallet:', {
        privyReady,
        walletsReady,
        authenticated,
        hasUser: !!user,
        solanaWallets: solanaWallets.length,
        allWallets: allWallets.length
      });

      // Consider ready if we have Privy ready and either walletsReady or a Solana wallet
      const isReady = privyReady && (walletsReady || solanaWallets.length > 0);
      
      if (!isReady) {
        console.log('Not ready:', { privyReady, walletsReady, solanaWallets: solanaWallets.length });
        if (mounted) setReady(false);
        return;
      }

      if (!authenticated || !user) {
        console.log('Not authenticated or no user');
        if (mounted) {
          setReady(true);
          setHasSolanaWallet(false);
          setWalletAddress(null);
          setSolanaAddress(null);
        }
        return;
      }

      // Check in current Solana wallets first as it's most reliable
      const currentSolanaWallet = solanaWallets[0];
      
      if (currentSolanaWallet) {
        console.log('Found current Solana wallet:', currentSolanaWallet.address);
        if (mounted) {
          setReady(true);
          setHasSolanaWallet(true);
          setWalletAddress(currentSolanaWallet.address);
          setSolanaAddress(currentSolanaWallet.address);
        }
        return;
      }

      // Fallback checks
      const solanaInLinked = user.linkedAccounts.find(
        (account): account is WalletWithMetadata => 
          account.type === 'wallet' &&
          'walletClientType' in account &&
          account.walletClientType === 'privy' &&
          'chainType' in account &&
          account.chainType === 'solana'
      );

      const solanaInAll = allWallets.find(
        (wallet) => wallet.walletClientType === 'privy' && wallet.chainId === 'solana'
      );

      const hasSolana = !!(solanaInLinked || solanaInAll);
      const address = solanaInLinked?.address || solanaInAll?.address || null;

      if (mounted) {
        setReady(true);
        setHasSolanaWallet(hasSolana);
        setWalletAddress(address);
        setSolanaAddress(address);
      }
    }

    initializeWallet();

    return () => {
      mounted = false;
    };
  }, [privyReady, walletsReady, authenticated, user, allWallets, solanaWallets, setWalletAddress]);

  return {
    ready,
    hasSolanaWallet,
    walletAddress,
    solanaWallets,
    solanaAddress
  };
}

import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useCheckWallets } from './useCheckWallets';

export function useSolanaWalletSetup() {
  const { user, ready: privyReady } = usePrivy();
  const { ready, hasSolanaWallet, solanaWallets } = useCheckWallets();
  const { createWallet } = useSolanaWallets();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptedCreation, setAttemptedCreation] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function createSolanaWallet() {
      if (!user || isCreating || attemptedCreation || hasSolanaWallet) {
        return;
      }

      setIsCreating(true);
      setError(null);

      try {
        // Double check if wallet exists before creating
        if (solanaWallets && solanaWallets.length > 0) {
          console.log('Existing Solana wallet found, skipping creation');
          setAttemptedCreation(true);
          return;
        }

        console.log('No existing wallet found. Creating Solana wallet for user...');
        const wallet = await createWallet();
        if (isMounted) {
          console.log('Solana wallet created successfully:', wallet);
          setAttemptedCreation(true);
        }
      } catch (err) {
        console.error('Error creating wallet:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
        // Even if there's an error, mark that we attempted creation
        setAttemptedCreation(true);
      } finally {
        if (isMounted) {
          setIsCreating(false);
        }
      }
    }

    // Reset attempted creation when user changes
    if (!user) {
      setAttemptedCreation(false);
    }

    // Attempt to create a wallet if:
    // 1. Privy is ready
    // 2. Wallet checking is ready
    // 3. User is logged in
    // 4. We haven't attempted creation yet
    if (privyReady && ready && user && !attemptedCreation) {
      // Add a small delay to ensure Privy is fully initialized
      setTimeout(() => {
        createSolanaWallet();
      }, 1000);
    }

    return () => {
      isMounted = false;
    };
  }, [privyReady, ready, user, isCreating, createWallet, attemptedCreation]);

  // Reset attempted creation when user changes
  useEffect(() => {
    if (!user) {
      setAttemptedCreation(false);
    }
  }, [user]);

  return {
    isCreating,
    error,
  };
}
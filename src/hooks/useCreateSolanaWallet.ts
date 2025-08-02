import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useCheckWallets } from './useCheckWallets';
import { useDelegation } from './useDelegation';

export function useCreateSolanaWallet() {
  const { ready, authenticated } = usePrivy();
  const { createWallet } = useSolanaWallets();
  const { hasSolanaWallet, ready: walletsReady } = useCheckWallets();
  const { requestDelegation } = useDelegation();

  useEffect(() => {
    const createSolanaWallet = async () => {
      if (!ready || !authenticated || !walletsReady) return;
      
      if (!hasSolanaWallet) {
        try {
          await createWallet();
          console.log('Solana wallet created successfully');
          
          // Request delegation immediately after wallet creation
          setTimeout(async () => {
            try {
              await requestDelegation();
              console.log('Delegation requested successfully');
            } catch (error) {
              console.error('Error requesting delegation:', error);
            }
          }, 1000); // Small delay to ensure wallet is fully initialized
          
        } catch (error) {
          console.error('Error creating Solana wallet:', error);
        }
      }
    };

    createSolanaWallet();
  }, [ready, authenticated, walletsReady, hasSolanaWallet, createWallet, requestDelegation]);
}

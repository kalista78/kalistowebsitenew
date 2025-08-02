import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useDelegation } from './useDelegation';

export function useCheckDelegation() {
  const { user, ready } = usePrivy();
  const { requestDelegation, isWalletDelegated } = useDelegation();

  useEffect(() => {
    const checkAndRequestDelegation = async () => {
      if (!ready || !user) return;

      // If wallet exists but is not delegated, request delegation
      if (!isWalletDelegated) {
        try {
          await requestDelegation();
          console.log('Delegation requested for existing wallet');
        } catch (error) {
          console.error('Error requesting delegation for existing wallet:', error);
        }
      }
    };

    // Small delay to ensure wallet state is properly initialized
    const timer = setTimeout(checkAndRequestDelegation, 1000);
    return () => clearTimeout(timer);
  }, [ready, user, isWalletDelegated, requestDelegation]);
}

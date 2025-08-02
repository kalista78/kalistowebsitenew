import { usePrivy, useSolanaWallets, useDelegatedActions } from '@privy-io/react-auth';
import { useState } from 'react';

export function useDelegation() {
  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { delegateWallet } = useDelegatedActions();
  const [isDelegating, setIsDelegating] = useState(false);

  // Find the embedded wallet to delegate
  const walletToDelegate = wallets.find((wallet) => wallet.walletClientType === 'privy');

  // Check if the wallet is already delegated
  const isWalletDelegated = !!user?.linkedAccounts.find(
    (account) =>
      account.type === 'wallet' && 
      account.address === walletToDelegate?.address && 
      'delegated' in account && 
      account.delegated
  );

  const requestDelegation = async () => {
    if (!walletToDelegate || isWalletDelegated || isDelegating) return false;

    try {
      setIsDelegating(true);
      
      // Request delegation with no restrictions
      await delegateWallet({
        address: walletToDelegate.address,
        chainType: 'solana' as const,
        // No permissions specified = unlimited access
      });
      
      return true;
    } catch (error) {
      console.error('Failed to delegate wallet:', error);
      return false;
    } finally {
      setIsDelegating(false);
    }
  };

  return {
    isWalletDelegated,
    isDelegating,
    requestDelegation,
    walletToDelegate
  };
}

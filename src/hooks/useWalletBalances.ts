import { useEffect, useRef, useCallback } from 'react';
import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { connection } from '@/config/rpc';
import { getTokenBalances } from '@/utils/solana';
import { useBalanceStore } from '@/store/useBalanceStore';
import { rpcQueue } from '../utils/rpcQueue';

const POLLING_INTERVAL = 30000; // 30 seconds

export const useWalletBalances = () => {
  const { user } = usePrivy();
  const { 
    solBalance,
    tokenBalances,
    isLoading,
    error,
    setSolBalance, 
    setTokenBalances, 
    setLoading, 
    setError 
  } = useBalanceStore();
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const getSolanaWallet = useCallback(() => {
    if (!user?.linkedAccounts) {
      console.log('No linked accounts found');
      return null;
    }
    
    const wallet = user.linkedAccounts.find(
      (account): account is WalletWithMetadata =>
        account.type === 'wallet' &&
        account.walletClientType === 'privy' &&
        account.chainType === 'solana'
    );

    console.log('Found Solana wallet:', wallet?.address);
    return wallet;
  }, [user]);

  const updateBalances = useCallback(async (wallet: WalletWithMetadata) => {
    if (!wallet.address) {
      console.log('No wallet address provided');
      return;
    }
    if (!mountedRef.current) {
      console.log('Component not mounted');
      return;
    }
    if (fetchingRef.current) {
      console.log('Already fetching balances');
      return;
    }
    
    console.log('Starting balance update for wallet:', wallet.address);
    fetchingRef.current = true;
    setLoading(true);
    
    try {
      // Get SOL balance
      const publicKey = new PublicKey(wallet.address);
      console.log('Fetching SOL balance...');
      const solBalanceResult = await rpcQueue.execute<number>(
        connection,
        'getBalance',
        [publicKey]
      );
      
      if (mountedRef.current) {
        const balanceInSOL = solBalanceResult / LAMPORTS_PER_SOL;
        console.log('Received SOL balance:', balanceInSOL);
        setSolBalance(balanceInSOL);
        
        // Verify the store update
        setTimeout(() => {
          const currentBalance = useBalanceStore.getState().solBalance;
          console.log('Verified store SOL balance:', currentBalance);
        }, 100);
      }

      // Get token balances
      console.log('Fetching token balances...');
      const tokens = await getTokenBalances(wallet.address);
      
      if (mountedRef.current) {
        console.log('Received token balances:', tokens);
        setTokenBalances(tokens || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching balances:', err);
      if (mountedRef.current) {
        setError('Failed to fetch balances');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
      console.log('Balance update completed');
    }
  }, [setSolBalance, setTokenBalances, setLoading, setError]);

  // Initial fetch effect
  useEffect(() => {
    console.log('Initial fetch effect running');
    const solanaWallet = getSolanaWallet();
    if (solanaWallet) {
      console.log('Initial balance fetch for wallet:', solanaWallet.address);
      setLoading(true);
      updateBalances(solanaWallet);
    }
  }, [user, getSolanaWallet, updateBalances]);

  // Polling effect
  useEffect(() => {
    console.log('Setting up polling');
    let intervalId: NodeJS.Timeout;

    const startPolling = () => {
      intervalId = setInterval(() => {
        const solanaWallet = getSolanaWallet();
        if (solanaWallet) {
          console.log('Polling: fetching balances');
          updateBalances(solanaWallet);
        }
      }, POLLING_INTERVAL);
    };

    if (user) {
      startPolling();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('Polling cleared');
      }
    };
  }, [user, getSolanaWallet, updateBalances]);

  // Cleanup effect
  useEffect(() => {
    mountedRef.current = true;
    console.log('Component mounted');
    return () => {
      mountedRef.current = false;
      console.log('Component unmounted');
    };
  }, []);

  return {
    solBalance,
    tokenBalances,
    isLoading,
    error,
    refetch: () => {
      console.log('Manual refetch requested');
      const solanaWallet = getSolanaWallet();
      if (solanaWallet) {
        setLoading(true);
        updateBalances(solanaWallet);
      }
    }
  };
};

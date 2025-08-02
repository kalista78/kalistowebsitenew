import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useState } from 'react';
import { useDelegation } from './useDelegation';
import { connection } from '@/config/rpc';

export function useTransferSol() {
  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { isWalletDelegated } = useDelegation();
  const [isTransferring, setIsTransferring] = useState(false);

  const transfer = async (toAddress: string, amount: number) => {
    if (!user || !wallets.length || !isWalletDelegated || isTransferring) {
      throw new Error('Cannot transfer: wallet not ready or not delegated');
    }

    setIsTransferring(true);
    const wallet = wallets[0];

    try {
      // Validate the recipient address
      try {
        new PublicKey(toAddress);
      } catch (error) {
        throw new Error('Invalid recipient address');
      }

      // Get sender's balance
      const balance = await connection.getBalance(new PublicKey(wallet.address));
      if (balance <= 0) {
        throw new Error('Insufficient balance in wallet');
      }

      // Call our backend API to get the unsigned transaction
      const response = await fetch('http://localhost:3001/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wallet.address}`
        },
        body: JSON.stringify({
          userAddress: wallet.address,
          recipientAddress: toAddress,
          amount
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Failed to parse response:', error);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Transfer failed');
      }

      // Check if we have enough balance for the total amount (including rent if needed)
      if (data.totalAmount > balance / 1e9) {
        if (data.includesRent) {
          throw new Error(`Insufficient balance. Need ${data.totalAmount} SOL (${data.rentAmount} SOL for rent + ${amount} SOL for transfer)`);
        } else {
          throw new Error(`Insufficient balance. Need ${data.totalAmount} SOL`);
        }
      }

      // Deserialize and sign the transaction
      const serializedTransaction = Buffer.from(data.transaction, 'base64');
      const transaction = Transaction.from(serializedTransaction);

      // Sign and send the transaction
      console.log('Signing transaction with wallet...');
      const signedTransaction = await wallet.signTransaction(transaction);

      console.log('Sending signed transaction...');
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      console.log('Waiting for confirmation...');
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: data.blockhash,
        lastValidBlockHeight: data.lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      console.log('Transaction confirmed:', signature);
      return signature;
    } catch (error: any) {
      console.error('Transfer failed:', error);
      throw new Error(error?.message || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transfer,
    isTransferring,
    canTransfer: !!user && wallets.length > 0 && isWalletDelegated
  };
}

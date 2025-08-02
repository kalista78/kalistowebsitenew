import { useSolanaWallets } from '@privy-io/react-auth';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { connection } from '@/config/rpc';

export function useDelegatedTransaction() {
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];

  const sendTransaction = async (
    userAddress: string,
    recipientAddress: string,
    amount: number
  ) => {
    if (!solanaWallet) {
      throw new Error('No Solana wallet found');
    }

    try {
      // Create transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(userAddress),
        toPubkey: new PublicKey(recipientAddress),
        lamports: Math.floor(amount * LAMPORTS_PER_SOL)
      });

      // Create transaction
      const transaction = new Transaction().add(instruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(userAddress);

      // Send transaction using the wallet's sendTransaction method
      const signature = await solanaWallet.sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      return signature;
    } catch (error) {
      console.error('Error sending delegated transaction:', error);
      throw error;
    }
  };

  return {
    sendTransaction,
    isReady: !!solanaWallet
  };
}

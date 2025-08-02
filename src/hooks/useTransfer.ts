import { usePrivy } from '@privy-io/react-auth';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { useDelegation } from './useDelegation';
import { connection } from '@/utils/solana';
import { toast } from 'sonner';

export function useTransfer() {
  const { user } = usePrivy();
  const { walletToDelegate } = useDelegation();

  const transferSOL = async (recipient: string, amount: number) => {
    if (!walletToDelegate || !user) {
      toast.error('No wallet available');
      throw new Error('No wallet available');
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletToDelegate.address),
          toPubkey: new PublicKey(recipient),
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletToDelegate.address);

      const signedTx = await walletToDelegate.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Failed to transfer SOL:', error);
      toast.error('Failed to transfer SOL. Please try again.');
      throw error;
    }
  };

  const transferToken = async (
    recipient: string,
    amount: number,
    tokenMint: string
  ) => {
    if (!walletToDelegate || !user) {
      toast.error('No wallet available');
      throw new Error('No wallet available');
    }

    try {
      // Get the token account for the sender
      const senderTokenAccounts = await connection.getTokenAccountsByOwner(
        new PublicKey(walletToDelegate.address),
        { mint: new PublicKey(tokenMint) }
      );

      if (senderTokenAccounts.value.length === 0) {
        toast.error('You don\'t have a token account for this token');
        throw new Error('Sender does not have a token account for this mint');
      }

      // Get or create token account for recipient
      const recipientTokenAccounts = await connection.getTokenAccountsByOwner(
        new PublicKey(recipient),
        { mint: new PublicKey(tokenMint) }
      );

      let recipientTokenAccount: PublicKey;
      if (recipientTokenAccounts.value.length > 0) {
        recipientTokenAccount = recipientTokenAccounts.value[0].pubkey;
      } else {
        // Create associated token account for recipient if it doesn't exist
        recipientTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(tokenMint),
          new PublicKey(recipient)
        );
      }

      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccounts.value[0].pubkey,
          recipientTokenAccount,
          new PublicKey(walletToDelegate.address),
          amount * Math.pow(10, 9) // Assuming 9 decimals, adjust if needed
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletToDelegate.address);

      const signedTx = await walletToDelegate.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Failed to transfer token:', error);
      toast.error('Failed to transfer token. Please try again.');
      throw error;
    }
  };

  return {
    transferSOL,
    transferToken
  };
}

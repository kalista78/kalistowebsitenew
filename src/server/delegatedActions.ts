import { PrivyClient } from '@privy-io/server-auth';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useSolanaWallets } from '@privy-io/react-auth';

if (!process.env.QUICKNODE_RPC_URL) {
  throw new Error('QUICKNODE_RPC_URL environment variable is not set');
}

const RPC_URL = process.env.QUICKNODE_RPC_URL;
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || '';
const PRIVY_APP_SECRET = 'wallet-api:MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiserUHEj9zelb4KayqCoUsbbnq/gxAcBWUa3/MLv8puhRANCAARpsD7GigjFr1RIAdmE8AwyD9sHHKPtIhePWBJzfzUDUqrupKtD9Xuu3MF4Ty+zVFqBEmqCIMtgRW9e1VZQ5P5z';

// Initialize Privy client
export const privyClient = new PrivyClient(
  PRIVY_APP_ID,
  PRIVY_APP_SECRET
);

export async function sendDelegatedTransaction(
  userAddress: string,
  recipientAddress: string,
  amount: number
) {
  try {
    // Get Solana wallet
    const { wallets } = useSolanaWallets();
    const solanaWallet = wallets[0];
    
    if (!solanaWallet) {
      throw new Error('No Solana wallet found');
    }

    // Create Solana connection
    const connection = new Connection(RPC_URL);

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
}

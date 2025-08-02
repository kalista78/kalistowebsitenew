import { useCreateSolanaWallet } from '../hooks/useCreateSolanaWallet';

export const WalletInitializer: React.FC = () => {
  // This hook will automatically create a Solana wallet when the user logs in
  useCreateSolanaWallet();

  // This component doesn't render anything
  return null;
};

import { usePrivy, useSolanaWallets, type WalletWithMetadata } from '@privy-io/react-auth';
import { ArrowRightFromLine } from 'lucide-react';

export function ExportWalletButton() {
  const { ready, authenticated, user } = usePrivy();
  const { exportWallet } = useSolanaWallets();

  // Check that user is authenticated
  const isAuthenticated = ready && authenticated;

  // Check that user has an embedded wallet
  const hasEmbeddedWallet = user?.linkedAccounts?.find(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' &&
      'walletClientType' in account &&
      account.walletClientType === 'privy' &&
      'chainType' in account &&
      account.chainType === 'solana'
  );

  const handleExport = async () => {
    try {
      await exportWallet();
    } catch (error) {
      console.error('Error exporting wallet:', error);
    }
  };

  if (!isAuthenticated || !hasEmbeddedWallet) return null;

  return (
    <div
      onClick={handleExport}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
      role="button"
    >
      <div className="flex items-center gap-3">
        <img
          src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
          alt="Solana"
          className="h-5 w-5"
        />
        <span className="text-sm text-black">
          Gizli Anahtarı Dışa Aktar
        </span>
      </div>
      <ArrowRightFromLine className="w-4 h-4 text-black/60" />
    </div>
  );
}

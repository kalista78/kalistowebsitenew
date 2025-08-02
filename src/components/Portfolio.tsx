import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useFundWallet } from '@privy-io/react-auth/solana';
import { useCheckWallets } from '@/hooks/useCheckWallets';
import { useSolanaWalletSetup } from '@/hooks/useSolanaWalletSetup';
import { useCheckDelegation } from '@/hooks/useCheckDelegation';
import { WalletDisplay } from './WalletDisplay';
import { TransferModal } from './TransferModal';
import { DepositModal } from './DepositModal';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWalletStore } from '@/store/useWalletStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useInitialTokenData } from '@/hooks/useInitialTokenData';

// Reusable card wrapper component
const PortfolioCard = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-4 min-h-[calc(100vh-12rem)]">
    <Card className="p-6">{children}</Card>
  </div>
);

// Header component with optional balance toggle
const PortfolioHeader = ({ 
  showBalanceToggle = false, 
  showBalance, 
  onToggleBalance 
}: { 
  showBalanceToggle?: boolean;
  showBalance?: boolean;
  onToggleBalance?: () => void;
}) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-bold">Portföy</h2>
    {showBalanceToggle && (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleBalance}
          title={showBalance ? 'Bakiyeleri gizle' : 'Bakiyeleri göster'}
        >
          <Eye className="h-4 w-4 text-foreground" />
        </Button>
      </div>
    )}
  </div>
);

export function Portfolio() {
  useCheckDelegation();
  useInitialTokenData();
  
  const { authenticated, login } = usePrivy();
  const { hasSolanaWallet, ready: walletsReady } = useCheckWallets();
  const { isCreating } = useSolanaWalletSetup();
  const [showBalance, setShowBalance] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const walletAddress = useWalletStore((state) => state.walletAddress);
  const { solBalance, tokenBalances, isLoading } = useWalletBalances();
  const { fundWallet } = useFundWallet();

  const isInitializing = !walletsReady || isCreating || isLoading;

  // Add debug logging
  console.log('Portfolio Debug:', {
    walletsReady,
    isCreating,
    isLoading,
    authenticated,
    hasSolanaWallet,
    walletAddress
  });

  // Loading State
  if (isInitializing) {
    return (
      <PortfolioCard>
        <PortfolioHeader />
        <div className="text-center py-8">
          <p>Cüzdan bilgileri yükleniyor...</p>
        </div>
      </PortfolioCard>
    );
  }

  // Not Authenticated State
  if (!authenticated) {
    return (
      <PortfolioCard>
        <PortfolioHeader />
        <div className="text-center py-8">
          <p className="mb-4">Portföyünüzü görüntülemek için giriş yapın</p>
          <Button onClick={() => login()}>Giriş Yap</Button>
        </div>
      </PortfolioCard>
    );
  }

  // Connected Wallet State
  if (hasSolanaWallet && walletAddress) {
    return (
      <PortfolioCard>
        <PortfolioHeader 
          showBalanceToggle
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
        />
        
        <WalletDisplay
          address={walletAddress}
          showBalance={showBalance}
          isLoading={isLoading}
          solBalance={solBalance}
          tokenBalances={tokenBalances}
        />
        
        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1 text-foreground"
            variant="outline"
            onClick={() => setTransferOpen(true)}
          >
            Transfer
          </Button>
          <Button
            className="flex-1"
            onClick={() => setDepositOpen(true)}
          >
            Para Yatır
          </Button>
        </div>

        {transferOpen && (
          <TransferModal
            open={transferOpen}
            onClose={() => setTransferOpen(false)}
          />
        )}

        {depositOpen && (
          <DepositModal
            open={depositOpen}
            onClose={() => setDepositOpen(false)}
            walletAddress={walletAddress}
          />
        )}
      </PortfolioCard>
    );
  }

  // No Wallet State
  return (
    <PortfolioCard>
      <PortfolioHeader />
      <div className="text-center py-8">
        <p className="mb-4">Cüzdan bağlı değil</p>
        <Button onClick={() => login()}>Cüzdan Bağla</Button>
      </div>
    </PortfolioCard>
  );
}
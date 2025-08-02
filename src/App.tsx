import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Portfolio } from '@/components/Portfolio';
import { FeaturedCoins } from '@/components/FeaturedCoins';
import { TrendingCoins } from '@/components/TrendingCoins';
import { TokenPage } from '@/components/TokenPage';
import { Settings } from '@/components/Settings';
import { WelcomeModals } from '@/components/WelcomeModals';
import { FEATURED_COINS, TRENDING_COINS } from '@/lib/data';
import { Rewards } from '@/components/Rewards';
import { WalletTest } from '@/components/WalletTest';
import MichiPage from '@/pages/michi';
import { useTokensStore } from '@/store/tokensStore';
import { useInitialTokenData } from '@/hooks/useInitialTokenData';
import { useCreateSolanaWallet } from './hooks/useCreateSolanaWallet';
import { useCheckDelegation } from './hooks/useCheckDelegation';
import { useEffect } from 'react';

function HomePage() {
  // Add the hook to fetch initial token data
  useInitialTokenData();
  
  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <FeaturedCoins />
      <TrendingCoins />
    </main>
  );
}

function PortfolioPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <Portfolio />
    </main>
  );
}

function TokenPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const customTokens = useTokensStore((state) => state.tokens);
  
  // First check custom tokens
  const customToken = customTokens.find((token) => token.id === id);
  if (customToken) {
    return <TokenPage token={customToken} />;
  }
  
  // Then check predefined tokens
  const predefinedToken = [...FEATURED_COINS, ...TRENDING_COINS].find((coin) => coin.id === id);
  if (predefinedToken) {
    return <TokenPage token={predefinedToken} />;
  }

  return <div className="container py-12 text-lg text-white/60">Token bulunamadı</div>;
}

function RewardsPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <Rewards />
    </main>
  );
}

function App() {
  useCreateSolanaWallet(); // This creates the wallet if needed
  useCheckDelegation();    // This ensures delegation is requested for all users
  const fetchTokens = useTokensStore((state) => state.fetchTokens);

  // Fetch tokens on app load and every 5 minutes
  useEffect(() => {
    fetchTokens(); // Initial fetch
    const interval = setInterval(fetchTokens, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchTokens]);
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/token/:id" element={<TokenPageWrapper />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wallet-test" element={<WalletTest />} />
            <Route path="/michi" element={<MichiPage />} />
          </Routes>
        </div>
        <Footer />
        <WelcomeModals />
      </div>
    </BrowserRouter>
  );
}

export default App;
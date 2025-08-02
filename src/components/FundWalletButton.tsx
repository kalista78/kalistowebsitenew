import { usePrivy } from '@privy-io/react-auth';
import { useFundWallet } from '@privy-io/react-auth/solana';
import { useCheckWallets } from '@/hooks/useCheckWallets';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

export function FundWalletButton() {
  const { ready, authenticated } = usePrivy();
  const { solanaAddress } = useCheckWallets();

  if (!ready || !authenticated || !solanaAddress) {
    return null;
  }

  const { fundWallet } = useFundWallet({
    onUserExited: ({ balance }) => {
      // Convert balance from lamports to SOL for the message
      const solBalance = Number(balance) / 1000000000;
      toast.success(`Yeni bakiye: ${solBalance.toFixed(4)} SOL`);
    },
  });

  const handleFund = async () => {
    if (!solanaAddress) {
      toast.error('Cüzdan adresi bulunamadı');
      return;
    }

    try {
      await fundWallet(solanaAddress, {
        amount: '0.1', // Default amount suggestion: 0.1 SOL
      });
    } catch (error) {
      console.error('Para yatırma hatası:', error);
      toast.error('Para yatırma işlemi başarısız oldu');
    }
  };

  return (
    <Button
      onClick={handleFund}
      className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black font-medium rounded-xl px-4 py-2 flex items-center gap-2"
    >
      <PlusCircle className="w-5 h-5" />
      Para Yatır
    </Button>
  );
}

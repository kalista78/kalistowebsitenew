import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDelegation } from '@/hooks/useDelegation';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';
import { useCheckDelegation } from '@/hooks/useCheckDelegation';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
}

export function TransferModal({ open, onClose }: TransferModalProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isWalletDelegated, isDelegating, requestDelegation, walletToDelegate } = useDelegation();
  const { getAccessToken } = usePrivy();

  useCheckDelegation();

  useEffect(() => {
    if (open && !isWalletDelegated && !isDelegating && walletToDelegate) {
      requestDelegation().catch(error => {
        console.error('Failed to request delegation:', error);
        toast.error('Failed to get wallet access. Please try again.');
      });
    }
  }, [open, isWalletDelegated, isDelegating, walletToDelegate, requestDelegation]);

  const handleTransfer = async () => {
    if (!recipient || !amount || !walletToDelegate) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setIsLoading(true);

      // Request delegation if not already delegated
      if (!isWalletDelegated) {
        toast.loading('Cüzdan erişimi isteniyor...');
        const success = await requestDelegation();
        if (!success) {
          toast.error('Cüzdan erişimi başarısız oldu. Lütfen tekrar deneyin.');
          return;
        }
        toast.success('Cüzdan erişimi sağlandı!');
      }

      // Get the Privy authorization token
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error('Failed to get authorization token');
      }

      // Send the transaction through the API
      toast.loading('Transfer işlemi gerçekleştiriliyor...');
      console.log('Sending transfer request:', {
        userAddress: walletToDelegate.address,
        recipientAddress: recipient,
        amount: parseFloat(amount)
      });

      const response = await fetch('http://localhost:3001/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userAddress: walletToDelegate.address,
          recipientAddress: recipient,
          amount: parseFloat(amount)
        })
      });

      console.log('Response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);

      let data;
      const text = await response.text();
      console.log('Response text:', text);

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      toast.success('Transfer başarılı!');
      console.log('Transaction signature:', data.signature);
      onClose();
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(error instanceof Error ? error.message : 'Transfer başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer</DialogTitle>
          <DialogDescription>
            Başka bir cüzdana SOL gönder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Alıcı Adresi</Label>
            <Input
              id="recipient"
              placeholder="Solana adresi girin"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Miktar (SOL)</Label>
            <Input
              id="amount"
              type="number"
              step="0.000000001"
              min="0"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            İptal
          </Button>
          <Button onClick={handleTransfer} disabled={isLoading || !recipient || !amount}>
            {isLoading ? 'İşleniyor...' : 'Transfer Et'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

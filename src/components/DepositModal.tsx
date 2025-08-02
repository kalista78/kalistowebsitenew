import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useFundWallet } from '@privy-io/react-auth/solana';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function DepositModal({ open, onClose, walletAddress }: DepositModalProps) {
  const { fundWallet } = useFundWallet();
  const [activeTab, setActiveTab] = useState('qr');

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Adres kopyalandı!');
  };

  const handlePrivyFunding = () => {
    fundWallet(walletAddress);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Para Yatır</DialogTitle>
          <DialogDescription>
            Cüzdanınıza SOL yatırmak için aşağıdaki yöntemlerden birini seçin
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="qr" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr">QR Kod ile Yatır</TabsTrigger>
            <TabsTrigger value="privy">Kredi Kartı ile Yatır</TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4">
            <div className="flex justify-center py-4">
              <QRCodeSVG
                value={walletAddress}
                size={200}
                level="H"
                includeMargin
                className="bg-white p-2 rounded-lg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-muted p-2 rounded text-sm break-all">
                {walletAddress}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyAddress}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Bu adrese sadece Solana (SOL) gönderin. Başka bir token gönderirseniz fonlarınızı kaybedebilirsiniz.
            </p>
          </TabsContent>

          <TabsContent value="privy" className="space-y-4">
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-center text-sm text-muted-foreground">
                Kredi kartı ile güvenli bir şekilde SOL satın alın ve doğrudan cüzdanınıza aktarın.
              </p>
              <Button onClick={handlePrivyFunding} className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Kredi Kartı ile SOL Al
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 
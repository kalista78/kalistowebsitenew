import { useState, useEffect } from 'react';
import { useExchangeRateStore } from '@/store/exchangeRateStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Wallet, CreditCard, Info, FileText, Lock } from 'lucide-react';

const FOOTER_ITEMS = [
  {
    id: 'deposit',
    title: 'Para Yatırma',
    icon: CreditCard,
    content: (
      <div className="space-y-4">
        <p>Para yatırma işleminizi iki farklı yöntemle gerçekleştirebilirsiniz:</p>
        
        <div className="space-y-2">
          <h3 className="font-medium">1. Kredi/Banka Kartı ile:</h3>
          <ul className="list-disc pl-4 space-y-1 text-black/80">
            <li>Ana sayfada "Para Yatır" butonuna tıklayın</li>
            <li>Kart bilgilerinizi girin</li>
            <li>İşleminiz anında gerçekleşir</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">2. Solana ($SOL) ile:</h3>
          <ul className="list-disc pl-4 space-y-1 text-black/80">
            <li>Cüzdanınızı bağlayın</li>
            <li>$SOL transfer edin</li>
            <li>İşlem onaylandıktan sonra bakiyeniz güncellenir</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'how-it-works',
    title: 'Nasıl Çalışır',
    icon: Info,
    content: (
      <div className="space-y-4">
        <p>Kalisto, meme coin yatırımlarınızı güvenli ve kolay hale getirir:</p>
        
        <div className="space-y-2">
          <h3 className="font-medium">1. Hesap Oluşturma</h3>
          <p className="text-black/80">Mail veya sosyal medya hesabınızla kayıt olun. Otomatik olarak bir Solana cüzdanı oluşturulur.</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">2. Para Yatırma</h3>
          <p className="text-black/80">Kredi kartı veya $SOL ile hesabınızı fonlayın.</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">3. En İyi Fiyatlarla İşlem</h3>
          <p className="text-black/80">Gelişmiş aggregator sistemimiz sayesinde en iyi fiyatları ve rotaları otomatik olarak bulur ve uygularız. Tüm işlemlerde endüstri standardı olan %1 işlem ücreti uygulanır.</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">4. Güvenli Saklama</h3>
          <p className="text-black/80">Tokenleriniz kendi cüzdanınızda güvenle saklanır.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'mev-protection',
    title: 'MEV Koruması',
    icon: Shield,
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">MEV Nedir?</h3>
          <p className="text-black/80">MEV (Maximal Extractable Value), madencilerin veya validatörlerin işlem sıralamasını manipüle ederek kar elde etme yöntemidir.</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Nasıl Korunuyorsunuz?</h3>
          <ul className="list-disc pl-4 space-y-1 text-black/80">
            <li>Jito MEV koruması</li>
            <li>Özel routing algoritmaları</li>
            <li>İşlem gruplandırma</li>
            <li>Fiyat toleransı optimizasyonu</li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-black/10 rounded-xl">
          <p className="text-sm text-black/80">
            İşlemlerinizi MEV saldırılarından korumak için Jito validatörlerine ödenen rüşvet (bribes) ve hızlı işlem için validatörlere ödenen öncelik ücretleri gereklidir. Bu ücretlerin tamamı blockchain validatörlerine gider, Kalisto herhangi bir ücret almaz.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'terms',
    title: 'Kullanım Koşulları',
    icon: FileText,
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">1. Genel Koşullar</h3>
          <p className="text-black/80">Kalisto platformunu kullanarak bu koşulları kabul etmiş sayılırsınız. Platform, 18 yaş ve üzeri kullanıcılar içindir.</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">2. Sorumluluk Reddi</h3>
          <p className="text-black/80">Kripto para yatırımları yüksek risk içerir. Yatırımlarınızdan tamamen siz sorumlusunuz.</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">3. Hesap Güvenliği</h3>
          <p className="text-black/80">Hesap güvenliğinizden siz sorumlusunuz. Şüpheli aktivite durumunda hesabınız dondurulabilir.</p>
        </div>

        <div className="mt-4 p-3 bg-black/10 rounded-xl">
          <p className="text-sm text-black/80">Sorularınız için support@kalisto.com adresine yazabilirsiniz.</p>
        </div>
      </div>
    ),
  }
];

export function Footer() {
  const { tryRate } = useExchangeRateStore();
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Fetch SOL/TRY price
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLTRY');
        const data = await response.json();
        setSolPrice(parseFloat(data.price));
      } catch (error) {
        console.error('Error fetching SOL/TRY price:', error);
      }
    };

    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number | null) => {
    if (price === null) return '---';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <>
      <footer className="mt-auto border-t border-white/5 bg-black">
        <div className="container max-w-screen-2xl py-4">
          {/* Live Rates */}
          <div className="flex items-center justify-center gap-6 text-sm text-white/60 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">SOL/TRY:</span>
              <span>{formatPrice(solPrice)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">USDT/TRY:</span>
              <span>{formatPrice(tryRate)}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-4 justify-center">
            {FOOTER_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="text-white/60 hover:text-[#FFE147] hover:bg-white/5"
                onClick={() => setOpenModal(item.id)}
              >
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      {FOOTER_ITEMS.map((item) => (
        <Dialog
          key={item.id}
          open={openModal === item.id}
          onOpenChange={() => setOpenModal(null)}
        >
          <DialogContent className="bg-[#F7E436] border-0 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-black">
                <item.icon className="h-5 w-5" />
                {item.title}
              </DialogTitle>
            </DialogHeader>
            <div className="text-black pt-4">
              {item.content}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}
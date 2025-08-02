import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, Shield, Rocket, CreditCard, Lock } from 'lucide-react';

const WELCOME_STEPS = [
  {
    icon: Rocket,
    title: 'Erken Fırsatları Yakala',
    description: 'Binance veya BTCTurk gibi merkezi borsalara listelendiğinde artık çok geç oluyor. Biz size tokenleri doğrudan DEX\'lerden, MEV saldırı riski olmadan ve rug çekme riskini minimize ederek alma imkanı sunuyoruz.',
  },
  {
    icon: Wallet,
    title: 'Kolay Başlangıç',
    description: 'Mail, Gmail veya Twitter hesabınızla giriş yapın. dApp\'imiz otomatik olarak size bir Solana cüzdanı oluşturup, tokenleri henüz ucuzken alabilmeniz için gereken altyapıyı sağlayacak. Artık hayat değiştiren getirileri yakalayabilir ve exit likidite olmaktan kurtulabilirsiniz.',
  },
  {
    icon: CreditCard,
    title: 'Güvenli İşlemler',
    description: 'Hesabınızı $SOL veya kredi kartı ile fonlayın ve doğrudan zincir üzerinde işlem yapmaya başlayın. MEV saldırılarına karşı korunurken, özenle seçilmiş meme token kütüphanesine erişim sağlayın.',
  },
  {
    icon: Lock,
    title: 'Tam Kontrol',
    description: 'Paranızı istediğiniz zaman, doğrudan cüzdanınızdan, hiçbir onay veya limit olmadan çekebilirsiniz - tamamen zincir üzerinde.',
  },
  {
    icon: Shield,
    title: 'Hazırsınız!',
    description: 'Artık erken yatırım fırsatlarını değerlendirmeye başlayabilirsiniz. Hemen keşfetmeye başlayın!',
  },
];

export function WelcomeModals() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome modals before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep === WELCOME_STEPS.length - 1) {
      setIsOpen(false);
      localStorage.setItem('hasSeenWelcome', 'true');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const currentStepData = WELCOME_STEPS[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#F7E436] border-0 rounded-3xl p-8 max-w-lg">
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-black/10 p-4 rounded-2xl">
              <Icon className="h-12 w-12 text-black" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-black">
              {currentStepData.title}
            </h2>
            <p className="text-black/80 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {WELCOME_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-black w-4'
                    : index < currentStep
                    ? 'bg-black/40'
                    : 'bg-black/20'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleNext}
            className="w-full h-12 bg-black text-white rounded-full hover:bg-black/90 gap-2"
          >
            {currentStep === WELCOME_STEPS.length - 1 ? (
              'Başla'
            ) : (
              <>
                Devam Et
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Skip Button */}
          {currentStep < WELCOME_STEPS.length - 1 && (
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                localStorage.setItem('hasSeenWelcome', 'true');
              }}
              className="w-full text-black/60 hover:text-black hover:bg-black/5"
            >
              Geç
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
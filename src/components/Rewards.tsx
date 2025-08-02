import { Copy, Share2, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePrivy } from '@privy-io/react-auth';

export function Rewards() {
  const { authenticated, login } = usePrivy();
  const referralCode = 'KALISTO2024';
  const referralLink = `https://kalisto.com/ref/${referralCode}`;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Ana Ödül Kartı */}
      <Card className="yellow-card border-0 rounded-3xl p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-black">Ödül Programı</h1>
              <p className="text-black/60">Arkadaşlarını davet et, ödüller kazan</p>
            </div>
            <Trophy className="h-12 w-12 text-black" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-black/10 border-0 rounded-2xl p-4">
              <div className="space-y-1">
                <p className="text-black/60 text-sm">Toplam Kazanç</p>
                <p className="text-2xl font-bold text-black">₺0</p>
              </div>
            </Card>
            <Card className="bg-black/10 border-0 rounded-2xl p-4">
              <div className="space-y-1">
                <p className="text-black/60 text-sm">Davet Ettiğin Kişiler</p>
                <p className="text-2xl font-bold text-black">0</p>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Referans Kartı */}
      <Card className="border-0 bg-[#F7E436] p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-black/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-black">Referans Programı</h2>
            <p className="text-black/60">Her başarılı davet için %5 komisyon kazan</p>
          </div>
        </div>

        {authenticated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Seviye İlerlemen</span>
                <span className="text-black font-medium">0/5 Davet</span>
              </div>
              <Progress value={0} className="bg-black/10 h-3 rounded-full">
                <div className="h-full bg-black rounded-full transition-all" />
              </Progress>
            </div>

            <div className="p-4 bg-black/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-black/60">Referans Kodun</span>
                <div className="flex items-center gap-2">
                  <code className="bg-black/5 px-2 py-1 rounded text-black font-medium">
                    {referralCode}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-black/60 hover:text-black hover:bg-black/10"
                    onClick={() => navigator.clipboard.writeText(referralCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-black/60">Referans Linkin</span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-black/60 hover:text-black hover:bg-black/10 gap-2"
                    onClick={() => navigator.clipboard.writeText(referralLink)}
                  >
                    <Share2 className="h-4 w-4" />
                    Paylaş
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 py-4">
            <p className="text-black/60">
              Referans programına katılmak için giriş yapmalısın
            </p>
            <Button 
              className="bg-black text-white hover:bg-black/90 rounded-full px-8"
              onClick={login}
            >
              Giriş Yap
            </Button>
          </div>
        )}
      </Card>

      {/* Ödül Seviyeleri */}
      <Card className="border-0 bg-[#F7E436] p-6 rounded-3xl">
        <h2 className="text-lg font-medium text-black mb-4">Ödül Seviyeleri</h2>
        <div className="space-y-3">
          {[
            { level: 1, invites: 5, reward: '₺100 Bonus + %7 Komisyon' },
            { level: 2, invites: 15, reward: '₺300 Bonus + %10 Komisyon' },
            { level: 3, invites: 30, reward: '₺1000 Bonus + %15 Komisyon' },
          ].map((tier) => (
            <div 
              key={tier.level}
              className="flex items-center justify-between p-4 bg-black/10 rounded-2xl"
            >
              <div className="space-y-1">
                <div className="font-medium text-black">Seviye {tier.level}</div>
                <div className="text-sm text-black/60">{tier.invites} Davet</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-black">{tier.reward}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
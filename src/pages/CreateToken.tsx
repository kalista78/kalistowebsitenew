import { usePrivy } from '@privy-io/react-auth';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_EMAILS } from '@/lib/constants';

export function CreateToken() {
  const { user, authenticated } = usePrivy();

  // Check if user is authenticated and has an admin email
  if (!authenticated || !user?.email?.address || !ADMIN_EMAILS.includes(user.email.address)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Card className="yellow-card border-0 rounded-3xl p-6">
        <h1 className="text-2xl font-bold text-black mb-6">Token Oluştur</h1>
        
        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-black">Token Adı</Label>
              <Input 
                id="name"
                placeholder="Token adını girin"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-[#FFE147]"
              />
            </div>

            <div>
              <Label htmlFor="symbol" className="text-black">Token Sembolü</Label>
              <Input 
                id="symbol"
                placeholder="Token sembolünü girin"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-[#FFE147]"
              />
            </div>

            <div>
              <Label htmlFor="supply" className="text-black">Toplam Arz</Label>
              <Input 
                id="supply"
                type="number"
                placeholder="Toplam arzı girin"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-[#FFE147]"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-black">Proje Açıklaması</Label>
              <textarea 
                id="description"
                placeholder="Proje açıklamasını girin"
                className="flex w-full rounded-md border-0 bg-black/10 px-3 py-2 text-black placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE147] min-h-[100px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-black">Website</Label>
              <Input 
                id="website"
                type="url"
                placeholder="Website adresini girin"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-[#FFE147]"
              />
            </div>

            <div>
              <Label htmlFor="twitter" className="text-black">Twitter</Label>
              <Input 
                id="twitter"
                placeholder="Twitter kullanıcı adını girin"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-[#FFE147]"
              />
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full h-12 bg-black text-white rounded-full hover:bg-black/90"
          >
            Token Oluştur
          </Button>
        </form>
      </Card>
    </div>
  );
}

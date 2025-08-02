import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useTokensStore } from '@/store/tokensStore';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { TOKEN_TAG_OPTIONS, TOKEN_TAGS } from "@/lib/constants";
import { ADMIN_EMAILS } from '@/lib/constants';
import { toast } from 'sonner';

interface CreateTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTokenDialog({ open, onOpenChange }: CreateTokenDialogProps) {
  const { user, authenticated } = usePrivy();
  const navigate = useNavigate();
  const addToken = useTokensStore((state) => state.addToken);
  const [imageType, setImageType] = useState<'upload' | 'url'>('upload');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    image: '',
    twitter: '',
    telegram: '',
    website: '',
    description: '',
    contractAddress: '',
    decimals: 9,
  });

  const isAuthorized = authenticated && user?.email?.address && ADMIN_EMAILS.includes(user.email.address);

  if (!isAuthorized) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Ensure symbol starts with $
      const symbol = formData.symbol.startsWith('$') ? formData.symbol : `$${formData.symbol}`;
      
      console.log('Creating token with form data:', formData); // Debug log
      
      // Ensure we have at least one tag
      const finalTags = selectedTags.length > 0 
        ? selectedTags 
        : [TOKEN_TAGS.GENERAL];
        
      // Create a new token
      const newToken = {
        id: formData.contractAddress.toLowerCase(),
        symbol: symbol,
        name: formData.name,
        image: formData.image,
        emoji: '💎', // Default emoji for new tokens
        age: 'Yeni',
        ca: formData.contractAddress,
        twitter: formData.twitter,
        telegram: formData.telegram,
        website: formData.website,
        description: formData.description,
        tags: finalTags, // Use our processed tags
        listed_at: new Date().toISOString(),
        social_links: {
          twitter: formData.twitter,
          telegram: formData.telegram,
          website: formData.website,
        },
        is_verified: false,
        is_new: true,
        decimals: formData.decimals
      };

      console.log('Submitting token data:', newToken); // Debug log

      // Add token to store
      await addToken(newToken);
      console.log('Token added successfully'); // Debug log
      toast.success('Token başarıyla oluşturuldu!');

      // Close dialog
      onOpenChange(false);

      // Navigate to the new token page
      navigate(`/token/${newToken.id}`);
    } catch (error) {
      console.error('Failed to create token:', error);
      toast.error('Token oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#FFE147] border-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">Token Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-black">Token Adı</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Token adını girin"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black">Token Sembolü</Label>
              <Input 
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="$SEMBOL"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-black"
                required
              />
            </div>

            <div>
              <Label className="text-black">Profil Resmi</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={imageType === 'upload' ? 'default' : 'outline'}
                    className={imageType === 'upload' ? 'bg-black text-white' : 'bg-black/10 border-0 text-black hover:bg-black/20'}
                    onClick={() => setImageType('upload')}
                  >
                    Yükle
                  </Button>
                  <Button
                    type="button"
                    variant={imageType === 'url' ? 'default' : 'outline'}
                    className={imageType === 'url' ? 'bg-black text-white' : 'bg-black/10 border-0 text-black hover:bg-black/20'}
                    onClick={() => setImageType('url')}
                  >
                    URL
                  </Button>
                </div>
                {imageType === 'upload' ? (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-black/20 border-dashed rounded-2xl cursor-pointer bg-black/5 hover:bg-black/10">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImagePlus className="w-8 h-8 mb-2 text-black/40" />
                        <p className="text-sm text-black/60">Resim yüklemek için tıklayın</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                ) : (
                  <Input 
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Resim URL'sini girin"
                    className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-black"
                    required={imageType === 'url'}
                  />
                )}
              </div>
            </div>

            <div>
              <Label className="text-black">Sosyal Medya</Label>
              <div className="space-y-2">
                <Input 
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="Twitter"
                  className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-black"
                />
                <Input 
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  placeholder="Telegram"
                  className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-black"
                />
                <Input 
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="Website"
                  className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-black"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-black">Proje Açıklaması</Label>
              <textarea 
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Proje açıklamasını girin"
                className="flex w-full rounded-md border-0 bg-black/10 px-3 py-2 text-black placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black min-h-[100px] resize-none"
                required
              />
            </div>

            <div>
              <Label className="text-black">Etiketler</Label>
              <div className="space-y-2">
                {TOKEN_TAG_OPTIONS.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTags([...selectedTags, tag]);
                        } else {
                          setSelectedTags(selectedTags.filter((t) => t !== tag));
                        }
                      }}
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="contractAddress" className="text-black">Kontrat Adresi</Label>
              <Input 
                id="contractAddress"
                value={formData.contractAddress}
                onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
                placeholder="Kontrat adresini girin"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-black font-mono"
                required
              />
            </div>

            <div>
              <Label htmlFor="decimals" className="text-black">Token Ondalık Sayısı</Label>
              <Input 
                id="decimals"
                type="number"
                min="0"
                max="18"
                value={formData.decimals}
                onChange={(e) => setFormData({ ...formData, decimals: parseInt(e.target.value) })}
                placeholder="Token ondalık sayısını girin"
                className="bg-black/10 border-0 text-black placeholder:text-black/40 focus-visible:ring-black"
                required
              />
              <p className="text-xs text-black/60 mt-1">
                Token'in ondalık hassasiyeti (genellikle 9 veya 6)
              </p>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full h-12 bg-black text-white rounded-full hover:bg-black/90"
          >
            Token Oluştur
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

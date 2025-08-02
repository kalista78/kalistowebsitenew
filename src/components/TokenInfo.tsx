import { Card } from '@/components/ui/card';
import { ExternalLink, Globe, Twitter, Copy, MessageCircle, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import useTokenStore from '@/store/tokenStore';

interface TokenInfoProps {
  token: {
    name: string;
    ca?: string;
    description?: string;
    twitter?: string;
    telegram?: string;
    website?: string;
    id: string;
  };
}

export function TokenInfo({ token }: TokenInfoProps) {
  const { getTokenData } = useTokenStore();
  const tokenData = getTokenData(token.ca || token.id);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kontrat adresi kopyalandı');
  };

  const getRugcheckUrl = (contractAddress: string) => {
    return `https://rugcheck.xyz/tokens/${contractAddress}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Project Description */}
        <Card className="p-4 bg-black/10 border-0 rounded-2xl">
          <h3 className="text-sm font-medium text-black/60 mb-2">Proje Açıklaması</h3>
          <p className="text-sm text-black">
            {token.description || "Bu token için henüz bir açıklama eklenmemiş."}
          </p>
        </Card>

        {/* Market Data */}
        <Card className="p-4 bg-black/10 border-0 rounded-2xl">
          <h3 className="text-sm font-medium text-black/60 mb-4">Piyasa Bilgileri</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-black/60">Fiyat (TRY)</div>
              <div className="text-lg font-medium">
                {tokenData ? tokenData.formattedPrice : 'Yükleniyor...'}
              </div>
              {tokenData && (
                <div className={cn(
                  "text-sm font-medium",
                  tokenData.price_change_24h > 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                )}>
                  {tokenData.formattedPriceChange}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-black/60">Market Değeri</div>
              <div className="text-lg font-medium">
                {tokenData ? tokenData.formattedMarketCap : 'Yükleniyor...'}
              </div>
            </div>
            <div>
              <div className="text-sm text-black/60">24s Hacim</div>
              <div className="text-lg font-medium">
                {tokenData ? tokenData.formattedVolume : 'Yükleniyor...'}
              </div>
            </div>
            <div>
              <div className="text-sm text-black/60">Likidite</div>
              <div className="text-lg font-medium">
                {tokenData ? tokenData.formattedLiquidity : 'Yükleniyor...'}
              </div>
            </div>
          </div>
        </Card>

        {/* Contract Address */}
        {token.ca && (
          <Card className="p-4 bg-black/10 border-0 rounded-2xl">
            <h3 className="text-sm font-medium text-black/60 mb-2">Kontrat Adresi</h3>
            <div className="flex items-center justify-between gap-2 bg-black/5 p-2 rounded-lg">
              <code className="text-sm text-black font-mono">{token.ca}</code>
              <button
                onClick={() => copyToClipboard(token.ca!)}
                className="p-1 hover:bg-black/10 rounded"
              >
                <Copy className="h-4 w-4 text-black/60" />
              </button>
            </div>
          </Card>
        )}

        {/* Links and Security */}
        <Card className="p-4 bg-black/10 border-0 rounded-2xl">
          <h3 className="text-sm font-medium text-black/60 mb-4">Sosyal Medya & Linkler</h3>
          <div className="space-y-3">
            {token.twitter && (
              <a 
                href={token.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Twitter className="h-4 w-4" /> Twitter
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            )}

            {token.telegram && (
              <a 
                href={token.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Telegram
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            )}

            {token.website && (
              <a 
                href={token.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Globe className="h-4 w-4" /> Website
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            )}

            {token.ca && (
              <a 
                href={getRugcheckUrl(token.ca)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Shield className="h-4 w-4" /> Güvenlik
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
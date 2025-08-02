import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokensStore } from '@/store/tokensStore';
import { TOKEN_TAGS } from '@/lib/constants';
import useTokenStore from '@/store/tokenStore';

const TRENDING_COINS = [
  // Add default TRENDING coins here
];

const categories = [
  TOKEN_TAGS.TRENDING,
  TOKEN_TAGS.NEW,
  TOKEN_TAGS.CAT,
  TOKEN_TAGS.DOG,
  TOKEN_TAGS.AI,
  TOKEN_TAGS.MEME,
  TOKEN_TAGS.GENERAL,
  TOKEN_TAGS.FEATURED,
];

export function TrendingCoins() {
  const [activeCategory, setActiveCategory] = useState(TOKEN_TAGS.TRENDING);
  const navigate = useNavigate();
  const { tokens, getTrendingTokens, getFeaturedTokens } = useTokensStore();
  const tokenStore = useTokenStore();
  const getTokenData = tokenStore.getTokenData;
  const isLoading = tokenStore.isLoading;

  const filteredCoins = (() => {
    let coins;
    switch (activeCategory) {
      case TOKEN_TAGS.TRENDING:
        coins = getTrendingTokens();
        // Sort trending tokens by 24h price change
        return coins.sort((a, b) => {
          const aData = getTokenData(a.ca || a.id);
          const bData = getTokenData(b.ca || b.id);
          
          const aChange = aData?.price_change_24h || a.change || 0;
          const bChange = bData?.price_change_24h || b.change || 0;
          
          return bChange - aChange;
        });
      case TOKEN_TAGS.NEW:
        // Show all tokens sorted by listing date
        return tokens.sort((a, b) => {
          const aTime = a.listedAt || 0;
          const bTime = b.listedAt || 0;
          return bTime - aTime; // Newest first
        });
      case TOKEN_TAGS.CAT:
        coins = tokens.filter(token => token.tags?.includes(TOKEN_TAGS.CAT));
        break;
      case TOKEN_TAGS.DOG:
        coins = tokens.filter(token => token.tags?.includes(TOKEN_TAGS.DOG));
        break;
      case TOKEN_TAGS.AI:
        coins = tokens.filter(token => token.tags?.includes(TOKEN_TAGS.AI));
        break;
      case TOKEN_TAGS.MEME:
        coins = tokens.filter(token => token.tags?.includes(TOKEN_TAGS.MEME));
        break;
      case TOKEN_TAGS.GENERAL:
        // Show all tokens sorted by name for easy browsing
        return [...tokens].sort((a, b) => a.name.localeCompare(b.name));
      case TOKEN_TAGS.FEATURED:
        coins = getFeaturedTokens();
        break;
      default:
        coins = getTrendingTokens();
    }

    return coins;
  })();

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? "secondary" : "ghost"}
            className={cn(
              "transition-all rounded-full",
              activeCategory === category 
                ? "bg-[#F7E436] text-black hover:bg-[#F7E436]/90" 
                : "text-white/60 hover:text-[#F7E436] hover:bg-white/5"
            )}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredCoins.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            Bu kategoride henüz token bulunmuyor
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredCoins.map((coin) => {
              const tokenData = getTokenData(coin.ca || coin.id);
              return (
                <Card
                  key={coin.id}
                  className="flex items-center gap-4 p-4 border border-white/10 hover:border-[#F7E436] bg-white/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl"
                  onClick={() => navigate(`/token/${coin.id}`)}
                >
                  <div className="relative">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="h-12 w-12 rounded-full ring-2 ring-black/20"
                    />
                    <span className="absolute -bottom-1 -right-1 text-base">
                      {coin.emoji}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{coin.name}</span>
                      {coin.isNew && (
                        <Badge variant="secondary" className="bg-[#F7E436] text-black">
                          Yeni
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-4 text-xs text-white/60">
                      <div>
                        <span className="block">Market Değeri</span>
                        <span className="font-medium text-white">
                          {isLoading 
                            ? "Yükleniyor..." 
                            : tokenData?.marketCap 
                              ? `₺${Number(tokenData.marketCap).toLocaleString('tr-TR')}` 
                              : '₺0'}
                        </span>
                      </div>
                      <div>
                        <span className="block">24s Hacim</span>
                        <span className="font-medium text-white">
                          {isLoading 
                            ? "Yükleniyor..." 
                            : tokenData?.volume24h 
                              ? `₺${Number(tokenData.volume24h).toLocaleString('tr-TR')}` 
                              : '₺0'}
                        </span>
                      </div>
                      <div>
                        <span className="block">Likidite</span>
                        <span className="font-medium text-white">
                          {isLoading 
                            ? "Yükleniyor..." 
                            : tokenData?.liquidity 
                              ? `₺${Number(tokenData.liquidity).toLocaleString('tr-TR')}` 
                              : '₺0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={cn(
                      "font-medium text-[#F7E436]",
                      isLoading && "animate-pulse"
                    )}>
                      {isLoading ? "Yükleniyor..." : tokenData ? tokenData.formattedPrice : coin.price}
                    </div>
                    {(tokenData?.price_change_24h || coin.change) && (
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isLoading && "animate-pulse",
                          (tokenData?.price_change_24h || coin.change) > 0
                            ? "text-[#22C55E]"
                            : "text-[#EF4444]"
                        )}
                      >
                        {isLoading 
                          ? "..." 
                          : tokenData
                            ? tokenData.formattedPriceChange
                            : `${coin.change > 0 ? "+" : ""}${coin.change}%`}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
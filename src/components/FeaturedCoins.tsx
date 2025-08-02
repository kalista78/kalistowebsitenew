import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FEATURED_COINS } from '@/lib/data';
import { useTokensStore } from '@/store/tokensStore';
import useTokenStore from '@/store/tokenStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { TOKEN_TAGS } from '@/lib/constants';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function FeaturedCoins() {
  const navigate = useNavigate();
  const customTokens = useTokensStore((state) => state.tokens);
  const tokenStore = useTokenStore();
  const getTokenData = tokenStore.getTokenData;
  const isLoading = tokenStore.isLoading;
  
  // Add default FEATURED tag to FEATURED_COINS and filter custom tokens with FEATURED tag
  const featuredDefaultCoins = FEATURED_COINS.map(coin => ({
    ...coin,
    tags: [TOKEN_TAGS.FEATURED]
  }));
  
  const featuredCustomTokens = customTokens.filter(token => 
    token.tags?.includes(TOKEN_TAGS.FEATURED)
  );
  
  const allCoins = [...featuredDefaultCoins, ...featuredCustomTokens];

  // Create autoplay plugin instance
  const autoplayPlugin = Autoplay({
    delay: 3000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-sm font-medium text-[#F7E436] animate-pulse">
          Öne Çıkanlar
        </span>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[autoplayPlugin]}
        className="w-full relative"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {allCoins.map((coin) => {
            const data = getTokenData(coin.ca || coin.id);
            return (
              <CarouselItem key={coin.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5">
                <Card
                  className="group relative overflow-hidden border border-white/10 hover:border-[#F7E436] bg-white/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-3xl"
                  onClick={() => navigate(`/token/${coin.id}`)}
                >
                  <div className="absolute top-2 right-2 z-10 text-2xl animate-bounce">
                    {coin.emoji}
                  </div>
                  <div className="aspect-square overflow-hidden rounded-t-2xl">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-300"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-lg">{coin.name}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "bg-black/50 backdrop-blur-sm border-0 font-bold",
                          isLoading ? "animate-pulse" : "",
                          data && data.price_change_24h > 0 ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {isLoading ? "..." : data ? data.formattedPriceChange : '0%'}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <span className={cn(
                        "text-white/60 text-sm",
                        isLoading && "animate-pulse"
                      )}>
                        {isLoading ? "Yükleniyor..." : data ? data.formattedPrice : '₺0,00'}
                      </span>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
}
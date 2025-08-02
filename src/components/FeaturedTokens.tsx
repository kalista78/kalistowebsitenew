import { Card } from '@/components/ui/card';
import { FEATURED_COINS } from '@/config/tokens';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { Link } from 'react-router-dom';
import { formatPrice, formatLargeNumber } from '@/utils/format';

export function FeaturedTokens() {
  const { prices, loading } = useTokenPrices();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {FEATURED_COINS.map((token) => {
        const tokenPrice = prices[token.id];
        
        return (
          <Link key={token.id} to={`/token/${token.id}`}>
            <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
              <img
                src={token.image}
                alt={token.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">${token.id}</h3>
                    <p className="text-lg font-semibold text-white">
                      {loading ? (
                        '₺--'
                      ) : tokenPrice ? (
                        formatPrice(tokenPrice.priceTRY)
                      ) : (
                        '₺0,00'
                      )}
                    </p>
                  </div>
                  
                  {!loading && tokenPrice && (
                    <div className={`px-2 py-1 rounded-full text-sm ${
                      tokenPrice.priceChange24h >= 0 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {tokenPrice.priceChange24h > 0 ? '+' : ''}
                      {tokenPrice.priceChange24h.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              
              {token.badge && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-400/20">
                    {token.badge}
                  </span>
                </div>
              )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
} 
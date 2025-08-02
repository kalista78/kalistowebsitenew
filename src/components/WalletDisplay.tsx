import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { formatTRY, formatLargeTRY } from '@/utils/solana';
import { TokenBalance } from '@/utils/solana';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokensStore } from '@/store/tokensStore';
import useTokenStore from '@/store/tokenStore';
import { useNavigate } from 'react-router-dom';

interface WalletDisplayProps {
  address: string | null;
  showBalance: boolean;
  isLoading: boolean;
  solBalance: number;
  tokenBalances: TokenBalance[];
}

export function WalletDisplay({
  address,
  showBalance,
  isLoading,
  solBalance,
  tokenBalances
}: WalletDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const navigate = useNavigate();
  const { getToken } = useTokensStore();
  const { getTokenData } = useTokenStore();

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

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast.success('Adres panoya kopyalandı');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate total portfolio value in TRY
  const calculateTotalValue = () => {
    if (!showBalance) return null;
    
    let total = 0;
    
    // Add SOL value using direct TRY price
    if (solPrice !== null) {
      const solValue = solBalance * solPrice;
      console.log('SOL Değeri:', {
        balance: solBalance,
        price: solPrice,
        value: solValue
      });
      total += solValue;
    }
    
    // Add token values - prices are already in TRY
    tokenBalances.forEach((token) => {
      const tokenData = getTokenData(token.mint);
      if (tokenData?.price) {
        const tokenValue = token.amount * tokenData.price;
        console.log('Token Değeri:', {
          token: token.mint,
          amount: token.amount,
          price: tokenData.price,
          value: tokenValue
        });
        total += tokenValue;
      }
    });
    
    console.log('Toplam Portföy Değeri:', total);
    return total;
  };

  const totalValue = calculateTotalValue();

  if (!address) {
    return (
      <div className="text-center py-4">
        <p>Cüzdan bağlı değil</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Portfolio Value */}
      {totalValue !== null && (
        <Card className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-50">
          <h3 className="text-sm font-medium text-black/60 mb-1">Toplam Portföy Değeri</h3>
          <p className="text-2xl font-bold">{formatLargeTRY(totalValue)}</p>
        </Card>
      )}

      {/* Wallet Address */}
      <div>
        <h3 className="text-sm font-medium mb-2">Cüzdan Adresi</h3>
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors">
          <p className="font-mono text-sm break-all">{address}</p>
          <button
            onClick={copyAddress}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            title="Adresi kopyala"
          >
            <Copy className="w-4 h-4 text-black/60" />
          </button>
        </div>
      </div>

      {/* SOL Balance */}
      <div>
        <h3 className="text-sm font-medium mb-2">SOL Bakiyesi</h3>
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <div>
            <p className="text-lg font-semibold">
              {showBalance ? `${solBalance.toFixed(4)} SOL` : '***'}
            </p>
            {solPrice !== null && showBalance && (
              <p className="text-sm text-black/60">
                {formatTRY(solBalance * solPrice)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Token Balances */}
      {tokenBalances.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Token Bakiyeleri</h3>
          <div className="space-y-2">
            {tokenBalances.map((token) => {
              const listedToken = getToken(token.mint);
              const tokenData = listedToken ? getTokenData(token.mint) : null;

              if (!listedToken) return null;

              const tokenValue = tokenData?.price ? token.amount * tokenData.price : null;

              return (
                <Card 
                  key={token.mint} 
                  className="p-4 cursor-pointer hover:bg-black/5 transition-colors"
                  onClick={() => navigate(`/token/${listedToken.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {listedToken.image && (
                        <img 
                          src={listedToken.image} 
                          alt={listedToken.name} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{listedToken.name}</p>
                          {listedToken.isVerified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Doğrulanmış
                            </span>
                          )}
                        </div>
                        {showBalance && (
                          <p className="text-sm text-black/60">
                            {token.amount.toFixed(4)} {listedToken.symbol}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {isLoading ? (
                        <Skeleton className="h-6 w-20" />
                      ) : (
                        <>
                          {tokenValue && showBalance && (
                            <p className="font-medium">{formatTRY(tokenValue)}</p>
                          )}
                          {tokenData?.price_change_24h && (
                            <p className={`text-sm ${tokenData.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {tokenData.price_change_24h >= 0 ? '+' : ''}{tokenData.price_change_24h.toFixed(2)}%
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

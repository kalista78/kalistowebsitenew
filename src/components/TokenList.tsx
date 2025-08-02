import { TokenBalance } from '@/utils/solana';
import { useExchangeRateStore } from '@/store/exchangeRateStore';
import useTokenStore from '@/store/tokenStore';

interface TokenListProps {
  tokens: TokenBalance[];
  loading: boolean;
  showBalances: boolean;
}

export function TokenList({ tokens, loading, showBalances }: TokenListProps) {
  const { tryRate } = useExchangeRateStore();
  const { getTokenData } = useTokenStore();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-black/60">Henüz token bulunmuyor</p>
      </div>
    );
  }

  const formatTRY = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const calculateTokenValue = (token: TokenBalance, tryRate: number | null) => {
    const tokenData = getTokenData(token.mint);
    if (!tokenData || !tokenData.price || !tryRate) return null;
    return token.amount * tokenData.price * tryRate;
  };

  return (
    <div className="space-y-4">
      {tokens.map((token) => {
        const tokenData = getTokenData(token.mint);
        if (!tokenData) return null;

        const tryValue = calculateTokenValue(token, tryRate);

        return (
          <div key={token.mint} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {token.logoURI ? (
                <img
                  src={token.logoURI}
                  alt={token.symbol || 'Token'}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {token.symbol?.[0] || '?'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-black">{tokenData.name}</h3>
                <p className="text-sm text-black/60">{token.amount.toFixed(4)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-black">
                {tryValue === null ? '₺--' : formatTRY(tryValue)}
              </p>
              {tokenData.price && (
                <p className="text-sm text-black/60">
                  ${tokenData.price.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

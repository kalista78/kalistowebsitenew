import { create } from 'zustand';
import { tokenDataCache } from '../utils/tokenDataCache';

export interface TokenData {
  price: number;
  price_change_24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  formattedPrice: string;
  formattedPriceChange: string;
  formattedMarketCap: string;
  formattedVolume: string;
  formattedLiquidity: string;
}

interface TokenState {
  tokenData: Record<string, TokenData>;
  isLoading: boolean;
  error: string | null;
  getTokenData: (tokenMint: string) => TokenData | null;
  fetchTokenData: (tokenMint: string, tryRate: number, dexScreenerData?: any) => Promise<void>;
}

const useTokenStore = create<TokenState>((set, get) => ({
  tokenData: {},
  isLoading: false,
  error: null,
  
  getTokenData: (tokenMint: string) => {
    const state = get();
    const data = state.tokenData[tokenMint];
    if (!data) return null;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    return {
      ...data,
      formattedPrice: new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }).format(data.price),
      formattedPriceChange: `${data.price_change_24h >= 0 ? '+' : ''}${data.price_change_24h.toFixed(2)}%`,
      formattedMarketCap: formatCurrency(data.marketCap),
      formattedVolume: formatCurrency(data.volume24h),
      formattedLiquidity: formatCurrency(data.liquidity)
    };
  },

  fetchTokenData: async (tokenMint: string, tryRate: number, dexScreenerData?: any) => {
    set({ isLoading: true });

    try {
      let tokenData: TokenData;
      
      // First try to use provided DEXScreener data
      if (dexScreenerData) {
        const marketCapTRY = (dexScreenerData.marketCap || 0) * tryRate;
        const volume24hTRY = (dexScreenerData.volume24h || 0) * tryRate;
        const liquidityTRY = (dexScreenerData.liquidity || 0) * tryRate;
        const priceTRY = (dexScreenerData.price || 0) * tryRate;

        tokenData = {
          price: priceTRY,
          price_change_24h: dexScreenerData.priceChange24h || 0,
          marketCap: marketCapTRY,
          volume24h: volume24hTRY,
          liquidity: liquidityTRY,
          formattedPrice: '',
          formattedPriceChange: '',
          formattedMarketCap: '',
          formattedVolume: '',
          formattedLiquidity: ''
        };
      } else {
        // Try to fetch from DEXScreener API
        try {
          const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`,
            {} as RequestInit
          );

          if (!response.ok) {
            throw new Error('Failed to fetch token data');
          }

          const data = await response.json();
          const pair = data.pairs?.[0];

          if (!pair) {
            throw new Error('No pair data found');
          }

          // Convert USD values to TRY
          const marketCapTRY = (pair.fdv || 0) * tryRate;
          const volume24hTRY = (pair.volume?.h24 || 0) * tryRate;
          const liquidityTRY = (pair.liquidity?.usd || 0) * tryRate;
          const priceTRY = Number(pair.priceUsd || 0) * tryRate;

          tokenData = {
            price: priceTRY,
            price_change_24h: pair.priceChange?.h24 || 0,
            marketCap: marketCapTRY,
            volume24h: volume24hTRY,
            liquidity: liquidityTRY,
            formattedPrice: '',
            formattedPriceChange: '',
            formattedMarketCap: '',
            formattedVolume: '',
            formattedLiquidity: ''
          };
        } catch (error) {
          // If DEXScreener fetch fails, try to use cached data
          const cachedData = tokenDataCache.get<TokenData>(tokenMint);
          if (cachedData && isValidTokenData(cachedData)) {
            tokenData = cachedData;
          } else {
            // If no valid cached data, create empty data structure
            tokenData = {
              price: 0,
              price_change_24h: 0,
              marketCap: 0,
              volume24h: 0,
              liquidity: 0,
              formattedPrice: '₺0,00',
              formattedPriceChange: '0%',
              formattedMarketCap: '₺0',
              formattedVolume: '₺0',
              formattedLiquidity: '₺0'
            };
          }
        }
      }

      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { 
          style: 'currency', 
          currency: 'TRY',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      };

      // Format the values
      tokenData.formattedPrice = new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }).format(tokenData.price);
      
      tokenData.formattedPriceChange = `${tokenData.price_change_24h >= 0 ? '+' : ''}${tokenData.price_change_24h.toFixed(2)}%`;
      tokenData.formattedMarketCap = formatCurrency(tokenData.marketCap);
      tokenData.formattedVolume = formatCurrency(tokenData.volume24h);
      tokenData.formattedLiquidity = formatCurrency(tokenData.liquidity);

      set((state) => ({
        tokenData: {
          ...state.tokenData,
          [tokenMint]: tokenData
        },
        isLoading: false,
        error: null
      }));

      // Cache the token data
      tokenDataCache.set(tokenMint, tokenData);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  }
}));

// Helper function to validate TokenData structure
const isValidTokenData = (data: any): data is TokenData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.price === 'number' &&
    typeof data.price_change_24h === 'number' &&
    typeof data.marketCap === 'number' &&
    typeof data.volume24h === 'number' &&
    typeof data.liquidity === 'number' &&
    typeof data.formattedPrice === 'string' &&
    typeof data.formattedPriceChange === 'string' &&
    typeof data.formattedMarketCap === 'string' &&
    typeof data.formattedVolume === 'string' &&
    typeof data.formattedLiquidity === 'string'
  );
};

export default useTokenStore;

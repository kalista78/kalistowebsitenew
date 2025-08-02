import { useEffect } from 'react';
import { useBinancePrice } from './useBinancePrice';
import { useDexScreener } from './useDexScreener';
import useTokenStore from '../store/tokenStore';

interface TokenData {
  price: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  liquidity: number;
  usdPrice: number;
  formattedPrice: string;
  formattedPriceChange: string;
  formattedMarketCap: string;
  formattedVolume: string;
  formattedLiquidity: string;
}

export function useTokenData(tokenMint: string = '5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp') {
  const { tryRate, isLoading: isLoadingRate } = useBinancePrice();
  const { tokenData: dexScreenerData, isLoading: isLoadingDex, error: dexError } = useDexScreener(tokenMint);
  const tokenStore = useTokenStore();
  const tokenData = tokenStore.getTokenData(tokenMint);

  useEffect(() => {
    if (!isLoadingRate && !isLoadingDex && dexScreenerData) {
      tokenStore.fetchTokenData(tokenMint, tryRate, dexScreenerData);
    }
  }, [tokenMint, tryRate, dexScreenerData, isLoadingRate, isLoadingDex, tokenStore]);

  return { 
    tokenData, 
    isLoading: tokenStore.isLoading || isLoadingRate || isLoadingDex, 
    error: tokenStore.error || dexError 
  };
}
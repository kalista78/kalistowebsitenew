export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  price?: number;
  change?: number;
  marketCap?: string;
  volume?: string;
  emoji?: string | null;
  ca?: string | null; // Contract Address
  isVerified?: boolean;
  verified?: boolean;
  isNew?: boolean;
  isStarter?: boolean;
  category?: string;
  age?: string | null;
  supply?: string;
  liquidity?: string;
  description?: string | null;
  tags?: string[];
  network?: string;
  listedAt?: string;
  socialLinks?: {
    website?: string | null;
    twitter?: string | null;
    telegram?: string | null;
    discord?: string | null;
  };
}

export const FEATURED_COINS: TokenData[] = [];

export const TRENDING_COINS: TokenData[] = [];
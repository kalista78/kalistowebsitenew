import { PublicKey, LAMPORTS_PER_SOL, Connection, ParsedAccountData } from '@solana/web3.js';
import { connection } from '@/config/rpc';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { rpcQueue } from './rpcQueue';

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
}

export interface TokenMetadata {
  symbol: string;
  name: string;
  logoURI?: string;
}

interface ParsedTokenAccount {
  pubkey: PublicKey;
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
          };
        };
      };
    };
  };
}

export async function getUSDToTRYRate(): Promise<number> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Try Binance API first
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTTRY');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      if (i < MAX_RETRIES - 1) await delay(RETRY_DELAY);
    }
  }

  // Fallback to CoinGecko API
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=try');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.tether.try;
  } catch (error) {
    console.error('Both Binance and CoinGecko APIs failed:', error);
    
    // Return last known rate from localStorage as final fallback
    const stored = localStorage.getItem('tryRate');
    if (stored) {
      const { rate, timestamp } = JSON.parse(stored);
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if (timestamp > fiveMinutesAgo) {
        console.log('Using cached exchange rate');
        return rate;
      }
    }
    
    throw new Error('Failed to fetch USD/TRY rate from all sources');
  }
}

export async function getSOLPriceInUSD(): Promise<number> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('Error fetching SOL/USDT price:', error);
    throw error;
  }
}

export function formatTRY(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatLargeTRY(amount: number): string {
  if (amount >= 1_000_000_000) {
    return formatTRY(amount / 1_000_000_000) + ' B';
  } else if (amount >= 1_000_000) {
    return formatTRY(amount / 1_000_000) + ' M';
  } else if (amount >= 1_000) {
    return formatTRY(amount / 1_000) + ' K';
  } else {
    return formatTRY(amount);
  }
}

export async function getTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
  try {
    // Get all token accounts for the wallet
    const accounts = await rpcQueue.execute<{ value: ParsedTokenAccount[] }>(
      connection,
      'getParsedTokenAccountsByOwner',
      [
        new PublicKey(walletAddress),
        { programId: TOKEN_PROGRAM_ID },
        { encoding: 'jsonParsed' }
      ]
    );

    // Filter and map token accounts to balances
    const balances = accounts.value
      .filter((account: ParsedTokenAccount) => {
        const parsedInfo = account.account.data.parsed.info;
        return parsedInfo.tokenAmount.uiAmount > 0;
      })
      .map((account: ParsedTokenAccount) => {
        const parsedInfo = account.account.data.parsed.info;
        return {
          mint: parsedInfo.mint,
          amount: parsedInfo.tokenAmount.uiAmount,
          decimals: parsedInfo.tokenAmount.decimals
        };
      });

    // Get metadata for each token in parallel
    const metadataPromises = balances.map((balance: TokenBalance) => getTokenMetadata(balance.mint));
    const metadataResults = await Promise.all(metadataPromises);

    // Combine balances with metadata
    return balances.map((balance: TokenBalance, index: number) => ({
      ...balance,
      ...metadataResults[index]
    }));
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
}

export async function getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    // This is a placeholder implementation. You might want to integrate with a token metadata service
    // like the Solana token list or Jupiter's token list
    return {
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}
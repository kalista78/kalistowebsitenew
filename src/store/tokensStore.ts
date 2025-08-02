import { create } from 'zustand';
import { TOKEN_TAGS } from '@/lib/constants';
import { tokenService, Token, TokenCreate, TokenUpdate } from '@/lib/supabase';

interface TokensState {
  tokens: Token[];
  isLoading: boolean;
  error: string | null;
  addToken: (token: Omit<TokenCreate, 'is_verified' | 'is_new'> & { tags?: string[], decimals?: number }) => Promise<void>;
  removeToken: (id: string) => Promise<void>;
  updateToken: (id: string, updates: TokenUpdate) => Promise<void>;
  getToken: (id: string) => Token | undefined;
  getFeaturedTokens: () => Token[];
  getTrendingTokens: () => Token[];
  getAllTokensSortedByDate: () => Token[];
  fetchTokens: () => Promise<void>;
}

export const useTokensStore = create<TokensState>((set, get) => ({
  tokens: [],
  isLoading: false,
  error: null,

  fetchTokens: async () => {
    set({ isLoading: true });
    try {
      const tokens = await tokenService.getAllTokens();
      set({ tokens, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addToken: async (token) => {
    set({ isLoading: true });
    try {
      console.log('Creating token with data:', token);
      // Use the provided tags or fall back to GENERAL
      const tokenWithDefaults = {
        ...token,
        tags: token.tags && token.tags.length > 0 ? token.tags : [TOKEN_TAGS.GENERAL],
        is_verified: false,
        is_new: true,
        decimals: token.decimals || 9,
      };
      console.log('Creating token with processed data:', tokenWithDefaults);
      
      const newToken = await tokenService.createToken(tokenWithDefaults);
      console.log('Token created successfully:', newToken);
      set(state => ({
        tokens: [...state.tokens, newToken],
        error: null
      }));
    } catch (error) {
      console.error('Failed to create token:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeToken: async (id) => {
    set({ isLoading: true });
    try {
      await tokenService.deleteToken(id);
      set(state => ({
        tokens: state.tokens.filter((t) => t.id !== id),
        error: null
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateToken: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updatedToken = await tokenService.updateToken(id, updates);
      set(state => ({
        tokens: state.tokens.map((token) =>
          token.id === id ? updatedToken : token
        ),
        error: null
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  getToken: (id) => {
    const state = get();
    return state.tokens.find(t => {
      const tokenId = t.id?.toLowerCase();
      const tokenSymbol = t.symbol?.toLowerCase();
      const tokenCA = t.ca?.toLowerCase();
      const searchId = id?.toLowerCase();
      
      return tokenId === searchId || tokenSymbol === searchId || tokenCA === searchId;
    });
  },

  getFeaturedTokens: () => {
    const state = get();
    return state.tokens.filter(token =>
      token.tags?.includes(TOKEN_TAGS.FEATURED)
    );
  },

  getTrendingTokens: () => {
    const state = get();
    return state.tokens.filter(token => 
      token.tags?.includes(TOKEN_TAGS.TRENDING)
    );
  },

  getAllTokensSortedByDate: () => {
    const state = get();
    return [...state.tokens].sort((a, b) => {
      const aTime = new Date(a.listed_at).getTime();
      const bTime = new Date(b.listed_at).getTime();
      return bTime - aTime;
    });
  },
}));

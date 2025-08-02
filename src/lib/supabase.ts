import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Token types matching our database schema
export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  emoji: string | null;
  age: string | null;
  ca: string | null;
  twitter: string | null;
  telegram: string | null;
  website: string | null;
  description: string | null;
  tags: string[];
  is_verified: boolean;
  is_new: boolean;
  listed_at: string;
  decimals: number;
  social_links: {
    twitter?: string;
    telegram?: string;
    website?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// Token creation type (omitting auto-generated fields)
export type TokenCreate = Omit<Token, 'id' | 'created_at' | 'updated_at' | 'listed_at'>;

// Token update type (all fields optional)
export type TokenUpdate = Partial<TokenCreate>;

// Token service functions
export const tokenService = {
  // Get all tokens
  async getAllTokens() {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('listed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get token by ID or contract address
  async getToken(identifier: string) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .or(`id.eq.${identifier},ca.eq.${identifier}`)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new token
  async createToken(token: TokenCreate) {
    console.log('Sending token to Supabase:', token);
    
    // Make sure listed_at is set
    const tokenWithDate = {
      ...token,
      listed_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('tokens')
      .insert([tokenWithDate])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Token created in Supabase:', data);
    return data;
  },

  // Update token
  async updateToken(id: string, updates: TokenUpdate) {
    console.log('Updating token in Supabase:', id, updates);
    
    // Ensure social_links is properly formatted
    if (updates.twitter || updates.telegram || updates.website) {
      updates.social_links = {
        ...(updates.social_links || {}),
        twitter: updates.twitter || undefined,
        telegram: updates.telegram || undefined,
        website: updates.website || undefined
      };
    }
    
    const { data, error } = await supabase
      .from('tokens')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error updating token:', error);
      throw error;
    }
    
    console.log('Token updated successfully:', data);
    return data;
  },

  // Delete token
  async deleteToken(id: string) {
    const { error } = await supabase
      .from('tokens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get featured tokens
  async getFeaturedTokens() {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .contains('tags', ['Öne çıkanlar'])
      .order('listed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get trending tokens
  async getTrendingTokens() {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .contains('tags', ['💎 Trend'])
      .order('listed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}; 
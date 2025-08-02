interface CachedData<T> {
  data: T;
  timestamp: number;
}

class TokenDataCache {
  private static instance: TokenDataCache;
  private cache: Map<string, CachedData<any>> = new Map();
  private readonly CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds
  private fetchPromises: Map<string, Promise<any>> = new Map();

  private constructor() {}

  static getInstance(): TokenDataCache {
    if (!TokenDataCache.instance) {
      TokenDataCache.instance = new TokenDataCache();
    }
    return TokenDataCache.instance;
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // If we have valid cached data, return it
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // If there's already a fetch in progress, return its promise
    const existingPromise = this.fetchPromises.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new fetch promise
    const fetchPromise = fetchFn().then(data => {
      this.cache.set(key, { data, timestamp: Date.now() });
      this.fetchPromises.delete(key);
      return data;
    }).catch(error => {
      this.fetchPromises.delete(key);
      throw error;
    });

    this.fetchPromises.set(key, fetchPromise);
    return fetchPromise;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    return null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

export const tokenDataCache = TokenDataCache.getInstance();

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

class RateLimiter {
  private cache: Map<string, CacheItem<any>> = new Map();
  private lastRequestTime: number = 0;
  private readonly minInterval: number = 1000; // Reduced to 1 second
  private readonly maxRetries: number = 3;

  async throttleRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<T>,
    cacheDuration: number = 5000
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < cacheDuration) {
      return cached.value;
    }

    // Ensure minimum interval between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }

    // Make the request with retries
    let lastError;
    for (let retry = 0; retry < this.maxRetries; retry++) {
      try {
        const result = await requestFn();
        this.lastRequestTime = Date.now();
        
        // Cache the result
        this.cache.set(cacheKey, {
          value: result,
          timestamp: Date.now()
        });

        return result;
      } catch (error: any) {
        lastError = error;
        
        // If it's a rate limit error (429), wait longer before retrying
        if (error?.message?.includes('429')) {
          const backoffTime = Math.min(1000 * Math.pow(2, retry), 8000);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          continue;
        }
        
        // For other errors, break the retry loop
        break;
      }
    }

    // If we have a cached value, return it even if expired
    if (cached) {
      console.warn('Request failed, using cached value:', lastError);
      return cached.value;
    }
    throw lastError;
  }
}

export const rateLimiter = new RateLimiter();

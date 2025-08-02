import { Connection } from '@solana/web3.js';

// Sliding window rate limiter
class RPCRateLimiter {
  private requests: number[] = [];
  private readonly limit: number;
  private readonly window: number;

  constructor(limit: number = 20, windowMs: number = 1000) {
    this.limit = limit;
    this.window = windowMs;
  }

  async waitForCapacity(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    
    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0];
      const waitTime = this.window - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForCapacity();
    }
    
    this.requests.push(now);
  }
}

// Global RPC queue
class RPCQueue {
  private static instance: RPCQueue;
  private rateLimiter: RPCRateLimiter;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTTL: number = 5000; // 5 seconds cache

  private constructor() {
    this.rateLimiter = new RPCRateLimiter();
  }

  static getInstance(): RPCQueue {
    if (!RPCQueue.instance) {
      RPCQueue.instance = new RPCQueue();
    }
    return RPCQueue.instance;
  }

  private getCacheKey(method: string, params: any[]): string {
    return `${method}:${JSON.stringify(params)}`;
  }

  async execute<T>(
    connection: Connection,
    method: string,
    params: any[],
    skipCache: boolean = false
  ): Promise<T> {
    const cacheKey = this.getCacheKey(method, params);
    
    // Check cache first
    if (!skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data as T;
      }
    }

    // Wait for rate limit capacity
    await this.rateLimiter.waitForCapacity();

    // Execute RPC call
    try {
      const result = await (connection as any)[method](...params);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error(`RPC error for ${method}:`, error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const rpcQueue = RPCQueue.getInstance();

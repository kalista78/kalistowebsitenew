import { Connection } from '@solana/web3.js';

class RPCRateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastCallTime = 0;
  private callsInLastSecond = 0;
  private readonly maxCallsPerSecond = 20; // Keep below 25 for safety
  private readonly minCallInterval = 50; // ms between calls

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      
      // Reset counter if a second has passed
      if (now - this.lastCallTime >= 1000) {
        this.callsInLastSecond = 0;
        this.lastCallTime = now;
      }

      // If we've hit the rate limit, wait until next second
      if (this.callsInLastSecond >= this.maxCallsPerSecond) {
        await new Promise(resolve => setTimeout(resolve, 1000 - (now - this.lastCallTime)));
        continue;
      }

      // Ensure minimum interval between calls
      const timeSinceLastCall = now - this.lastCallTime;
      if (timeSinceLastCall < this.minCallInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minCallInterval - timeSinceLastCall));
      }

      const task = this.queue.shift();
      if (task) {
        this.callsInLastSecond++;
        this.lastCallTime = Date.now();
        try {
          await task();
        } catch (error) {
          console.error('RPC call failed:', error);
        }
      }
    }

    this.processing = false;
  }

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }
}

export const rpcLimiter = new RPCRateLimiter();

// Wrap connection methods to use rate limiter
export function createRateLimitedConnection(baseConnection: Connection): Connection {
  const handler: ProxyHandler<Connection> = {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      
      if (typeof original === 'function' && prop.toString().startsWith('get')) {
        // Wrap all getter methods with rate limiting
        return async (...args: any[]) => {
          return rpcLimiter.enqueue(() => original.apply(target, args));
        };
      }
      
      return original;
    }
  };

  return new Proxy(baseConnection, handler);
}

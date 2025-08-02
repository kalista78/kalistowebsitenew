import { useState, useEffect, useRef } from 'react';

interface QueuedRequest {
  id: string;
  execute: () => Promise<void>;
  lastExecuted?: number;
}

class RequestQueue {
  private queue: Map<string, QueuedRequest> = new Map();
  private isProcessing: boolean = false;
  private requestsPerMinute: number;
  private minDelayMs: number;
  private lastRequestTime: number = 0;

  constructor(requestsPerMinute: number = 25) { // Using 25 instead of 30 for safety margin
    this.requestsPerMinute = requestsPerMinute;
    this.minDelayMs = (60 * 1000) / requestsPerMinute;
  }

  async add(request: QueuedRequest): Promise<void> {
    this.queue.set(request.id, request);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  remove(id: string): void {
    this.queue.delete(id);
  }

  private async processQueue(): Promise<void> {
    if (this.queue.size === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    // Sort requests by last execution time
    const sortedRequests = Array.from(this.queue.values()).sort((a, b) => 
      (a.lastExecuted || 0) - (b.lastExecuted || 0)
    );

    const request = sortedRequests[0];
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minDelayMs) {
      await new Promise(resolve => setTimeout(resolve, this.minDelayMs - timeSinceLastRequest));
    }

    try {
      await request.execute();
      request.lastExecuted = Date.now();
      this.lastRequestTime = Date.now();
    } catch (error) {
      console.error(`Error executing request ${request.id}:`, error);
    }

    // Schedule next request
    setTimeout(() => this.processQueue(), this.minDelayMs);
  }
}

// Singleton instance
export const globalRequestQueue = new RequestQueue(25);

// React hook for using the queue
export function useRequestQueue(
  id: string,
  callback: () => Promise<void>,
  interval: number
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const request: QueuedRequest = {
      id,
      execute: () => callbackRef.current(),
    };

    // Initial execution
    globalRequestQueue.add(request);

    // Set up interval
    const intervalId = setInterval(() => {
      globalRequestQueue.add(request);
    }, interval);

    return () => {
      clearInterval(intervalId);
      globalRequestQueue.remove(id);
    };
  }, [id, interval]);
}

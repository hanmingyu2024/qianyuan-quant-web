export interface CacheConfig {
    prefix?: string;
    ttl?: number; // Time to live in milliseconds
  }
  
  export class CacheService {
    private prefix: string;
    private defaultTTL: number;
  
    constructor(config: CacheConfig = {}) {
      this.prefix = config.prefix || 'app_cache_';
      this.defaultTTL = config.ttl || 1000 * 60 * 60; // 1 hour default
    }
  
    private getKey(key: string): string {
      return `${this.prefix}${key}`;
    }
  
    set(key: string, value: any, ttl?: number): void {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTTL,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    }
  
    get<T>(key: string): T | null {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;
  
      const { value, timestamp, ttl } = JSON.parse(item);
      if (Date.now() - timestamp > ttl) {
        this.remove(key);
        return null;
      }
  
      return value as T;
    }
  
    remove(key: string): void {
      localStorage.removeItem(this.getKey(key));
    }
  
    clear(): void {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    }
  
    clearExpired(): void {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => {
          const item = localStorage.getItem(key);
          if (item) {
            const { timestamp, ttl } = JSON.parse(item);
            if (Date.now() - timestamp > ttl) {
              localStorage.removeItem(key);
            }
          }
        });
    }
  }
  
  export const cacheService = new CacheService();
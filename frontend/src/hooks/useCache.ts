import { useState, useEffect } from 'react';
import { cacheService } from '@/services/cacheService';

interface UseCacheOptions<T> {
  key: string;
  initialValue?: T;
  ttl?: number;
  onError?: (error: any) => void;
}

export function useCache<T>({
  key,
  initialValue,
  ttl,
  onError,
}: UseCacheOptions<T>) {
  const [data, setData] = useState<T | null>(() => {
    try {
      return cacheService.get<T>(key) || initialValue || null;
    } catch (error) {
      onError?.(error);
      return initialValue || null;
    }
  });

  useEffect(() => {
    if (data !== null) {
      try {
        cacheService.set(key, data, ttl);
      } catch (error) {
        onError?.(error);
      }
    }
  }, [data, key, ttl]);

  return [data, setData] as const;
} 
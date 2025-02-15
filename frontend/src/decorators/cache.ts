import { cacheService } from '@/services/cacheService';

interface CacheOptions {
  ttl?: number;
  key?: string | ((args: any[]) => string);
}

export function cache(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = typeof options.key === 'function'
        ? options.key(args)
        : options.key || `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`;

      const cachedValue = cacheService.get(key);
      if (cachedValue !== null) {
        return cachedValue;
      }

      const result = await originalMethod.apply(this, args);
      cacheService.set(key, result, options.ttl);
      return result;
    };

    return descriptor;
  };
} 
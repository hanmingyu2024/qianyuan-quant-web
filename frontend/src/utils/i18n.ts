import { useLocaleStore } from '@/stores/localeStore';

export function useI18n() {
  const localeStore = useLocaleStore();

  function t(key: string): string {
    const keys = key.split('.');
    let value = localeStore.config.messages;

    for (const k of keys) {
      if (value[k] === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      value = value[k];
    }

    return value;
  }

  return {
    t,
    locale: localeStore.currentLocale,
  };
} 
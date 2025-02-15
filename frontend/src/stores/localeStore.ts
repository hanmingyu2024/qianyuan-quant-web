import { defineStore } from 'pinia';
import { ref } from 'vue';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import type { Locale } from 'antd/es/locale';
import zhCNMessages from '@/locales/zh-CN';
import enUSMessages from '@/locales/en-US';

export type LocaleType = 'zh-CN' | 'en-US';

interface LocaleConfig {
  antd: Locale;
  messages: typeof zhCNMessages;
}

const localeConfigs: Record<LocaleType, LocaleConfig> = {
  'zh-CN': {
    antd: zhCN,
    messages: zhCNMessages,
  },
  'en-US': {
    antd: enUS,
    messages: enUSMessages,
  },
};

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref<LocaleType>(
    (localStorage.getItem('locale') as LocaleType) || 'zh-CN'
  );

  const config = ref<LocaleConfig>(localeConfigs[currentLocale.value]);

  function setLocale(locale: LocaleType) {
    currentLocale.value = locale;
    config.value = localeConfigs[locale];
    localStorage.setItem('locale', locale);
  }

  return {
    currentLocale,
    config,
    setLocale,
  };
});
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言包
import enMonitor from './en/monitor';
import zhMonitor from './zh/monitor';
import jaMonitor from './ja/monitor';
import koMonitor from './ko/monitor';
import enCommon from './en/common';
import zhCommon from './zh/common';
import enStrategy from './en/strategy';
import zhStrategy from './zh/strategy';

const resources = {
  en: {
    translation: {
      ...enCommon,
      ...enMonitor,
      ...enStrategy,
    },
  },
  zh: {
    translation: {
      ...zhCommon,
      ...zhMonitor,
      ...zhStrategy,
    },
  },
  ja: {
    translation: {
      ...jaMonitor,
    },
  },
  ko: {
    translation: {
      ...koMonitor,
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 
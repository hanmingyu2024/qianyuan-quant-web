import { defineStore } from 'pinia';
import { ref } from 'vue';
import { theme } from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider/context';

export type ThemeMode = 'light' | 'dark';

const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
  algorithm: theme.defaultAlgorithm,
};

const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
  algorithm: theme.darkAlgorithm,
};

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(
    (localStorage.getItem('theme') as ThemeMode) || 'light'
  );

  const currentTheme = ref<ThemeConfig>(mode.value === 'dark' ? darkTheme : lightTheme);

  function setTheme(newMode: ThemeMode) {
    mode.value = newMode;
    currentTheme.value = newMode === 'dark' ? darkTheme : lightTheme;
    localStorage.setItem('theme', newMode);
    
    // 更新body的class
    if (newMode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  function toggleTheme() {
    setTheme(mode.value === 'light' ? 'dark' : 'light');
  }

  return {
    mode,
    currentTheme,
    setTheme,
    toggleTheme,
  };
}); 
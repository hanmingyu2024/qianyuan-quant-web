import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const loadingStates = ref<Record<string, boolean>>({});
  const globalLoading = ref(false);

  function startLoading(key: string = 'global') {
    if (key === 'global') {
      globalLoading.value = true;
    } else {
      loadingStates.value[key] = true;
    }
  }

  function stopLoading(key: string = 'global') {
    if (key === 'global') {
      globalLoading.value = false;
    } else {
      loadingStates.value[key] = false;
    }
  }

  function isLoading(key: string = 'global'): boolean {
    if (key === 'global') {
      return globalLoading.value;
    }
    return loadingStates.value[key] || false;
  }

  return {
    loadingStates,
    globalLoading,
    startLoading,
    stopLoading,
    isLoading,
  };
}); 
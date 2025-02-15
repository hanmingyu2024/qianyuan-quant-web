import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { handleError } from './errorHandler';
import { message } from 'antd';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const loadingStore = useLoadingStore();

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    loadingStore.startLoading(config.url);

    return config;
  },
  (error) => {
    const loadingStore = useLoadingStore();
    loadingStore.stopLoading();
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const loadingStore = useLoadingStore();
    loadingStore.stopLoading(response.config.url);
    return response;
  },
  async (error) => {
    const loadingStore = useLoadingStore();
    const authStore = useAuthStore();

    loadingStore.stopLoading();

    if (error.response?.status === 401) {
      await authStore.logout();
      message.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else {
      handleError(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 
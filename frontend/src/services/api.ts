import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 用户相关 API
export const userApi = {
  login: (data: { email: string; password: string }) =>
    instance.post('/auth/login', data),
  register: (data: { email: string; username: string; password: string }) =>
    instance.post('/auth/register', data),
  getCurrentUser: () => instance.get('/users/me'),
  updateProfile: (data: { email?: string; username?: string }) =>
    instance.put('/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    instance.put('/users/password', data),
};

// 策略相关 API
export const strategyApi = {
  getStrategies: () => instance.get('/strategies'),
  getStrategy: (id: string) => instance.get(`/strategies/${id}`),
  createStrategy: (data: any) => instance.post('/strategies', data),
  updateStrategy: (id: string, data: any) =>
    instance.put(`/strategies/${id}`, data),
  deleteStrategy: (id: string) => instance.delete(`/strategies/${id}`),
  backtest: (id: string, params: any) =>
    instance.post(`/strategies/${id}/backtest`, params),
};

// 交易相关 API
export const tradingApi = {
  placeOrder: (data: any) => instance.post('/trading/orders', data),
  getOrders: () => instance.get('/trading/orders'),
  cancelOrder: (id: string) => instance.delete(`/trading/orders/${id}`),
  getPositions: () => instance.get('/trading/positions'),
};

// 市场数据相关 API
export const marketApi = {
  getKlines: (params: {
    symbol: string;
    interval: string;
    limit?: number;
  }) => instance.get('/market/klines', { params }),
  getTicker: (symbol: string) =>
    instance.get('/market/ticker', { params: { symbol } }),
  getDepth: (symbol: string) =>
    instance.get('/market/depth', { params: { symbol } }),
};

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
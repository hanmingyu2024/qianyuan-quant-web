import axios from 'axios';
import { message } from 'antd';
import { API_BASE_URL } from './config';
import { store } from '../store';
import { logout } from '../store/slices/userSlice';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          message.error('请重新登录');
          store.dispatch(logout());
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(data.message || '请求失败');
      }
    } else {
      message.error('网络错误，请检查网络连接');
    }
    return Promise.reject(error);
  }
);

// API接口定义
export const userApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  
  register: (data: { 
    username: string; 
    email: string; 
    phone: string;
    password: string;
    code: string;
  }) =>
    api.post('/auth/register', data),
  
  sendVerificationCode: (data: { phone: string }) =>
    api.post('/auth/send-code', data),
  
  getCurrentUser: () =>
    api.get('/user/current'),
  
  updateProfile: (data: any) =>
    api.put('/user/profile', data),
  
  resetPassword: (data: {
    phone: string;
    code: string;
    newPassword: string;
  }) =>
    api.post('/auth/reset-password', data),
};

// 市场数据接口
export const marketApi = {
  getKlineData: (symbol: string, period: string, limit: number = 100) =>
    api.get(`/market/kline/${symbol}`, { params: { period, limit } }),
  
  getMarketDepth: (symbol: string) =>
    api.get(`/market/depth/${symbol}`),
  
  getSymbols: () =>
    api.get('/market/symbols'),
};

// 交易相关接口
export const tradingApi = {
  placeOrder: (data: {
    symbol: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
  }) =>
    api.post('/trading/orders', data),
  
  cancelOrder: (orderId: string) =>
    api.delete(`/trading/orders/${orderId}`),
  
  getOrders: (params?: {
    symbol?: string;
    status?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }) =>
    api.get('/trading/orders', { params }),
  
  getPositions: () =>
    api.get('/trading/positions'),
};

// 策略相关接口
export const strategyApi = {
  createStrategy: (data: {
    name: string;
    description: string;
    type: string;
    parameters: any;
  }) =>
    api.post('/strategy', data),
  
  updateStrategy: (id: string, data: any) =>
    api.put(`/strategy/${id}`, data),
  
  deleteStrategy: (id: string) =>
    api.delete(`/strategy/${id}`),
  
  getStrategies: () =>
    api.get('/strategy'),
  
  startBacktest: (id: string, params: {
    startTime: number;
    endTime: number;
    initialCapital: number;
  }) =>
    api.post(`/strategy/${id}/backtest`, params),
  
  getBacktestResult: (id: string) =>
    api.get(`/strategy/${id}/backtest`),
  
  startStrategy: (id: string) =>
    api.post(`/strategy/${id}/start`),
  
  stopStrategy: (id: string) =>
    api.post(`/strategy/${id}/stop`),
};

export default api; 
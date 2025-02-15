import axios from 'axios';
import { LoginForm, RegisterForm, User, Token } from '@/types/auth';

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  async login(data: LoginForm): Promise<Token> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData);
    return response.data;
  },

  async register(data: RegisterForm): Promise<User> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post(`${API_URL}/auth/logout`);
  }
}; 
import axios from '@/utils/axios';
import { User, UserCreate } from '@/types/auth';
import { showSuccess, showError } from '@/utils/notification';

const API_URL = import.meta.env.VITE_API_URL;

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  async createUser(data: UserCreate): Promise<User> {
    const response = await axios.post(`${API_URL}/users`, data);
    return response.data;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    const response = await axios.patch(`${API_URL}/users/${userId}`, {
      is_active: isActive
    });
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await axios.delete(`${API_URL}/users/${userId}`);
  },

  async updateProfile(data: { email: string; username: string }): Promise<User> {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, data);
      showSuccess('Profile updated successfully');
      return response.data;
    } catch (error) {
      showError('Failed to update profile');
      throw error;
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await axios.post(`${API_URL}/users/change-password`, data);
      showSuccess('Password changed successfully');
    } catch (error) {
      showError('Failed to change password');
      throw error;
    }
  }
};
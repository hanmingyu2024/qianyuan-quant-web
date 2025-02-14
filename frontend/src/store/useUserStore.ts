import { create } from 'zustand'
import { message } from 'antd'
import { login, logout, getUserInfo } from '@/services/user'

export interface UserInfo {
  id: string
  username: string
  email: string
  balance: {
    USDT: number
    BTC: number
    ETH: number
  }
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUserInfo: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  token: localStorage.getItem('token'),
  userInfo: null,
  loading: false,

  login: async (username: string, password: string) => {
    set({ loading: true })
    try {
      const { token } = await login(username, password)
      localStorage.setItem('token', token)
      set({ token })
      message.success('登录成功')
    } catch (error) {
      message.error('登录失败')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      await logout()
      localStorage.removeItem('token')
      set({ token: null, userInfo: null })
      message.success('退出成功')
    } catch (error) {
      message.error('退出失败')
    }
  },

  fetchUserInfo: async () => {
    set({ loading: true })
    try {
      const userInfo = await getUserInfo()
      set({ userInfo })
    } catch (error) {
      message.error('获取用户信息失败')
    } finally {
      set({ loading: false })
    }
  },
})) 
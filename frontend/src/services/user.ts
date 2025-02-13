import request from '@/utils/request'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  return request.post('/auth/login', { username, password })
}

export const logout = async () => {
  return request.post('/auth/logout')
}

export const getUserInfo = async () => {
  return request.get('/user/info')
}

export const enable2FA = async () => {
  return request.post<{ secret: string }>('/user/2fa/enable')
}

export const verify2FA = async (code: string) => {
  return request.post('/user/2fa/verify', { code })
}

export const disable2FA = async (code: string) => {
  return request.post('/user/2fa/disable', { code })
}

export const updatePassword = async (data: {
  oldPassword: string
  newPassword: string
}) => {
  return request.post('/user/password', data)
} 
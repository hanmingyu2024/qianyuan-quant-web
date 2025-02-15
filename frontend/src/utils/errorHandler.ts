import { message } from 'antd'
import axios, { AxiosError } from 'axios'
import { useUserStore } from '@/store/useUserStore'

interface ApiError {
  detail: string
  code?: string
}

export function handleError(error: unknown): void {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>
    const errorMessage = axiosError.response?.data?.detail || axiosError.message
    message.error(errorMessage)
  } else if (error instanceof Error) {
    message.error(error.message)
  } else {
    message.error('An unexpected error occurred')
  }
}

export function createErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>
    return axiosError.response?.data?.detail || axiosError.message
  } else if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

interface ErrorResponse {
  code: string
  message: string
}

export const handleApiError = (error: AxiosError<ErrorResponse>) => {
  const { response } = error
  
  if (!response) {
    message.error('网络连接失败')
    return
  }

  const { status, data } = response

  switch (status) {
    case 401:
      message.error('登录已过期，请重新登录')
      useUserStore.getState().logout()
      break
    case 403:
      message.error('没有操作权限')
      break
    case 429:
      message.error('请求过于频繁，请稍后再试')
      break
    default:
      message.error(data?.message || '操作失败')
  }

  return Promise.reject(error)
} 
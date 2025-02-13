import { message } from 'antd'
import { AxiosError } from 'axios'
import { useUserStore } from '@/store/useUserStore'

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
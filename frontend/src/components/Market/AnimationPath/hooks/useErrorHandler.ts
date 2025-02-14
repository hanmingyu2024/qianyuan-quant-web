import { useState, useCallback } from 'react'
import { message } from 'antd'

export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null)

  const handleError = useCallback((error: Error) => {
    console.error('Animation Path Error:', error)
    setError(error)
    message.error(error.message)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
  }
} 
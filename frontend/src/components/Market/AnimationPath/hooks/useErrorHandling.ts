import { useEffect, useCallback } from 'react'
import { message } from 'antd'
import { errorHandler } from '../utils/errorHandling'
import { PathError } from '../errors'

export function useErrorHandling() {
  useEffect(() => {
    const handleError = (error: Error) => {
      if (error instanceof PathError) {
        message.error(error.message)
      } else {
        message.error('发生未知错误')
      }
    }

    errorHandler.addListener(handleError)
    return () => errorHandler.removeListener(handleError)
  }, [])

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T> => {
    return errorHandler.wrapAsync(operation, errorMessage)
  }, [])

  const handleOperation = useCallback(<T>(
    operation: () => T,
    errorMessage?: string
  ): T => {
    return errorHandler.wrap(operation, errorMessage)
  }, [])

  return {
    handleAsyncOperation,
    handleOperation,
  }
}
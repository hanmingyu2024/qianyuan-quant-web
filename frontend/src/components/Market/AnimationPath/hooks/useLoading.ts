import { useState, useCallback } from 'react'

export const useLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  return {
    isLoading,
    startLoading,
    stopLoading,
  }
} 
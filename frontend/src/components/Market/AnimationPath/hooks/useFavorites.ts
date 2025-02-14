import { useState, useCallback, useEffect } from 'react'

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('pathFavorites')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('pathFavorites', JSON.stringify(favorites))
  }, [favorites])

  const handleFavorite = useCallback((pathId: string) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(pathId)
      if (isFavorite) {
        return prev.filter(id => id !== pathId)
      } else {
        return [...prev, pathId]
      }
    })
  }, [])

  const isFavorite = useCallback((pathId: string) => {
    return favorites.includes(pathId)
  }, [favorites])

  return {
    favorites,
    handleFavorite,
    isFavorite,
  }
} 
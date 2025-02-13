import { request } from '@/utils/request'
import { PathPoint } from '@/components/Market/AnimationPath/types'

export interface Drawing {
  id: string
  name: string
  points: PathPoint[]
  createdAt: string
  updatedAt: string
}

export const marketService = {
  getDrawings: () => request.get<Drawing[]>('/api/drawings'),
  
  getDrawing: (id: string) => request.get<Drawing>(`/api/drawings/${id}`),
  
  createDrawing: (data: Partial<Drawing>) => 
    request.post<Drawing>('/api/drawings', data),
  
  updateDrawing: (id: string, data: Partial<Drawing>) =>
    request.put<Drawing>(`/api/drawings/${id}`, data),
  
  deleteDrawing: (id: string) => 
    request.delete(`/api/drawings/${id}`),
  
  getFavorites: () => 
    request.get<Drawing[]>('/api/drawings/favorites'),
  
  toggleFavorite: (id: string) =>
    request.post(`/api/drawings/${id}/favorite`),
}
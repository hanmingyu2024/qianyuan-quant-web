import { useCallback, useReducer, useEffect } from 'react'
import { PathPoint } from '../types'

interface PathState {
  points: PathPoint[]
  selectedPoints: string[]
  isEditing: boolean
  isDragging: boolean
  isPlaying: boolean
  currentTime: number
  scale: number
  center: [number, number]
  error: string | null
  isLoading: boolean
}

type PathAction = 
  | { type: 'SET_POINTS'; points: PathPoint[] }
  | { type: 'ADD_POINT'; point: PathPoint }
  | { type: 'UPDATE_POINT'; id: string; updates: Partial<PathPoint> }
  | { type: 'DELETE_POINT'; id: string }
  | { type: 'SELECT_POINT'; id: string }
  | { type: 'DESELECT_POINT'; id: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_EDITING'; isEditing: boolean }
  | { type: 'SET_DRAGGING'; isDragging: boolean }
  | { type: 'SET_PLAYING'; isPlaying: boolean }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_SCALE'; scale: number }
  | { type: 'SET_CENTER'; center: [number, number] }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_LOADING'; isLoading: boolean }

const initialState: PathState = {
  points: [],
  selectedPoints: [],
  isEditing: false,
  isDragging: false,
  isPlaying: false,
  currentTime: 0,
  scale: 1,
  center: [0, 0],
  error: null,
  isLoading: false,
}

function pathReducer(state: PathState, action: PathAction): PathState {
  switch (action.type) {
    case 'SET_POINTS':
      return { ...state, points: action.points }
    
    case 'ADD_POINT':
      return { ...state, points: [...state.points, action.point] }
    
    case 'UPDATE_POINT':
      return {
        ...state,
        points: state.points.map(p => 
          p.id === action.id ? { ...p, ...action.updates } : p
        )
      }
    
    case 'DELETE_POINT':
      return {
        ...state,
        points: state.points.filter(p => p.id !== action.id),
        selectedPoints: state.selectedPoints.filter(id => id !== action.id)
      }
    
    case 'SELECT_POINT':
      return {
        ...state,
        selectedPoints: [...state.selectedPoints, action.id]
      }
    
    case 'DESELECT_POINT':
      return {
        ...state,
        selectedPoints: state.selectedPoints.filter(id => id !== action.id)
      }
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedPoints: [] }
    
    case 'SET_EDITING':
      return { ...state, isEditing: action.isEditing }
    
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.isDragging }
    
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.isPlaying }
    
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.time }
    
    case 'SET_SCALE':
      return { ...state, scale: action.scale }
    
    case 'SET_CENTER':
      return { ...state, center: action.center }
    
    case 'SET_ERROR':
      return { ...state, error: action.error }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    
    default:
      return state
  }
}

interface PathStateHookProps {
  onPathChange?: (points: PathPoint[]) => void
  onError?: (error: string | null) => void
  initialPoints?: PathPoint[]
}

export const usePathState2 = ({
  onPathChange,
  onError,
  initialPoints = [],
}: PathStateHookProps = {}) => {
  const [state, dispatch] = useReducer(pathReducer, {
    ...initialState,
    points: initialPoints,
  })

  useEffect(() => {
    onPathChange?.(state.points)
  }, [state.points, onPathChange])

  useEffect(() => {
    onError?.(state.error)
  }, [state.error, onError])

  const setPoints = useCallback((points: PathPoint[]) => {
    dispatch({ type: 'SET_POINTS', points })
  }, [])

  const addPoint = useCallback((point: PathPoint) => {
    dispatch({ type: 'ADD_POINT', point })
  }, [])

  const updatePoint = useCallback((id: string, updates: Partial<PathPoint>) => {
    dispatch({ type: 'UPDATE_POINT', id, updates })
  }, [])

  const deletePoint = useCallback((id: string) => {
    dispatch({ type: 'DELETE_POINT', id })
  }, [])

  const togglePointSelection = useCallback((id: string) => {
    if (state.selectedPoints.includes(id)) {
      dispatch({ type: 'DESELECT_POINT', id })
    } else {
      dispatch({ type: 'SELECT_POINT', id })
    }
  }, [state.selectedPoints])

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' })
  }, [])

  const setEditing = useCallback((isEditing: boolean) => {
    dispatch({ type: 'SET_EDITING', isEditing })
  }, [])

  const setDragging = useCallback((isDragging: boolean) => {
    dispatch({ type: 'SET_DRAGGING', isDragging })
  }, [])

  const setPlaying = useCallback((isPlaying: boolean) => {
    dispatch({ type: 'SET_PLAYING', isPlaying })
  }, [])

  const setCurrentTime = useCallback((time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', time })
  }, [])

  const setScale = useCallback((scale: number) => {
    dispatch({ type: 'SET_SCALE', scale })
  }, [])

  const setCenter = useCallback((center: [number, number]) => {
    dispatch({ type: 'SET_CENTER', center })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', error })
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', isLoading })
  }, [])

  return {
    ...state,
    setPoints,
    addPoint,
    updatePoint,
    deletePoint,
    togglePointSelection,
    clearSelection,
    setEditing,
    setDragging,
    setPlaying,
    setCurrentTime,
    setScale,
    setCenter,
    setError,
    setLoading,
  }
} 
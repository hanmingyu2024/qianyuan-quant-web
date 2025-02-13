import { useRef, useCallback } from 'react'
import { PathPoint } from '../types'
import { LIMITS } from '../config'

interface HistoryState {
  past: PathPoint[][]
  present: PathPoint[]
  future: PathPoint[][]
}

export function usePathHistory2(initialState: PathPoint[] = [], maxSize: number = 50) {
  const state = useRef<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  })

  const canUndo = useRef(false)
  const canRedo = useRef(false)

  const push = useCallback((newPresent: PathPoint[]) => {
    state.current = {
      past: [...state.current.past, state.current.present].slice(-maxSize),
      present: newPresent,
      future: [],
    }
    canUndo.current = state.current.past.length > 0
    canRedo.current = false
  }, [maxSize])

  const undo = useCallback(() => {
    const { past, present, future } = state.current
    if (past.length === 0) return

    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)

    state.current = {
      past: newPast,
      present: previous,
      future: [present, ...future],
    }

    canUndo.current = newPast.length > 0
    canRedo.current = true

    return previous
  }, [])

  const redo = useCallback(() => {
    const { past, present, future } = state.current
    if (future.length === 0) return

    const next = future[0]
    const newFuture = future.slice(1)

    state.current = {
      past: [...past, present],
      present: next,
      future: newFuture,
    }

    canUndo.current = true
    canRedo.current = newFuture.length > 0

    return next
  }, [])

  const clear = useCallback(() => {
    state.current = {
      past: [],
      present: [],
      future: [],
    }
    canUndo.current = false
    canRedo.current = false
  }, [])

  return {
    state,
    push,
    undo,
    redo,
    clear,
    canUndo: canUndo.current,
    canRedo: canRedo.current,
    getHistory: () => state.current,
  }
} 
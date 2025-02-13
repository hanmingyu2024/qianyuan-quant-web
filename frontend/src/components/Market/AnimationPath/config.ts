import { PathSettings } from './types'

export const DEFAULT_CONFIG: PathSettings = {
  animation: {
    duration: 5000,
    loop: true,
    autoPlay: false,
    easing: 'easeInOut',
    fps: 60,
    speed: 1,
    showTrail: true,
    trailLength: 10,
  },
  constraints: {
    gridSize: 20,
    snapToGrid: true,
    snapToPoints: true,
    snapToAngles: true,
    angleStep: 45,
  },
  display: {
    showGrid: true,
    showGuides: true,
    showLabels: true,
    pathColor: '#666666',
    pointColor: '#1890ff',
  },
}

export const SHORTCUTS = {
  UNDO: ['Ctrl+Z', '⌘+Z'],
  REDO: ['Ctrl+Shift+Z', '⌘+Shift+Z'],
  DELETE: ['Delete', 'Backspace'],
  PREVIEW: ['Space'],
  SAVE: ['Ctrl+S', '⌘+S'],
  COPY: ['Ctrl+C', '⌘+C'],
  PASTE: ['Ctrl+V', '⌘+V'],
}

export const LIMITS = {
  MIN_POINTS: 2,
  MAX_POINTS: 100,
  MIN_DISTANCE: 10,
  MAX_DISTANCE: 1000,
  MIN_TIME: 0,
  MAX_TIME: 60000,
} 
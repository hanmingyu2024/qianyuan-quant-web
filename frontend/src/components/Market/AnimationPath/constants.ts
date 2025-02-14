export const DEFAULT_SETTINGS = {
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
} as const

export const ERROR_CODES = {
  INVALID_POINT: 'INVALID_POINT',
  INVALID_PATH: 'INVALID_PATH',
  SAVE_FAILED: 'SAVE_FAILED',
  LOAD_FAILED: 'LOAD_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  IMPORT_FAILED: 'IMPORT_FAILED',
} as const

export const MIN_POINTS = 2
export const MAX_POINTS = 100
export const MIN_DISTANCE = 10
export const MAX_DISTANCE = 1000

export const KEYBOARD_SHORTCUTS = {
  UNDO: 'Ctrl/⌘ + Z',
  REDO: 'Ctrl/⌘ + Shift + Z',
  COPY: 'Ctrl/⌘ + C',
  PASTE: 'Ctrl/⌘ + V',
  DELETE: 'Delete/Backspace',
  SELECT_ALL: 'Ctrl/⌘ + A',
  SAVE: 'Ctrl/⌘ + S',
  PREVIEW: 'Space',
  TOGGLE_GRID: 'G',
  TOGGLE_SNAP: 'S',
  ZOOM_IN: 'Ctrl/⌘ + +',
  ZOOM_OUT: 'Ctrl/⌘ + -',
  RESET_VIEW: 'Ctrl/⌘ + 0',
} as const 
export interface PathPoint {
  id: string
  x: number
  y: number
  time: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
}

export interface PathStyle {
  color: string
  lineWidth: number
  opacity: number
}

export interface PathSettings {
  animation: {
    duration: number
    loop: boolean
    autoPlay: boolean
    easing: string
    fps: number
    speed: number
    showTrail: boolean
    trailLength: number
  }
  constraints: {
    gridSize: number
    snapToGrid: boolean
    snapToPoints: boolean
    snapToAngles: boolean
    angleStep: number
  }
  display: {
    showGrid: boolean
    showGuides: boolean
    showLabels: boolean
    pathColor: string
    pointColor: string
  }
}

export interface AnimationPathProps {
  onPathChange: (points: PathPoint[]) => void
  onPreview: () => void
  selectedDrawing: {
    id: string
    points: [number, number][]
  }
}

export interface PathHistoryState {
  points: PathPoint[][]
  currentIndex: number
}

export interface PathState {
  points: PathPoint[]
  isEditing: boolean
  history: PathHistoryState
  previewPosition: [number, number] | null
  favorites: string[]
} 
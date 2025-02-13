import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Space, Select, InputNumber, Tooltip, Layout, message } from 'antd'
import { usePathHistory2 } from './hooks/usePathHistory2'
import { usePointOperations } from './hooks/usePointOperations'
import { useFavorites } from './hooks/useFavorites'
import { usePreview } from './hooks/usePreview'
import { usePathState } from './hooks/usePathState'
import { useAnimationSettings } from './hooks/useAnimationSettings'
import { useErrorHandler } from './hooks/useErrorHandler'
import { useLoading } from './hooks/useLoading'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useUndoRedo } from './hooks/useUndoRedo'
import { useDragState } from './hooks/useDragState'
import { useSelection } from './hooks/useSelection'
import { useZoom } from './hooks/useZoom'
import { useGrid } from './hooks/useGrid'
import { useConstraints } from './hooks/useConstraints'
import { usePathStats } from './hooks/usePathStats'
import { usePathOptimizer } from './hooks/usePathOptimizer'
import { usePathAnimation } from './hooks/usePathAnimation'
import { usePathPerformance } from './hooks/usePathPerformance'
import { usePathRenderer } from './hooks/usePathRenderer'
import { usePathValidation } from './hooks/usePathValidation'
import { usePathPersistence } from './hooks/usePathPersistence'
import { usePathExport } from './hooks/usePathExport'
import { usePathPreview } from './hooks/usePathPreview'
import { usePathShortcuts } from './hooks/usePathShortcuts'
import { AnimationPathProps, PathPoint } from './types'
import PathVisualizer from '../PathVisualizer'
import PathPresets from '../PathPresets'
import PathManager from '../PathManager'
import PathPreview from '../PathPreview'
import PathShare from '../PathShare'
import PathOptimizer from '../PathOptimizer'
import PathComments from '../PathComments'
import PathSearch from '../PathSearch'
import PathCompare from '../PathCompare'
import PathAnalytics from '../PathAnalytics'
import PathRecommend from '../PathRecommend'
import PathCategory from '../PathCategory'
import PathExport from '../PathExport'
import PathBatch from '../PathBatch'
import PathVersion from '../PathVersion'
import PathTemplate from '../PathTemplate'
import PathControls from './components/PathControls'
import styles from './style.module.css'
import ErrorBoundary from './components/ErrorBoundary'
import PointEditor from './components/PointEditor'
import { usePathAnalytics } from './hooks/usePathAnalytics'
import { usePathEffects } from './hooks/usePathEffects'
import { usePathRules } from './hooks/usePathRules'
import { usePathSuggestions } from './hooks/usePathSuggestions'
import { PathToolbar } from './components/PathToolbar'
import { PathEditor } from './components/PathEditor'
import { PathSettings } from './components/PathSettings'
import { usePathState2 } from './hooks/usePathState2'
import { usePathEvents } from './hooks/usePathEvents'
import { usePathConstraints } from './hooks/usePathConstraints'
import { usePathCache } from './hooks/usePathCache'
import { usePathPerformanceOptimizer } from './hooks/usePathPerformanceOptimizer'
import { PathGrid } from './components/PathGrid'
import { PathLabels } from './components/PathLabels'
import { PathGuides } from './components/PathGuides'
import { PathStats } from './components/PathStats'
import { PathImport } from './components/PathImport'
import { DEFAULT_CONFIG } from './config'

const { Option } = Select
const { Content, Sider } = Layout

const AnimationPath: React.FC<AnimationPathProps> = ({
  onPathChange,
  onPreview,
  selectedDrawing,
}) => {
  const [settings, setSettings] = useState(DEFAULT_CONFIG)
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null)

  const {
    state: historyState,
    push: addToHistory,
    undo,
    redo,
    clear: clearHistory,
    setMaxSize: setHistoryMaxSize,
    canUndo,
    canRedo,
    getHistory,
  } = usePathHistory2([], 100)

  const {
    points,
    isEditing,
    updatePoints,
    toggleEditing,
  } = usePathState({
    onPathChange,
    addToHistory,
  })

  const {
    handleAddPoint,
    handleUpdatePoint,
    handleDeletePoint,
    handlePointDrag,
  } = usePointOperations({
    points,
    setPoints: updatePoints,
    onPathChange,
    addToHistory,
    selectedDrawing,
  })

  const {
    favorites,
    handleFavorite,
    isFavorite,
  } = useFavorites()

  const {
    isPlaying,
    previewPosition,
    progress,
    startPreview,
    stopPreview,
    setPreviewPosition,
  } = usePreview()

  const {
    settings: animationSettings,
    updateSettings,
    resetSettings,
  } = useAnimationSettings()

  const {
    error,
    handleError,
    clearError,
  } = useErrorHandler()

  const {
    isLoading,
    startLoading,
    stopLoading,
  } = useLoading()

  const {
    handleUndo,
    handleRedo,
  } = useUndoRedo({
    points,
    updatePoints,
    undo,
    redo,
    canUndo,
    canRedo,
  })

  const {
    draggedPoint,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragState({
    onPointDrag: handlePointDrag,
  })

  const {
    selectedPoints,
    togglePointSelection,
    selectAll,
    clearSelection,
  } = useSelection()

  const {
    scale,
    center,
    handleZoom,
    resetZoom,
  } = useZoom()

  const {
    settings: gridSettings,
    snapToGrid,
    toggleGrid,
    toggleSnap,
    updateGridSize,
  } = useGrid()

  const {
    constraints,
    setConstraints,
    applyConstraints,
  } = useConstraints()

  const pathStats = usePathStats(points)

  const {
    optimizePath,
    simplifyPath,
    smoothPath,
  } = usePathOptimizer()

  const {
    currentTime,
    getPointAtTime,
    startAnimation,
    stopAnimation,
    pauseAnimation,
    setCurrentTime,
  } = usePathAnimation()

  const {
    getPerformanceMetrics,
    optimizePathForPerformance,
  } = usePathPerformance()

  const {
    getPathSegments,
    getPathCommands,
    getGuideElements,
  } = usePathRenderer()

  const {
    validatePath,
    rules: pathRules,
  } = usePathValidation()

  const {
    savePath,
    loadPath,
    clearSavedPath,
  } = usePathPersistence({
    key: 'animation-path',
    version: '1.0.0',
    compress: true,
  })

  const {
    exportPath,
    downloadPath,
    generateSVGPath,
    generateCSSKeyframes,
    generateJSCode,
  } = usePathExport()

  const {
    isPlaying: isPreviewPlaying,
    currentPoint: previewPoint,
    trailPoints,
    startPreview: startPathPreview,
    stopPreview: stopPathPreview,
    pausePreview: pausePathPreview,
  } = usePathPreview()

  const {
    metrics: pathMetrics,
    segments: pathSegments,
    getOptimizationSuggestions,
    compareWithPrevious,
  } = usePathAnalytics(points)

  const {
    activeEffects,
    presets: effectPresets,
    addEffect,
    removeEffect,
    updateEffect,
    applyEffects,
  } = usePathEffects()

  const pointsWithEffects = useMemo(() => {
    return applyEffects(points)
  }, [points, applyEffects])

  const {
    rules,
    violations,
    validatePoints,
    enforceRules,
    addRule,
    removeRule,
    updateRule,
    toggleRule,
  } = usePathRules()

  const {
    suggestions,
    getSuggestionsByType,
    getHighPrioritySuggestions,
  } = usePathSuggestions(points)

  const handlePointUpdate = useCallback((id: string, updates: Partial<PathPoint>) => {
    const newPoints = points.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    const validatedPoints = enforceRules(newPoints)
    updatePoints(validatedPoints)
    onPathChange(validatedPoints)
  }, [points, enforceRules, updatePoints, onPathChange])

  const handlePreviewStart = useCallback(() => {
    startPathPreview(points, {
      speed: animationSettings.speed,
      loop: animationSettings.loop,
      showTrail: animationSettings.showTrail,
      trailLength: animationSettings.trailLength,
    })
  }, [points, animationSettings, startPathPreview])

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDelete: () => {
      if (isEditing && points.length > 0) {
        handleDeletePoint(points[points.length - 1].id)
      }
    },
    onEscape: () => {
      if (isEditing) {
        toggleEditing()
      }
    },
    onSave: () => {
      handleAsyncOperation('save', async () => {
        // 实现保存逻辑
        message.success('保存成功')
      })
    },
  })

  const handleAsyncOperation = async (key: string, operation: () => Promise<void>) => {
    try {
      startLoading(key)
      await operation()
    } catch (err) {
      handleError(err as Error)
    } finally {
      stopLoading(key)
    }
  }

  const handlePointDrag = useCallback((id: string, x: number, y: number) => {
    const snappedX = snapToGrid(x)
    const snappedY = snapToGrid(y)
    const prevPoint = points.find(p => p.id === id)
    const constrainedPoint = applyConstraints({ ...prevPoint!, x: snappedX, y: snappedY })
    handleUpdatePoint(id, { x: constrainedPoint.x, y: constrainedPoint.y })
  }, [points, handleUpdatePoint, snapToGrid, applyConstraints])

  const handleSave = useCallback(async () => {
    const errors = validatePath(points)
    if (errors.length > 0) {
      message.error(errors[0])
      return
    }
    
    const success = await savePath(points)
    if (success) {
      message.success('保存成功')
    } else {
      message.error('保存失败')
    }
  }, [points, validatePath, savePath])

  const handleExport = useCallback((format: 'json' | 'svg' | 'css' | 'js') => {
    try {
      const content = exportPath(points, {
        format,
        pretty: true,
        includeMetadata: true,
      })
      
      const filename = `animation-path.${format}`
      downloadPath(content, filename)
      message.success('导出成功')
    } catch (error) {
      console.error('Export failed:', error)
      message.error('导出失败')
    }
  }, [points, exportPath, downloadPath])

  usePathShortcuts(
    {
      enabled: true,
      showHints: true,
    },
    {
      onAddPoint: handleAddPoint,
      onDeletePoint: () => {
        if (selectedPoints.length > 0) {
          selectedPoints.forEach(handleDeletePoint)
        } else if (points.length > 0) {
          handleDeletePoint(points[points.length - 1].id)
        }
      },
      onUndo: handleUndo,
      onRedo: handleRedo,
      onSave: handleSave,
      onPreview: handlePreviewStart,
      onToggleGrid: toggleGrid,
      onToggleSnap: toggleSnap,
      onZoomIn: () => handleZoom(0.1, center[0], center[1]),
      onZoomOut: () => handleZoom(-0.1, center[0], center[1]),
      onResetView: resetZoom,
    }
  )

  // 实现工具栏功能
  const handleToolbarActions = {
    undo: () => {
      undo()
      updatePoints(historyState.current)
    },
    redo: () => {
      redo()
      updatePoints(historyState.current)
    },
    copy: () => {
      if (selectedPoints.length > 0) {
        const pointsToCopy = points.filter(p => selectedPoints.includes(p.id))
        navigator.clipboard.writeText(JSON.stringify(pointsToCopy))
      }
    },
    paste: async () => {
      try {
        const text = await navigator.clipboard.readText()
        const pastedPoints = JSON.parse(text)
        updatePoints([...points, ...pastedPoints])
      } catch (error) {
        handleError(error as Error)
      }
    },
    delete: () => {
      if (selectedPoints.length > 0) {
        const newPoints = points.filter(p => !selectedPoints.includes(p.id))
        updatePoints(newPoints)
        clearSelection()
      }
    },
    addPoint: () => {
      const newPoint = {
        id: `point-${Date.now()}`,
        x: 400,
        y: 300,
        time: points.length > 0 ? points[points.length - 1].time + 1000 : 0,
        easing: 'linear',
      }
      handleAddPoint(newPoint)
    },
    removePoint: () => {
      if (points.length > 0) {
        handleDeletePoint(points[points.length - 1].id)
      }
    },
    center: () => {
      if (points.length === 0) return
      const bounds = getPathBounds(points)
      const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2
      const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2
      const offsetX = 400 - centerX
      const offsetY = 300 - centerY
      
      const centeredPoints = points.map(p => ({
        ...p,
        x: p.x + offsetX,
        y: p.y + offsetY,
      }))
      updatePoints(centeredPoints)
    },
  }

  // 添加键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) handleToolbarActions.redo()
            else handleToolbarActions.undo()
            break
          case 'c':
            handleToolbarActions.copy()
            break
          case 'v':
            handleToolbarActions.paste()
            break
          case 'a':
            selectAll()
            e.preventDefault()
            break
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleToolbarActions.delete()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [points, selectedPoints])

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings)
  }

  const handleImport = (importedPoints: typeof points) => {
    updatePoints(importedPoints)
    message.success('导入成功')
  }

  const handlePreview = () => {
    stopAnimation()
    onPreview?.()
  }

  return (
    <ErrorBoundary>
      <Layout className={styles.container}>
        <PathToolbar
          onSave={() => message.success('保存成功')}
          onExport={() => setShowExport(true)}
          onImport={() => setShowImport(true)}
          onClear={() => updatePoints([])}
          onPreview={handlePreview}
          disabled={points.length === 0}
        />

        <Layout className={styles.content}>
          <Content className={styles.main}>
            <PathGrid
              width={800}
              height={600}
              gridSize={settings.constraints.gridSize}
              visible={settings.display.showGrid}
            />
            
            <PathEditor
              points={points}
              onPointsChange={updatePoints}
              editable={!isPlaying}
              width={800}
              height={600}
            />

            <PathLabels
              points={points}
              visible={settings.display.showLabels}
            />

            <PathGuides
              points={points}
              selectedPoint={points.find(p => p.id === selectedPoint) || null}
              visible={settings.display.showGuides}
            />

            <PathControls
              isPlaying={isPlaying}
              progress={progress}
              canUndo={canUndo}
              canRedo={canRedo}
              onPlay={startAnimation}
              onPause={pauseAnimation}
              onStop={stopAnimation}
              onSeek={(progress) => {
                setCurrentTime(progress * animationSettings.animation.duration)
              }}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          </Content>

          <Sider width={300} className={styles.sidebar}>
            <PathSettings
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
            <PathStats points={points} />
          </Sider>
        </Layout>

        <PathExport
          visible={showExport}
          onClose={() => setShowExport(false)}
          points={points}
        />

        <PathImport
          visible={showImport}
          onClose={() => setShowImport(false)}
          onImport={handleImport}
        />
      </Layout>
    </ErrorBoundary>
  )
}

// 辅助函数
function getPathBounds(points: PathPoint[]) {
  if (points.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
  
  return points.reduce((bounds, point) => ({
    minX: Math.min(bounds.minX, point.x),
    maxX: Math.max(bounds.maxX, point.x),
    minY: Math.min(bounds.minY, point.y),
    maxY: Math.max(bounds.maxY, point.y),
  }), {
    minX: points[0].x,
    maxX: points[0].x,
    minY: points[0].y,
    maxY: points[0].y,
  })
}

export default React.memo(AnimationPath) 
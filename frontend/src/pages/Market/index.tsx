import React from 'react'
import { Card, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import ReactECharts from 'echarts-for-react'
import DepthChart from '@/components/Market/DepthChart'
import TechnicalIndicators from '@/components/Market/TechnicalIndicators'
import ChartToolbar from '@/components/Market/ChartToolbar'
import DrawingTools from '@/components/Market/DrawingTools'
import DrawingStyler from '@/components/Market/DrawingStyler'
import LayerManager from '@/components/Market/LayerManager'
import AlignmentTools from '@/components/Market/AlignmentTools'
import Annotation from '@/components/Market/Annotation'
import SnapTools from '@/components/Market/SnapTools'
import ImportExport from '@/components/Market/ImportExport'
import ScaleTools from '@/components/Market/ScaleTools'
import TransformTools from '@/components/Market/TransformTools'
import TemplateManager from '@/components/Market/TemplateManager'
import AnimationTools from '@/components/Market/AnimationTools'
import AnimationEffects from '@/components/Market/AnimationEffects'
import AnimationSequence from '@/components/Market/AnimationSequence'
import AnimationPath from '@/components/Market/AnimationPath'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { applyTheme } from '@/utils/chartThemes'
import { interpolatePath } from '@/utils/pathInterpolation'
import styles from './style.module.css'

interface MarketData {
  symbol: string
  price: number
  change: number
  volume: number
}

const Market: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState('15m')
  const [chartStart, setChartStart] = React.useState(0)
  const [chartEnd, setChartEnd] = React.useState(100)
  const chartRef = React.useRef<any>()
  const indicatorsRef = React.useRef<any>()
  const depthRef = React.useRef<any>()
  const [currentTool, setCurrentTool] = React.useState('')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
  const [drawings, setDrawings] = React.useState<any[]>([])
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [selectedDrawing, setSelectedDrawing] = React.useState<any>(null)
  const [drawingPoints, setDrawingPoints] = React.useState<any[]>([])
  const [history, setHistory] = React.useState<any[][]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStartPoint, setDragStartPoint] = React.useState<[number, number] | null>(null)
  const [copiedDrawing, setCopiedDrawing] = React.useState<any>(null)
  const [selectedDrawings, setSelectedDrawings] = React.useState<any[]>([])
  const [snapEnabled, setSnapEnabled] = React.useState(false)
  const [snapThreshold, setSnapThreshold] = React.useState(5)
  const [scaleX, setScaleX] = React.useState(1)
  const [scaleY, setScaleY] = React.useState(1)
  const [skewX, setSkewX] = React.useState(0)
  const [skewY, setSkewY] = React.useState(0)
  const [gridEnabled, setGridEnabled] = React.useState(false)
  const [gridSize, setGridSize] = React.useState(20)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [animationDuration, setAnimationDuration] = React.useState(1)
  const [animationEasing, setAnimationEasing] = React.useState('linear')
  const [animationTimer, setAnimationTimer] = React.useState<number | null>(null)
  const [selectedEffect, setSelectedEffect] = React.useState('wave')
  const [amplitude, setAmplitude] = React.useState(20)
  const [frequency, setFrequency] = React.useState(1)
  const [pathPoints, setPathPoints] = React.useState<any[]>([])

  const handleZoomIn = () => {
    const range = chartEnd - chartStart
    const center = (chartStart + chartEnd) / 2
    const newRange = range * 0.5
    setChartStart(Math.max(0, center - newRange / 2))
    setChartEnd(Math.min(100, center + newRange / 2))
  }

  const handleZoomOut = () => {
    const range = chartEnd - chartStart
    const center = (chartStart + chartEnd) / 2
    const newRange = range * 2
    setChartStart(Math.max(0, center - newRange / 2))
    setChartEnd(Math.min(100, center + newRange / 2))
  }

  const handleReset = () => {
    setChartStart(0)
    setChartEnd(100)
  }

  const handleFullscreen = () => {
    const element = document.querySelector(`.${styles.chart}`)
    if (element) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        element.requestFullscreen()
      }
    }
  }

  const handleToolSelect = (tool: string) => {
    setCurrentTool(currentTool === tool ? '' : tool)
  }

  const handleClearDrawings = () => {
    setDrawings([])
  }

  const addToHistory = (newDrawings: any[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newDrawings)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setDrawings(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setDrawings(history[historyIndex + 1])
    }
  }

  const handleStyleChange = (style: any) => {
    if (!selectedDrawing) return
    
    const updatedDrawings = drawings.map(d => {
      if (d.id === selectedDrawing.id) {
        return {
          ...d,
          style: {
            ...d.style,
            ...style,
          },
        }
      }
      return d
    })
    setDrawings(updatedDrawings)
    setSelectedDrawing({
      ...selectedDrawing,
      style: {
        ...selectedDrawing.style,
        ...style,
      },
    })
    addToHistory(updatedDrawings)
  }

  const handleDeleteDrawing = (id: string) => {
    const newDrawings = drawings.filter(d => d.id !== id)
    setDrawings(newDrawings)
    setSelectedDrawing(null)
    addToHistory(newDrawings)
  }

  const handleMouseDown = (params: any) => {
    if (!isEditMode || !selectedDrawing) return
    setIsDragging(true)
    setDragStartPoint([params.offsetX, params.offsetY])
  }

  const handleMouseMove = (params: any) => {
    if (!isDragging || !dragStartPoint || !selectedDrawing) return
    
    const dx = params.offsetX - dragStartPoint[0]
    const dy = params.offsetY - dragStartPoint[1]
    
    const updatedDrawings = drawings.map(d => {
      if (d.id === selectedDrawing.id) {
        return {
          ...d,
          points: d.points.map((p: [number, number]) => [
            p[0] + dx,
            p[1] + dy,
          ]),
        }
      }
      return d
    })
    
    setDrawings(updatedDrawings)
    setDragStartPoint([params.offsetX, params.offsetY])
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      setDragStartPoint(null)
      addToHistory(drawings)
    }
  }

  const findSnapPoint = (point: [number, number]): [number, number] => {
    if (!snapEnabled) return point
    
    let closestPoint = point
    let minDistance = snapThreshold
    
    drawings.forEach(drawing => {
      drawing.points.forEach((p: [number, number]) => {
        const distance = Math.sqrt(
          Math.pow(point[0] - p[0], 2) + Math.pow(point[1] - p[1], 2)
        )
        if (distance < minDistance) {
          minDistance = distance
          closestPoint = p
        }
      })
    })
    
    return closestPoint
  }

  const handleSkew = (x: number, y: number) => {
    if (!selectedDrawing) return
    
    const updatedDrawings = drawings.map(d => {
      if (d.id === selectedDrawing.id) {
        return {
          ...d,
          transform: {
            ...d.transform,
            skewX: x,
            skewY: y,
          },
        }
      }
      return d
    })
    
    setDrawings(updatedDrawings)
    addToHistory(updatedDrawings)
    setSkewX(x)
    setSkewY(y)
  }

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (!selectedDrawing) return
    
    const updatedDrawings = drawings.map(d => {
      if (d.id === selectedDrawing.id) {
        const center = [
          (d.points[0][0] + d.points[1]?.[0] || d.points[0][0]) / 2,
          (d.points[0][1] + d.points[1]?.[1] || d.points[0][1]) / 2,
        ]
        return {
          ...d,
          points: d.points.map(p => [
            direction === 'horizontal' ? center[0] * 2 - p[0] : p[0],
            direction === 'vertical' ? center[1] * 2 - p[1] : p[1],
          ]),
        }
      }
      return d
    })
    
    setDrawings(updatedDrawings)
    addToHistory(updatedDrawings)
  }

  const snapToGrid = (point: [number, number]): [number, number] => {
    if (!gridEnabled) return point
    return [
      Math.round(point[0] / gridSize) * gridSize,
      Math.round(point[1] / gridSize) * gridSize,
    ]
  }

  const handleChartClick = (params: any) => {
    if (!currentTool && !isEditMode) return
    
    const point = snapToGrid(findSnapPoint([params.value[0], params.value[1]]))
    
    if (isEditMode) {
      if (selectedDrawing) {
        const updatedDrawings = drawings.map(d => {
          if (d.id === selectedDrawing.id) {
            return {
              ...d,
              points: d.points.map((p: any, i: number) =>
                i === selectedDrawing.pointIndex ? point : p
              ),
            }
          }
          return d
        })
        setDrawings(updatedDrawings)
        setSelectedDrawing(null)
      }
      return
    }

    if (drawingPoints.length === 0) {
      setDrawingPoints([point])
      return
    }

    const newDrawing = {
      id: Date.now(),
      tool: currentTool,
      points: [...drawingPoints, point],
      style: {
        color: '#ff4d4f',
        lineWidth: 1,
        ...(currentTool === 'text' && {
          fontSize: 14,
          text: '双击编辑文字',
        }),
      },
    }
    setDrawings([...drawings, newDrawing])
    setDrawingPoints([])
    setCurrentTool('')
    addToHistory([...drawings, newDrawing])
  }

  const handleAlign = (type: string) => {
    if (selectedDrawings.length < 2) return
    
    let alignValue: number
    const updatedDrawings = [...drawings]
    
    switch (type) {
      case 'left':
        alignValue = Math.min(...selectedDrawings.map(d => d.points[0][0]))
        selectedDrawings.forEach(drawing => {
          const target = updatedDrawings.find(d => d.id === drawing.id)
          if (target) {
            const dx = alignValue - drawing.points[0][0]
            target.points = drawing.points.map(p => [p[0] + dx, p[1]])
          }
        })
        break
      case 'center':
        const centers = selectedDrawings.map(d => {
          const xs = d.points.map((p: number[]) => p[0])
          return (Math.min(...xs) + Math.max(...xs)) / 2
        })
        alignValue = centers.reduce((a, b) => a + b) / centers.length
        selectedDrawings.forEach(drawing => {
          const target = updatedDrawings.find(d => d.id === drawing.id)
          if (target) {
            const xs = drawing.points.map((p: number[]) => p[0])
            const center = (Math.min(...xs) + Math.max(...xs)) / 2
            const dx = alignValue - center
            target.points = drawing.points.map(p => [p[0] + dx, p[1]])
          }
        })
        break
      // ... similar cases for other alignment types
    }
    
    setDrawings(updatedDrawings)
    addToHistory(updatedDrawings)
  }

  const handleGroup = () => {
    if (selectedDrawings.length < 2) return
    
    const groupId = Date.now()
    const updatedDrawings = drawings.map(d => {
      if (selectedDrawings.find(sd => sd.id === d.id)) {
        return { ...d, groupId }
      }
      return d
    })
    
    setDrawings(updatedDrawings)
    addToHistory(updatedDrawings)
  }

  const handleUngroup = () => {
    if (!selectedDrawing?.groupId) return
    
    const updatedDrawings = drawings.map(d => {
      if (d.groupId === selectedDrawing.groupId) {
        const { groupId, ...rest } = d
        return rest
      }
      return d
    })
    
    setDrawings(updatedDrawings)
    addToHistory(updatedDrawings)
  }

  const handleDrawingClick = (params: any) => {
    if (!isEditMode) return
    
    const { componentIndex, pointIndex } = params
    const drawing = drawings[componentIndex]
    
    if (drawing.groupId) {
      const groupDrawings = drawings.filter(d => d.groupId === drawing.groupId)
      setSelectedDrawings(groupDrawings)
    } else {
      setSelectedDrawings([drawing])
    }
    setSelectedDrawing({ ...drawing, pointIndex })
  }

  const handleCopyDrawing = (drawing: any) => {
    setCopiedDrawing(drawing)
  }

  const handlePasteDrawing = () => {
    if (!copiedDrawing) return
    
    const newDrawing = {
      ...copiedDrawing,
      id: Date.now(),
      points: copiedDrawing.points.map((p: [number, number]) => [
        p[0] + 50,
        p[1] + 50,
      ]),
    }
    const newDrawings = [...drawings, newDrawing]
    setDrawings(newDrawings)
    addToHistory(newDrawings)
  }

  const handleDrawingsChange = (newDrawings: any[]) => {
    setDrawings(newDrawings)
    addToHistory(newDrawings)
  }

  const handleAnnotationUpdate = (updates: any) => {
    if (!selectedDrawing) return
    
    const updatedDrawings = drawings.map(d => {
      if (d.id === selectedDrawing.id) {
        return {
          ...d,
          ...updates,
        }
      }
      return d
    })
    
    setDrawings(updatedDrawings)
    setSelectedDrawing({
      ...selectedDrawing,
      ...updates,
    })
    addToHistory(updatedDrawings)
  }

  const handleApplyTemplate = (templateDrawings: any[]) => {
    const newDrawings = templateDrawings.map(d => ({
      ...d,
      id: Date.now() + Math.random(),
    }))
    setDrawings([...drawings, ...newDrawings])
    addToHistory([...drawings, ...newDrawings])
    message.success('应用模板成功')
  }

  const handleAnimate = (config: any) => {
    if (!selectedDrawing) return
    
    const { startPosition, endPosition } = config
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / animationDuration, 1)
      
      const updatedDrawings = drawings.map(d => {
        if (d.id === selectedDrawing.id) {
          return {
            ...d,
            points: d.points.map((p: number[], i: number) => [
              startPosition[i][0] + (endPosition[i][0] - startPosition[i][0]) * progress,
              startPosition[i][1] + (endPosition[i][1] - startPosition[i][1]) * progress,
            ]),
          }
        }
        return d
      })
      
      setDrawings(updatedDrawings)
      
      if (progress < 1) {
        setAnimationTimer(requestAnimationFrame(animate))
      } else {
        setIsPlaying(false)
        setAnimationTimer(null)
        addToHistory(updatedDrawings)
      }
    }
    
    animate()
  }

  const handleAutoLayout = (type: string) => {
    if (!drawings.length) return
    
    let newPositions: [number, number][][] = []
    const center = [400, 300]
    const radius = 150
    
    switch (type) {
      case 'circular':
        newPositions = drawings.map((_, i) => {
          const angle = (i / drawings.length) * Math.PI * 2
          return [[
            center[0] + Math.cos(angle) * radius,
            center[1] + Math.sin(angle) * radius,
          ]]
        })
        break
      case 'grid':
        const cols = Math.ceil(Math.sqrt(drawings.length))
        const spacing = radius / (cols - 1)
        newPositions = drawings.map((_, i) => [[
          center[0] - radius/2 + (i % cols) * spacing,
          center[1] - radius/2 + Math.floor(i / cols) * spacing,
        ]])
        break
      // ... other layout types
    }
    
    const updatedDrawings = drawings.map((d, i) => ({
      ...d,
      points: [newPositions[i][0]],
    }))
    
    setDrawings(updatedDrawings)
    addToHistory(updatedDrawings)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      if (animationTimer) {
        cancelAnimationFrame(animationTimer)
        setAnimationTimer(null)
      }
    } else {
      const startPosition = selectedDrawing.points
      const endPosition = startPosition.map((p: number[]) => [
        p[0] + 100,
        p[1] + 100,
      ])
      handleAnimate({ startPosition, endPosition })
    }
    setIsPlaying(!isPlaying)
  }

  const handleApplyEffect = (effect: string, config: any) => {
    if (!selectedDrawing) return
    
    const { amplitude, frequency } = config
    const startPosition = selectedDrawing.points
    let endPosition: [number, number][]
    
    switch (effect) {
      case 'wave':
        endPosition = startPosition.map((p: [number, number], i: number) => [
          p[0],
          p[1] + Math.sin(i * frequency) * amplitude,
        ])
        break
      case 'spiral':
        const center = [
          (startPosition[0][0] + startPosition[1][0]) / 2,
          (startPosition[0][1] + startPosition[1][1]) / 2,
        ]
        endPosition = startPosition.map((p: [number, number], i: number) => {
          const angle = i * frequency * Math.PI
          const radius = amplitude * (i / startPosition.length)
          return [
            center[0] + Math.cos(angle) * radius,
            center[1] + Math.sin(angle) * radius,
          ]
        })
        break
      case 'shake':
        endPosition = startPosition.map((p: [number, number]) => [
          p[0] + (Math.random() - 0.5) * amplitude,
          p[1] + (Math.random() - 0.5) * amplitude,
        ])
        break
      default:
        endPosition = startPosition
    }
    
    handleAnimate({ startPosition, endPosition })
  }

  const handlePlaySequence = async (steps: any[]) => {
    if (!selectedDrawing || !steps.length) return
    
    for (const step of steps) {
      await new Promise<void>((resolve) => {
        const startPosition = selectedDrawing.points
        let endPosition: [number, number][]
        
        switch (step.effect) {
          case 'move':
            endPosition = startPosition.map(p => [
              p[0] + step.config.x,
              p[1] + step.config.y,
            ])
            break
          case 'scale':
            const center = [
              (startPosition[0][0] + startPosition[1][0]) / 2,
              (startPosition[0][1] + startPosition[1][1]) / 2,
            ]
            endPosition = startPosition.map(p => [
              center[0] + (p[0] - center[0]) * step.config.scale,
              center[1] + (p[1] - center[1]) * step.config.scale,
            ])
            break
          default:
            endPosition = startPosition
        }
        
        handleAnimate({
          startPosition,
          endPosition,
          onComplete: resolve,
        })
      })
    }
  }

  const handlePathChange = (points: any[]) => {
    setPathPoints(points)
  }

  const handlePreviewPath = () => {
    if (!selectedDrawing || !pathPoints.length) return
    
    const startPosition = selectedDrawing.points
    const interpolatedPoints = interpolatePath(pathPoints, 50)
    let currentTime = 0
    
    interpolatedPoints.forEach(async (point, index) => {
      if (index === 0) return
      
      await new Promise<void>(resolve => {
        setTimeout(() => {
          handleAnimate({
            startPosition,
            endPosition: startPosition.map(() => [point.x, point.y]),
            duration: point.time - currentTime,
            easing: 'linear',
            onComplete: resolve,
          })
        }, currentTime * 1000)
      })
      currentTime = point.time
    })
  }

  const baseOption = {
    dataZoom: [
      {
        type: 'inside',
        start: chartStart,
        end: chartEnd,
        xAxisIndex: [0],
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
  }

  const columns: ColumnsType<MarketData> = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '最新价',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '24h涨跌',
      dataIndex: 'change',
      key: 'change',
      render: (change: number) => (
        <span style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      ),
    },
    {
      title: '24h成交量',
      dataIndex: 'volume',
      key: 'volume',
    },
  ]

  const mockData: MarketData[] = [
    { symbol: 'BTC/USDT', price: 50000, change: 2.5, volume: 1000000 },
    { symbol: 'ETH/USDT', price: 3000, change: -1.2, volume: 500000 },
  ]

  const chartOption = applyTheme({
    ...baseOption,
    title: {
      text: 'BTC/USDT'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [50000, 51000, 49000, 52000, 53000, 51500, 50500],
      type: 'line'
    }],
    grid: {
      ...baseOption.grid,
      ...(gridEnabled && {
        backgroundColor: theme === 'light' ? '#fafafa' : '#141414',
        show: true,
        borderWidth: 0,
        splitLine: {
          lineStyle: {
            color: theme === 'light' ? '#f0f0f0' : '#303030',
            width: 1,
          },
        },
      }),
    },
    graphic: drawings
      .filter(d => d.visible !== false)
      .map((drawing, index) => {
        const baseGraphic = {
          type: 'line',
          shape: {
            x1: drawing.points[0][0],
            y1: drawing.points[0][1],
            x2: drawing.points[1]?.[0] || drawing.points[0][0],
            y2: drawing.tool === 'horizontalLine'
              ? drawing.points[0][1]
              : drawing.tool === 'verticalLine'
              ? drawing.points[1]?.[1] || drawing.points[0][1]
              : drawing.points[1]?.[1] || drawing.points[0][1],
          },
          style: {
            stroke: drawing.style?.color || '#ff4d4f',
            lineWidth: drawing.style?.lineWidth || 1,
            ...(drawing.tool === 'arrow' && {
              arrow: { end: true },
            }),
          },
          rotation: drawing.rotation || 0,
          transform: drawing.transform && {
            type: 'skew',
            x: drawing.transform.skewX || 0,
            y: drawing.transform.skewY || 0,
          },
          ...(drawing.annotation?.text && {
            draggable: true,
            ondrag: function(this: any) {
              const { x, y } = this.position
              handleAnnotationUpdate({
                annotationPosition: [x, y],
              })
            },
            children: [{
              type: 'text',
              style: {
                text: drawing.annotation.text,
                fill: drawing.style?.color || '#ff4d4f',
                fontSize: 12,
              },
              position: drawing.annotationPosition || [10, 10],
            }],
          }),
        }

        switch (drawing.tool) {
          case 'line':
          case 'horizontalLine':
          case 'verticalLine':
          case 'arrow':
            return baseGraphic
          case 'rectangle':
            return {
              type: 'rect',
              shape: {
                x: drawing.points[0][0],
                y: drawing.points[0][1],
                width: (drawing.points[1]?.[0] || drawing.points[0][0]) - drawing.points[0][0],
                height: (drawing.points[1]?.[1] || drawing.points[0][1]) - drawing.points[0][1],
              },
              style: {
                stroke: drawing.style?.color || '#ff4d4f',
                lineWidth: drawing.style?.lineWidth || 1,
                fill: 'none',
              },
            }
          case 'circle':
            const radius = Math.sqrt(
              Math.pow((drawing.points[1]?.[0] || drawing.points[0][0]) - drawing.points[0][0], 2) +
              Math.pow((drawing.points[1]?.[1] || drawing.points[0][1]) - drawing.points[0][1], 2)
            return {
              type: 'circle',
              shape: {
                cx: drawing.points[0][0],
                cy: drawing.points[0][1],
                r: radius,
              },
              style: {
                stroke: drawing.style?.color || '#ff4d4f',
                lineWidth: drawing.style?.lineWidth || 1,
                fill: 'none',
              },
            }
          case 'text':
            return {
              type: 'text',
              style: {
                text: drawing.style?.text || '双击编辑文字',
                x: drawing.points[0][0],
                y: drawing.points[0][1],
                fill: drawing.style?.color || '#ff4d4f',
                fontSize: drawing.style?.fontSize || 14,
              },
            }
          default:
            return null
        }
      }),
  }, theme)

  useKeyboardShortcuts({
    onDelete: () => selectedDrawing && handleDeleteDrawing(selectedDrawing.id),
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopy: () => selectedDrawing && handleCopyDrawing(selectedDrawing),
    onPaste: handlePasteDrawing,
    onEscape: () => {
      setCurrentTool('')
      setSelectedDrawing(null)
      setSelectedDrawings([])
      setDrawingPoints([])
    },
  })

  const handleScale = (x: number, y: number) => {
    if (!selectedDrawing) return
    
    const updatedDrawings = drawings.map(d => {
      if (d.id === selectedDrawing.id) {
        const center = [
          (d.points[0][0] + d.points[1]?.[0] || d.points[0][0]) / 2,
          (d.points[0][1] + d.points[1]?.[1] || d.points[0][1]) / 2,
        ]
        return {
          ...d,
          points: d.points.map(p => [
            center[0] + (p[0] - center[0]) * x,
            center[1] + (p[1] - center[1]) * y,
          ]),
        }
      }
      return d
    })
    
    setDrawings(updatedDrawings)
    addToHistory(updatedDrawings)
    setScaleX(x)
    setScaleY(y)
  }

  return (
    <div className={styles.container}>
      <Card title="K线图" className={styles.chart}>
        <ChartToolbar
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onFullscreen={handleFullscreen}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
        <DrawingTools
          currentTool={currentTool}
          onToolSelect={handleToolSelect}
          onClear={handleClearDrawings}
          onThemeChange={setTheme}
          onEditMode={() => setIsEditMode(!isEditMode)}
          isEditMode={isEditMode}
          theme={theme}
        />
        {selectedDrawing && (
          <>
            <DrawingStyler
              drawing={selectedDrawing}
              onStyleChange={handleStyleChange}
              onDelete={handleDeleteDrawing}
              onCopy={handleCopyDrawing}
              onPaste={handlePasteDrawing}
              canPaste={!!copiedDrawing}
            />
            <Annotation
              drawing={selectedDrawing}
              onUpdate={handleAnnotationUpdate}
              onDelete={() => handleDeleteDrawing(selectedDrawing.id)}
            />
            <ScaleTools
              onScale={handleScale}
              onReset={() => handleScale(1, 1)}
              scaleX={scaleX}
              scaleY={scaleY}
              onScaleXChange={x => handleScale(x, scaleY)}
              onScaleYChange={y => handleScale(scaleX, y)}
            />
            <TransformTools
              onSkew={handleSkew}
              onFlip={handleFlip}
              onGridToggle={() => setGridEnabled(!gridEnabled)}
              gridEnabled={gridEnabled}
              gridSize={gridSize}
              onGridSizeChange={setGridSize}
              skewX={skewX}
              skewY={skewY}
              onSkewXChange={x => handleSkew(x, skewY)}
              onSkewYChange={y => handleSkew(skewX, y)}
            />
            <AnimationTools
              onAnimate={handleAnimate}
              onAutoLayout={handleAutoLayout}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onReset={() => {
                if (animationTimer) {
                  cancelAnimationFrame(animationTimer)
                  setAnimationTimer(null)
                }
                setIsPlaying(false)
              }}
              duration={animationDuration}
              onDurationChange={setAnimationDuration}
              easing={animationEasing}
              onEasingChange={setAnimationEasing}
            />
            <AnimationEffects
              onApplyEffect={handleApplyEffect}
              selectedEffect={selectedEffect}
              onEffectChange={setSelectedEffect}
              amplitude={amplitude}
              onAmplitudeChange={setAmplitude}
              frequency={frequency}
              onFrequencyChange={setFrequency}
            />
            <AnimationSequence
              onPlaySequence={handlePlaySequence}
              selectedDrawing={selectedDrawing}
            />
            <AnimationPath
              onPathChange={handlePathChange}
              onPreview={handlePreviewPath}
              selectedDrawing={selectedDrawing}
            />
          </>
        )}
        {selectedDrawings.length > 0 && (
          <AlignmentTools
            onAlign={handleAlign}
            onGroup={handleGroup}
            onUngroup={handleUngroup}
            canGroup={selectedDrawings.length > 1}
            canUngroup={!!selectedDrawing?.groupId}
          />
        )}
        <SnapTools
          enabled={snapEnabled}
          onToggle={setSnapEnabled}
          threshold={snapThreshold}
          onThresholdChange={setSnapThreshold}
        />
        <ReactECharts
          ref={chartRef}
          option={chartOption}
          onEvents={{
            datazoom: (params) => {
              const { start, end } = params
              setChartStart(start)
              setChartEnd(end)
              if (indicatorsRef.current) {
                const instance = indicatorsRef.current.getEchartsInstance()
                instance.dispatchAction({
                  type: 'dataZoom',
                  start,
                  end,
                })
              }
            },
            click: handleChartClick,
            graphicclick: handleDrawingClick,
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp,
          }}
        />
      </Card>

      <div className={styles.sidebar}>
        <ImportExport
          drawings={drawings}
          onImport={newDrawings => {
            setDrawings(newDrawings)
            addToHistory(newDrawings)
          }}
        />
        <LayerManager
          drawings={drawings}
          onDrawingsChange={handleDrawingsChange}
          onSelect={drawing => setSelectedDrawing(drawing)}
          selectedDrawing={selectedDrawing}
        />
        <TemplateManager
          drawings={drawings}
          onApplyTemplate={handleApplyTemplate}
        />
      </div>

      <DepthChart
        ref={depthRef}
        symbol={selectedSymbol}
        baseOption={baseOption}
      />
      <TechnicalIndicators
        ref={indicatorsRef}
        symbol={selectedSymbol}
        baseOption={baseOption}
        timeframe={timeframe}
      />

      <Card title="市场行情" className={styles.table}>
        <Table columns={columns} dataSource={mockData} />
      </Card>
    </div>
  )
}

export default Market 
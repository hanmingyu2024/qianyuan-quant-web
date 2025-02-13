import React from 'react'
import { Button, Slider, Space, Tooltip } from 'antd'
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons'
import styles from '../style.module.css'

interface PathControlsProps {
  isPlaying: boolean
  progress: number
  canUndo?: boolean
  canRedo?: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onSeek: (progress: number) => void
  onUndo?: () => void
  onRedo?: () => void
}

export const PathControls: React.FC<PathControlsProps> = ({
  isPlaying,
  progress,
  canUndo = false,
  canRedo = false,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onUndo,
  onRedo,
}) => {
  return (
    <div className={styles.controls}>
      <Space>
        {onUndo && (
          <Tooltip title="撤销">
            <Button
              icon={<UndoOutlined />}
              disabled={!canUndo}
              onClick={onUndo}
            />
          </Tooltip>
        )}
        
        {onRedo && (
          <Tooltip title="重做">
            <Button
              icon={<RedoOutlined />}
              disabled={!canRedo}
              onClick={onRedo}
            />
          </Tooltip>
        )}

        <Tooltip title={isPlaying ? "暂停" : "播放"}>
          <Button
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={isPlaying ? onPause : onPlay}
          />
        </Tooltip>

        <Tooltip title="停止">
          <Button
            icon={<StopOutlined />}
            onClick={onStop}
          />
        </Tooltip>

        <Slider
          className={styles.progressSlider}
          value={progress}
          onChange={onSeek}
          min={0}
          max={1}
          step={0.001}
          tooltip={{
            formatter: (value) => `${Math.round(value! * 100)}%`
          }}
        />
      </Space>
    </div>
  )
} 
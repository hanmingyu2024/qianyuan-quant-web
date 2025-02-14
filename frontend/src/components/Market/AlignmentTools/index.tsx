import React from 'react'
import { Space, Button, Tooltip } from 'antd'
import {
  AlignLeftOutlined,
  AlignRightOutlined,
  AlignCenterOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface AlignmentToolsProps {
  onAlign: (type: string) => void
  onGroup: () => void
  onUngroup: () => void
  canGroup: boolean
  canUngroup: boolean
}

const AlignmentTools: React.FC<AlignmentToolsProps> = ({
  onAlign,
  onGroup,
  onUngroup,
  canGroup,
  canUngroup,
}) => {
  return (
    <div className={styles.tools}>
      <Space>
        <Tooltip title="左对齐">
          <Button
            icon={<AlignLeftOutlined />}
            onClick={() => onAlign('left')}
          />
        </Tooltip>
        <Tooltip title="水平居中">
          <Button
            icon={<AlignCenterOutlined />}
            onClick={() => onAlign('center')}
          />
        </Tooltip>
        <Tooltip title="右对齐">
          <Button
            icon={<AlignRightOutlined />}
            onClick={() => onAlign('right')}
          />
        </Tooltip>
        <Tooltip title="顶部对齐">
          <Button
            icon={<VerticalAlignTopOutlined />}
            onClick={() => onAlign('top')}
          />
        </Tooltip>
        <Tooltip title="垂直居中">
          <Button
            icon={<VerticalAlignMiddleOutlined />}
            onClick={() => onAlign('middle')}
          />
        </Tooltip>
        <Tooltip title="底部对齐">
          <Button
            icon={<VerticalAlignBottomOutlined />}
            onClick={() => onAlign('bottom')}
          />
        </Tooltip>
        <Tooltip title="组合">
          <Button
            icon={<MergeCellsOutlined />}
            onClick={onGroup}
            disabled={!canGroup}
          />
        </Tooltip>
        <Tooltip title="取消组合">
          <Button
            icon={<SplitCellsOutlined />}
            onClick={onUngroup}
            disabled={!canUngroup}
          />
        </Tooltip>
      </Space>
    </div>
  )
}

export default AlignmentTools 
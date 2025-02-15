import React from 'react';
import { Card, Button, Space, Tooltip } from 'antd';
import MonacoEditor from 'react-monaco-editor';
import styled from 'styled-components';
import { SaveOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';

const StyledCard = styled(Card)`
  .monaco-editor {
    border: 1px solid #f0f0f0;
  }
`;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

interface StrategyEditorProps {
  code: string;
  onChange: (code: string) => void;
  onSave: () => void;
  onRun: () => void;
  onStop: () => void;
  running?: boolean;
  loading?: boolean;
}

const StrategyEditor: React.FC<StrategyEditorProps> = ({
  code,
  onChange,
  onSave,
  onRun,
  onStop,
  running,
  loading,
}) => {
  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    minimap: {
      enabled: true,
    },
  };

  return (
    <StyledCard
      title="策略编辑器"
      extra={
        <Space>
          <Tooltip title="保存">
            <Button
              icon={<SaveOutlined />}
              onClick={onSave}
              loading={loading}
            >
              保存
            </Button>
          </Tooltip>
          {!running ? (
            <Tooltip title="运行">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={onRun}
                loading={loading}
              >
                运行
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="停止">
              <Button
                danger
                icon={<StopOutlined />}
                onClick={onStop}
                loading={loading}
              >
                停止
              </Button>
            </Tooltip>
          )}
        </Space>
      }
    >
      <MonacoEditor
        width="100%"
        height="600"
        language="python"
        theme="vs-light"
        value={code}
        options={editorOptions}
        onChange={onChange}
      />
    </StyledCard>
  );
};

export default StrategyEditor; 
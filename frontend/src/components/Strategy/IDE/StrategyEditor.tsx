import React from 'react';
import { Card, Row, Col, Space, Button, Select, Tabs, Tooltip, message } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import {
  PlayCircleOutlined,
  SaveOutlined,
  BugOutlined,
  DownloadOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;
const { Option } = Select;

const EditorContainer = styled.div`
  height: calc(100vh - 180px);
  .monaco-editor {
    .margin {
      background: ${props => props.theme.colorBgContainer};
    }
  }
`;

const OutputPanel = styled.div`
  height: 200px;
  background: ${props => props.theme.colorBgContainer};
  border: 1px solid ${props => props.theme.colorBorder};
  border-radius: 4px;
  padding: 8px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
`;

interface StrategyFile {
  id: string;
  name: string;
  content: string;
  language: 'python' | 'json' | 'yaml';
}

interface EditorProps {
  files: StrategyFile[];
  activeFile: string;
  onFileChange: (fileId: string) => void;
  onContentChange: (content: string) => void;
  onRun: () => void;
  onDebug: () => void;
  onSave: () => void;
}

const defaultPythonTemplate = `import numpy as np
import pandas as pd
from typing import Dict, List

class Strategy:
    def __init__(self, params: Dict):
        """
        策略初始化
        params: 策略参数字典
        """
        self.params = params
        
    def on_bar(self, data: pd.DataFrame) -> List[Dict]:
        """
        K线数据处理函数
        data: 包含OHLCV数据的DataFrame
        return: 交易信号列表
        """
        signals = []
        # 在这里实现你的交易逻辑
        
        return signals
        
    def on_trade(self, trade: Dict):
        """
        成交回调函数
        trade: 成交信息字典
        """
        pass
        
    def on_order(self, order: Dict):
        """
        委托回调函数
        order: 委托信息字典
        """
        pass
`;

const StrategyEditor: React.FC<EditorProps> = ({
  files,
  activeFile,
  onFileChange,
  onContentChange,
  onRun,
  onDebug,
  onSave,
}) => {
  const { t } = useTranslation();
  const [output, setOutput] = React.useState<string[]>([]);
  const [debugMode, setDebugMode] = React.useState(false);
  const [breakpoints, setBreakpoints] = React.useState<number[]>([]);

  const handleEditorMount = (editor: any, monaco: any) => {
    // 配置编辑器
    editor.updateOptions({
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 4,
      insertSpaces: true,
    });

    // 添加Python语言支持
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'numpy',
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: 'numpy',
            detail: 'Scientific computing library',
          },
          {
            label: 'pandas',
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: 'pandas',
            detail: 'Data analysis library',
          },
          // 添加更多自动完成建议...
        ];
        return { suggestions };
      },
    });
  };

  const handleNewFile = () => {
    // 实现新建文件逻辑
  };

  const handleOpenFile = () => {
    // 实现打开文件逻辑
  };

  const handleRunStrategy = async () => {
    try {
      setOutput(prev => [...prev, '开始运行策略...']);
      await onRun();
      setOutput(prev => [...prev, '策略运行完成']);
    } catch (error) {
      setOutput(prev => [...prev, `错误: ${error.message}`]);
      message.error('策略运行失败');
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card>
        <Row gutter={[16, 16]}>
          <Col flex="auto">
            <Space>
              <Tooltip title={t('strategy.ide.new')}>
                <Button icon={<FileAddOutlined />} onClick={handleNewFile} />
              </Tooltip>
              <Tooltip title={t('strategy.ide.open')}>
                <Button icon={<FolderOpenOutlined />} onClick={handleOpenFile} />
              </Tooltip>
              <Tooltip title={t('strategy.ide.save')}>
                <Button icon={<SaveOutlined />} onClick={onSave} />
              </Tooltip>
              <Tooltip title={t('strategy.ide.run')}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleRunStrategy}
                >
                  {t('strategy.ide.run')}
                </Button>
              </Tooltip>
              <Tooltip title={t('strategy.ide.debug')}>
                <Button
                  icon={<BugOutlined />}
                  onClick={() => setDebugMode(!debugMode)}
                  type={debugMode ? 'primary' : 'default'}
                >
                  {t('strategy.ide.debug')}
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Tabs
          type="editable-card"
          activeKey={activeFile}
          onChange={onFileChange}
        >
          {files.map(file => (
            <TabPane
              key={file.id}
              tab={file.name}
              closable={files.length > 1}
            >
              <EditorContainer>
                <MonacoEditor
                  height="100%"
                  language={file.language}
                  value={file.content}
                  onChange={onContentChange}
                  onMount={handleEditorMount}
                  options={{
                    readOnly: false,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </EditorContainer>
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Card title={t('strategy.ide.output')}>
        <OutputPanel>
          {output.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </OutputPanel>
      </Card>
    </Space>
  );
};

export default StrategyEditor; 
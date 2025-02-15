import React, { useState, useRef, useEffect } from 'react';
import { Card, Space, Button, Tabs, Select, message, Tooltip, Drawer } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import styled from 'styled-components';
import {
  PlayCircleOutlined,
  SaveOutlined,
  BugOutlined,
  FileOutlined,
  PlusOutlined,
  SettingOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;
const { Option } = Select;

const EditorContainer = styled.div`
  height: calc(100vh - 200px);
  border: 1px solid #d9d9d9;
  border-radius: 2px;
`;

interface EditorFile {
  key: string;
  name: string;
  language: string;
  value: string;
}

interface StrategyEditorProps {
  files: EditorFile[];
  onSave: (files: EditorFile[]) => Promise<void>;
  onRun: () => Promise<void>;
  onDebug: () => Promise<void>;
}

interface EditorSettings {
  theme: 'vs-dark' | 'light';
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  wordWrap: 'on' | 'off';
  formatOnSave: boolean;
}

const StrategyEditor: React.FC<StrategyEditorProps> = ({
  files,
  onSave,
  onRun,
  onDebug,
}) => {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(files[0]?.key);
  const [editingFiles, setEditingFiles] = useState(files);
  const [loading, setLoading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>({
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    minimap: true,
    wordWrap: 'on',
    formatOnSave: true,
  });
  
  const editorRef = useRef<any>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (!activeKey || !value) return;
    
    setEditingFiles(prev => 
      prev.map(file => 
        file.key === activeKey ? { ...file, value } : file
      )
    );
  };

  const handleAddFile = () => {
    const newFile: EditorFile = {
      key: `file-${Date.now()}`,
      name: 'New File',
      language: 'python',
      value: '',
    };
    setEditingFiles([...editingFiles, newFile]);
    setActiveKey(newFile.key);
  };

  const handleRemoveFile = (targetKey: string) => {
    const newFiles = editingFiles.filter(file => file.key !== targetKey);
    if (newFiles.length && activeKey === targetKey) {
      setActiveKey(newFiles[newFiles.length - 1].key);
    }
    setEditingFiles(newFiles);
  };

  const handleRenameFile = (key: string, newName: string) => {
    setEditingFiles(prev =>
      prev.map(file =>
        file.key === key ? { ...file, name: newName } : file
      )
    );
  };

  const formatCode = async () => {
    if (editorRef.current) {
      await editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (settings.formatOnSave) {
        await formatCode();
      }
      await onSave(editingFiles);
      message.success(t('editor.save.success'));
    } catch (error) {
      message.error(t('editor.save.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card>
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onRun}
            loading={loading}
          >
            {t('editor.run')}
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            {t('editor.save')}
          </Button>
          <Button
            icon={<BugOutlined />}
            onClick={onDebug}
            loading={loading}
          >
            {t('editor.debug')}
          </Button>
          <Button
            icon={<CodeOutlined />}
            onClick={formatCode}
          >
            {t('editor.format')}
          </Button>
          <Tooltip title={t('editor.settings')}>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
            />
          </Tooltip>
        </Space>
      </Card>

      <Card>
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          type="editable-card"
          onEdit={(targetKey, action) => {
            if (action === 'add') {
              handleAddFile();
            } else if (action === 'remove' && typeof targetKey === 'string') {
              handleRemoveFile(targetKey);
            }
          }}
          tabBarStyle={{ marginBottom: -1 }}
        >
          {editingFiles.map(file => (
            <TabPane
              key={file.key}
              tab={
                <Space>
                  <FileOutlined />
                  {file.name}
                </Space>
              }
            >
              <EditorContainer>
                <MonacoEditor
                  height="100%"
                  language={file.language}
                  value={file.value}
                  onChange={handleEditorChange}
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                  options={{
                    ...settings,
                    minimap: { enabled: settings.minimap },
                    wordWrap: settings.wordWrap,
                    rulers: [80],
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </EditorContainer>
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Drawer
        title={t('editor.settings.title')}
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            value={settings.theme}
            onChange={value => setSettings(prev => ({ ...prev, theme: value }))}
            style={{ width: '100%' }}
          >
            <Option value="vs-dark">Dark Theme</Option>
            <Option value="light">Light Theme</Option>
          </Select>
        </Space>
      </Drawer>
    </Space>
  );
};

export default StrategyEditor; 
import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import styled from 'styled-components';

const EditorContainer = styled.div`
  border: 1px solid ${props => props.theme.colorBorder};
  border-radius: 4px;
  overflow: hidden;
`;

interface CodeEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  height?: number | string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language = 'python',
  readOnly = false,
  onChange,
  height = 400,
}) => {
  const editorOptions = {
    readOnly,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on',
    folding: true,
    renderLineHighlight: 'all',
    suggestOnTriggerCharacters: true,
    formatOnPaste: true,
    formatOnType: true,
  };

  return (
    <EditorContainer>
      <MonacoEditor
        width="100%"
        height={height}
        language={language}
        theme="vs-light"
        value={value}
        options={editorOptions}
        onChange={onChange}
      />
    </EditorContainer>
  );
};

export default CodeEditor; 
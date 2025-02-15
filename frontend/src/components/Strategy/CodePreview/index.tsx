import React from 'react';
import { Card } from 'antd';
import MonacoEditor from 'react-monaco-editor';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  .monaco-editor {
    border: 1px solid #f0f0f0;
  }
`;

interface CodePreviewProps {
  code: string;
  language?: string;
  height?: number | string;
}

const CodePreview: React.FC<CodePreviewProps> = ({
  code,
  language = 'python',
  height = 400,
}) => {
  const editorOptions = {
    readOnly: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on',
    folding: true,
    renderLineHighlight: 'all',
  };

  return (
    <StyledCard bodyStyle={{ padding: 0 }}>
      <MonacoEditor
        width="100%"
        height={height}
        language={language}
        theme="vs-light"
        value={code}
        options={editorOptions}
      />
    </StyledCard>
  );
};

export default CodePreview; 
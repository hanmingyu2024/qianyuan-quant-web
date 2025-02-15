import React from 'react';
import { Input, Button, Space, List, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { TextArea } = Input;

const MessageList = styled(List)`
  height: calc(100% - 120px);
  overflow-y: auto;
  padding: 16px;
  background: ${props => props.theme.colorBgContainer};
  border-radius: 8px;
  margin-bottom: 16px;
`;

const MessageContent = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  background: ${props => props.role === 'user' ? props.theme.colorPrimary : props.theme.colorBgElevated};
  color: ${props => props.role === 'user' ? '#fff' : props.theme.colorText};
  border-radius: 8px;
  margin: 8px 0;
`;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'code' | 'analysis';
  timestamp: number;
}

interface ChatWindowProps {
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  input,
  onInputChange,
  onSend,
  loading,
}) => {
  const { t } = useTranslation();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message: Message) => {
    if (message.type === 'code') {
      return (
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      );
    }
    return message.content;
  };

  return (
    <>
      <MessageList
        dataSource={messages}
        renderItem={(message) => (
          <List.Item
            style={{
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Space align="start">
              {message.role === 'assistant' && (
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
              )}
              <MessageContent role={message.role}>
                {renderMessage(message)}
              </MessageContent>
              {message.role === 'user' && (
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
              )}
            </Space>
          </List.Item>
        )}
      />
      <div ref={messagesEndRef} />
      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t('ai.chat.placeholder')}
          autoSize={{ minRows: 2, maxRows: 4 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onSend}
          loading={loading}
          style={{ height: 'auto' }}
        />
      </Space.Compact>
    </>
  );
};

export default ChatWindow; 
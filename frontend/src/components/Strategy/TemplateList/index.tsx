import React from 'react';
import { Card, List, Tag, Button, Space, Modal } from 'antd';
import { EyeOutlined, CopyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import CodePreview from '../CodePreview';

const StyledCard = styled(Card)`
  .ant-card-meta-title {
    margin-bottom: 8px;
  }
  .ant-card-meta-description {
    height: 44px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  code: string;
  tags: string[];
  author: string;
  createTime: string;
}

interface TemplateListProps {
  onSelect: (template: Template) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ onSelect }) => {
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  const handleSelect = (template: Template) => {
    Modal.confirm({
      title: '使用模板',
      content: `确定要使用 "${template.name}" 模板创建策略吗？`,
      onOk: () => onSelect(template),
    });
  };

  const templates: Template[] = [
    {
      id: '1',
      name: '双均线趋势策略',
      type: 'trend',
      description: '使用快速和慢速移动平均线的交叉来判断趋势，并在趋势方向上进行交易。',
      code: '# 双均线趋势策略示例代码\n...',
      tags: ['趋势跟踪', '技术分析', '入门'],
      author: 'System',
      createTime: '2024-01-01',
    },
    // 添加更多模板...
  ];

  return (
    <>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={templates}
        renderItem={(template) => (
          <List.Item>
            <StyledCard
              actions={[
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(template)}
                >
                  预览
                </Button>,
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => handleSelect(template)}
                >
                  使用
                </Button>,
              ]}
            >
              <Card.Meta
                title={template.name}
                description={template.description}
              />
              <div style={{ marginTop: 16 }}>
                {template.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </StyledCard>
          </List.Item>
        )}
      />

      <Modal
        title={selectedTemplate?.name}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setPreviewVisible(false);
              selectedTemplate && handleSelect(selectedTemplate);
            }}
          >
            使用此模板
          </Button>,
        ]}
        width={800}
      >
        {selectedTemplate && (
          <CodePreview code={selectedTemplate.code} language="python" />
        )}
      </Modal>
    </>
  );
};

export default TemplateList; 
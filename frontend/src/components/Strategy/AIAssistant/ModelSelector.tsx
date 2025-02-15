import React from 'react';
import { Card, Select, List, Tag, Space, Typography, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { RobotOutlined, ThunderboltOutlined, ExperimentOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { AIModel } from '@/types/ai';

const { Option } = Select;
const { Text } = Typography;

const StyledCard = styled(Card)`
  .ant-list-item {
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: ${props => props.theme.colorBgTextHover};
    }

    &.selected {
      background: ${props => props.theme.colorPrimary}10;
    }
  }
`;

const ModelIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colorPrimary}15;
  color: ${props => props.theme.colorPrimary};
  font-size: 20px;
`;

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <StyledCard title={t('ai.model.title')}>
      <List
        dataSource={models}
        renderItem={(model) => (
          <List.Item
            className={model.id === selectedModel ? 'selected' : ''}
            onClick={() => onSelect(model.id)}
          >
            <List.Item.Meta
              avatar={
                <ModelIcon>
                  <RobotOutlined />
                </ModelIcon>
              }
              title={
                <Space>
                  <Text strong>{model.name}</Text>
                  {model.capabilities.map((cap) => (
                    <Tooltip key={cap} title={t(`ai.model.capabilities.${cap}`)}>
                      <Tag color="blue">
                        {cap === 'code' ? <ThunderboltOutlined /> : <ExperimentOutlined />}
                        {t(`ai.model.capabilities.${cap}Short`)}
                      </Tag>
                    </Tooltip>
                  ))}
                </Space>
              }
              description={model.description}
            />
          </List.Item>
        )}
      />
    </StyledCard>
  );
};

export default ModelSelector; 
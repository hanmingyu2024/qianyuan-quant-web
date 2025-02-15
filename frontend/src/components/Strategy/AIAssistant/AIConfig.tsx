import React from 'react';
import { Card, Form, Input, InputNumber, Select, Switch, Space, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { AIModel } from '@/types/ai';

const { Option } = Select;

const StyledCard = styled(Card)`
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

interface AIConfigProps {
  model: AIModel;
  onUpdate: (model: AIModel) => void;
  onReset: () => void;
}

const AIConfig: React.FC<AIConfigProps> = ({
  model,
  onUpdate,
  onReset,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    onUpdate({
      ...model,
      parameters: {
        ...model.parameters,
        ...allValues,
      },
    });
  };

  return (
    <StyledCard title={t('ai.config.title')}>
      <Form
        form={form}
        layout="vertical"
        initialValues={model.parameters}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="temperature"
          label={t('ai.config.temperature')}
          tooltip={t('ai.config.temperatureTooltip')}
        >
          <InputNumber
            min={0}
            max={2}
            step={0.1}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="topP"
          label={t('ai.config.topP')}
          tooltip={t('ai.config.topPTooltip')}
        >
          <InputNumber
            min={0}
            max={1}
            step={0.05}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="maxTokens"
          label={t('ai.config.maxTokens')}
          tooltip={t('ai.config.maxTokensTooltip')}
        >
          <InputNumber
            min={1}
            max={4096}
            step={1}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="presencePenalty"
          label={t('ai.config.presencePenalty')}
          tooltip={t('ai.config.presencePenaltyTooltip')}
        >
          <InputNumber
            min={-2}
            max={2}
            step={0.1}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="frequencyPenalty"
          label={t('ai.config.frequencyPenalty')}
          tooltip={t('ai.config.frequencyPenaltyTooltip')}
        >
          <InputNumber
            min={-2}
            max={2}
            step={0.1}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={onReset}>{t('common.reset')}</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {t('common.apply')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </StyledCard>
  );
};

export default AIConfig; 
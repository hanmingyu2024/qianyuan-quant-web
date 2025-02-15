import React from 'react';
import { Card, Form, Select, InputNumber, Button, Space, Table, Progress, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { LineChartOutlined, RobotOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { Option } = Select;

const StyledCard = styled(Card)`
  .ant-progress {
    margin: 16px 0;
  }
`;

interface OptimizationResult {
  parameters: Record<string, number>;
  performance: {
    returns: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
  improvement: number;
}

interface OptimizationAssistantProps {
  parameters: Array<{
    name: string;
    current: number;
    min: number;
    max: number;
    step: number;
  }>;
  onOptimize: (config: any) => Promise<OptimizationResult>;
  loading?: boolean;
}

const OptimizationAssistant: React.FC<OptimizationAssistantProps> = ({
  parameters,
  onOptimize,
  loading,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [optimizing, setOptimizing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<OptimizationResult | null>(null);

  const handleOptimize = async (values: any) => {
    try {
      setOptimizing(true);
      setProgress(0);

      // 模拟优化进度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 99));
      }, 1000);

      const result = await onOptimize(values);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <StyledCard title={t('ai.optimization.title')}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleOptimize}
      >
        <Form.Item
          name="method"
          label={t('ai.optimization.method')}
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="bayesian">{t('ai.optimization.methods.bayesian')}</Option>
            <Option value="genetic">{t('ai.optimization.methods.genetic')}</Option>
            <Option value="grid">{t('ai.optimization.methods.grid')}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="objective"
          label={t('ai.optimization.objective')}
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="returns">{t('ai.optimization.objectives.returns')}</Option>
            <Option value="sharpe">{t('ai.optimization.objectives.sharpe')}</Option>
            <Option value="sortino">{t('ai.optimization.objectives.sortino')}</Option>
          </Select>
        </Form.Item>

        {parameters.map(param => (
          <Form.Item
            key={param.name}
            name={['parameters', param.name]}
            label={t(`ai.optimization.parameters.${param.name}`)}
            initialValue={param.current}
          >
            <InputNumber
              min={param.min}
              max={param.max}
              step={param.step}
              style={{ width: '100%' }}
            />
          </Form.Item>
        ))}

        <Form.Item>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            htmlType="submit"
            loading={loading || optimizing}
          >
            {t('ai.optimization.start')}
          </Button>
        </Form.Item>
      </Form>

      {optimizing && (
        <Progress
          percent={progress}
          status="active"
          format={percent => `${percent}%`}
        />
      )}

      {result && (
        <>
          <Alert
            message={t('ai.optimization.improvement')}
            description={`+${formatPercent(result.improvement)}`}
            type="success"
            showIcon
          />

          <Table
            dataSource={Object.entries(result.parameters).map(([key, value]) => ({
              key,
              parameter: key,
              value: formatNumber(value, 4),
            }))}
            columns={[
              {
                title: t('ai.optimization.parameter'),
                dataIndex: 'parameter',
                key: 'parameter',
              },
              {
                title: t('ai.optimization.value'),
                dataIndex: 'value',
                key: 'value',
              },
            ]}
            pagination={false}
            style={{ marginTop: 16 }}
          />
        </>
      )}
    </StyledCard>
  );
};

export default OptimizationAssistant; 
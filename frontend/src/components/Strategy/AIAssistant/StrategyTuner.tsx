import React from 'react';
import { Card, Form, Select, InputNumber, Button, Space, Table, Progress, Alert, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { RobotOutlined, LineChartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { Option } = Select;
const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  .ant-tabs-content {
    margin-top: 16px;
  }
`;

const ChartContainer = styled.div`
  height: 300px;
  margin: 16px 0;
`;

interface Parameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
}

interface TuningResult {
  parameters: Record<string, number>;
  metrics: {
    returns: number;
    sharpe: number;
    maxDrawdown: number;
    winRate: number;
  };
  improvement: number;
}

interface StrategyTunerProps {
  parameters: Parameter[];
  onTune: (config: any) => Promise<TuningResult>;
  loading?: boolean;
}

const StrategyTuner: React.FC<StrategyTunerProps> = ({
  parameters,
  onTune,
  loading,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [tuningResult, setTuningResult] = React.useState<TuningResult | null>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  const handleTune = async (values: any) => {
    try {
      const result = await onTune(values);
      setTuningResult(result);
      
      // 更新图表
      if (chartRef.current && chartInstance.current) {
        // 实现图表更新逻辑
      }
    } catch (error) {
      console.error('Tuning failed:', error);
    }
  };

  return (
    <StyledCard title={t('ai.tuner.title')}>
      <Tabs>
        <TabPane
          tab={
            <span>
              <RobotOutlined />
              {t('ai.tuner.parameters')}
            </span>
          }
          key="parameters"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleTune}
          >
            {parameters.map(param => (
              <Form.Item
                key={param.name}
                name={param.name}
                label={
                  <Space>
                    {t(`ai.tuner.parameters.${param.name}`)}
                    <Tooltip title={param.description}>
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                initialValue={param.value}
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
                icon={<ThunderboltOutlined />}
                htmlType="submit"
                loading={loading}
                block
              >
                {t('ai.tuner.start')}
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              {t('ai.tuner.results')}
            </span>
          }
          key="results"
        >
          {tuningResult && (
            <>
              <Alert
                message={t('ai.tuner.improvement')}
                description={`+${formatPercent(tuningResult.improvement)}`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <ChartContainer ref={chartRef} />

              <Table
                dataSource={Object.entries(tuningResult.parameters).map(([key, value]) => ({
                  key,
                  parameter: key,
                  value: formatNumber(value, 4),
                  metric: tuningResult.metrics[key as keyof typeof tuningResult.metrics],
                }))}
                columns={[
                  {
                    title: t('ai.tuner.parameter'),
                    dataIndex: 'parameter',
                    key: 'parameter',
                  },
                  {
                    title: t('ai.tuner.value'),
                    dataIndex: 'value',
                    key: 'value',
                  },
                  {
                    title: t('ai.tuner.metric'),
                    dataIndex: 'metric',
                    key: 'metric',
                    render: (value) => formatNumber(value, 4),
                  },
                ]}
                pagination={false}
              />
            </>
          )}
        </TabPane>
      </Tabs>
    </StyledCard>
  );
};

export default StrategyTuner; 
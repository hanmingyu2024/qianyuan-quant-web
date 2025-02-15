import * as React from 'react';
import { Card, Form, Select, InputNumber, Button, Table, Space, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { TabPane } = Tabs;

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

interface OptimizationResult {
  parameters: Record<string, number>;
  metrics: {
    sharpeRatio: number;
    totalReturn: number;
    maxDrawdown: number;
    winRate: number;
  };
}

interface OptimizerProps {
  parameters: Array<{
    name: string;
    min: number;
    max: number;
    step: number;
    description?: string;
  }>;
  onOptimize: (config: any) => Promise<OptimizationResult[]>;
}

const StrategyOptimizer: React.FC<OptimizerProps> = ({
  parameters,
  onOptimize,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<OptimizationResult[]>([]);
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [selectedMetric, setSelectedMetric] = React.useState<string>('sharpeRatio');

  const handleOptimize = async (values: any) => {
    setLoading(true);
    try {
      const results = await onOptimize(values);
      setResults(results);
      updateChart(results);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChart = (data: OptimizationResult[]) => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((_, index) => index + 1),
        name: 'Iteration',
      },
      yAxis: {
        type: 'value',
        name: t(`strategy.optimizer.metrics.${selectedMetric}`),
        axisLabel: {
          formatter: (value: number) => 
            selectedMetric.includes('Return') || selectedMetric.includes('drawdown')
              ? formatPercent(value)
              : formatNumber(value, 2),
        },
      },
      series: [
        {
          name: t(`strategy.optimizer.metrics.${selectedMetric}`),
          type: 'line',
          data: data.map(r => r.metrics[selectedMetric as keyof typeof r.metrics]),
          markPoint: {
            data: [
              { type: 'max', name: 'Max' },
              { type: 'min', name: 'Min' },
            ],
          },
          markLine: {
            data: [{ type: 'average', name: 'Average' }],
          },
        },
      ],
    };

    chart.setOption(option);
  };

  const columns = [
    ...parameters.map(param => ({
      title: param.name,
      dataIndex: ['parameters', param.name],
      key: param.name,
      render: (value: number) => formatNumber(value, 4),
    })),
    {
      title: t('strategy.optimizer.metrics.sharpeRatio'),
      dataIndex: ['metrics', 'sharpeRatio'],
      key: 'sharpeRatio',
      render: (value: number) => formatNumber(value, 2),
      sorter: (a: OptimizationResult, b: OptimizationResult) =>
        a.metrics.sharpeRatio - b.metrics.sharpeRatio,
    },
    {
      title: t('strategy.optimizer.metrics.totalReturn'),
      dataIndex: ['metrics', 'totalReturn'],
      key: 'totalReturn',
      render: (value: number) => formatPercent(value),
      sorter: (a: OptimizationResult, b: OptimizationResult) =>
        a.metrics.totalReturn - b.metrics.totalReturn,
    },
    {
      title: t('strategy.optimizer.metrics.maxDrawdown'),
      dataIndex: ['metrics', 'maxDrawdown'],
      key: 'maxDrawdown',
      render: (value: number) => formatPercent(Math.abs(value)),
      sorter: (a: OptimizationResult, b: OptimizationResult) =>
        Math.abs(a.metrics.maxDrawdown) - Math.abs(b.metrics.maxDrawdown),
    },
    {
      title: t('strategy.optimizer.metrics.winRate'),
      dataIndex: ['metrics', 'winRate'],
      key: 'winRate',
      render: (value: number) => formatPercent(value),
      sorter: (a: OptimizationResult, b: OptimizationResult) =>
        a.metrics.winRate - b.metrics.winRate,
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title={t('strategy.optimizer.title')}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOptimize}
        >
          <Row gutter={[16, 16]}>
            {parameters.map(param => (
              <Col span={8} key={param.name}>
                <Form.Item
                  label={param.name}
                  name={['parameters', param.name]}
                  tooltip={param.description}
                >
                  <Space>
                    <InputNumber
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      style={{ width: 120 }}
                    />
                    <span>({param.min} - {param.max})</span>
                  </Space>
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('strategy.optimizer.start')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {results.length > 0 && (
        <Card title={t('strategy.optimizer.results')}>
          <Tabs activeKey={selectedMetric} onChange={setSelectedMetric}>
            <TabPane tab="Sharpe Ratio" key="sharpeRatio" />
            <TabPane tab="Total Return" key="totalReturn" />
            <TabPane tab="Max Drawdown" key="maxDrawdown" />
            <TabPane tab="Win Rate" key="winRate" />
          </Tabs>
          
          <ChartContainer ref={chartRef} />

          <Table
            dataSource={results}
            columns={columns}
            rowKey={(record, index) => index.toString()}
            scroll={{ x: true }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </Space>
  );
};

export default StrategyOptimizer; 
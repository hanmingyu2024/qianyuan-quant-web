import React from 'react';
import { Card, Form, InputNumber, Select, Button, Table, Space, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';
import * as echarts from 'echarts';

const { Option } = Select;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

interface Parameter {
  name: string;
  label: string;
  type: 'number' | 'integer';
  min: number;
  max: number;
  step: number;
}

interface OptimizationResult {
  id: string;
  parameters: Record<string, number>;
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}

interface ParameterOptimizerProps {
  parameters: Parameter[];
  onOptimize: (values: any) => Promise<void>;
  loading?: boolean;
  results?: OptimizationResult[];
  onApply?: (params: Record<string, number>) => void;
}

const ParameterOptimizer: React.FC<ParameterOptimizerProps> = ({
  parameters,
  onOptimize,
  loading,
  results = [],
  onApply,
}) => {
  const [form] = Form.useForm();
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current || !results.length) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: results.map((_, index) => `组合${index + 1}`),
      },
      yAxis: [
        {
          type: 'value',
          name: '收益率',
          axisLabel: {
            formatter: '{value}%',
          },
        },
        {
          type: 'value',
          name: '夏普比率',
        },
      ],
      series: [
        {
          name: '总收益率',
          type: 'bar',
          data: results.map(r => r.metrics.totalReturn),
        },
        {
          name: '夏普比率',
          type: 'line',
          yAxisIndex: 1,
          data: results.map(r => r.metrics.sharpeRatio),
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [results]);

  const columns: ColumnsType<OptimizationResult> = [
    ...parameters.map((param) => ({
      title: param.label,
      dataIndex: ['parameters', param.name],
      key: param.name,
      render: (value: number) => formatNumber(value, param.type === 'integer' ? 0 : 2),
    })),
    {
      title: '总收益率',
      dataIndex: ['metrics', 'totalReturn'],
      key: 'totalReturn',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.metrics.totalReturn - b.metrics.totalReturn,
    },
    {
      title: '夏普比率',
      dataIndex: ['metrics', 'sharpeRatio'],
      key: 'sharpeRatio',
      render: (value) => formatNumber(value, 2),
      sorter: (a, b) => a.metrics.sharpeRatio - b.metrics.sharpeRatio,
    },
    {
      title: '最大回撤',
      dataIndex: ['metrics', 'maxDrawdown'],
      key: 'maxDrawdown',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.metrics.maxDrawdown - b.metrics.maxDrawdown,
    },
    {
      title: '胜率',
      dataIndex: ['metrics', 'winRate'],
      key: 'winRate',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.metrics.winRate - b.metrics.winRate,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => onApply?.(record.parameters)}
        >
          应用
        </Button>
      ),
    },
  ];

  return (
    <>
      <StyledCard title="参数优化配置">
        <Form
          form={form}
          layout="vertical"
          onFinish={onOptimize}
        >
          <Row gutter={16}>
            {parameters.map((param) => (
              <Col span={8} key={param.name}>
                <Form.Item
                  label={param.label}
                  required
                >
                  <Space>
                    <Form.Item
                      name={['range', param.name, 'min']}
                      noStyle
                      rules={[{ required: true, message: '请输入最小值' }]}
                    >
                      <InputNumber
                        placeholder="最小值"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                      />
                    </Form.Item>
                    <Form.Item
                      name={['range', param.name, 'max']}
                      noStyle
                      rules={[{ required: true, message: '请输入最大值' }]}
                    >
                      <InputNumber
                        placeholder="最大值"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                      />
                    </Form.Item>
                    <Form.Item
                      name={['range', param.name, 'step']}
                      noStyle
                      rules={[{ required: true, message: '请输入步长' }]}
                    >
                      <InputNumber
                        placeholder="步长"
                        min={param.step}
                        step={param.step}
                      />
                    </Form.Item>
                  </Space>
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              开始优化
            </Button>
          </Form.Item>
        </Form>
      </StyledCard>

      {results.length > 0 && (
        <>
          <StyledCard title="优化结果分析">
            <ChartContainer ref={chartRef} />
          </StyledCard>

          <Card title="优化结果列表">
            <Table
              columns={columns}
              dataSource={results}
              rowKey="id"
              pagination={false}
              loading={loading}
              scroll={{ x: true }}
            />
          </Card>
        </>
      )}
    </>
  );
};

export default ParameterOptimizer; 
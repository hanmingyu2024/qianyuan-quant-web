import React from 'react';
import { Card, Form, InputNumber, Select, Button, Table, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { Option } = Select;

const StyledCard = styled(Card)`
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

interface OptimizationResult {
  id: string;
  parameters: Record<string, number>;
  performance: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}

interface OptimizerProps {
  parameters: {
    name: string;
    label: string;
    min: number;
    max: number;
    step: number;
  }[];
  onOptimize: (params: any) => Promise<void>;
  loading?: boolean;
  results?: OptimizationResult[];
  onApply?: (params: Record<string, number>) => void;
}

const Optimizer: React.FC<OptimizerProps> = ({
  parameters,
  onOptimize,
  loading,
  results = [],
  onApply,
}) => {
  const [form] = Form.useForm();

  const handleOptimize = async (values: any) => {
    try {
      await onOptimize(values);
    } catch (error) {
      message.error('优化失败');
    }
  };

  const columns: ColumnsType<OptimizationResult> = [
    ...parameters.map((param) => ({
      title: param.label,
      dataIndex: ['parameters', param.name],
      key: param.name,
      render: (value: number) => formatNumber(value),
    })),
    {
      title: '总收益率',
      dataIndex: ['performance', 'totalReturn'],
      key: 'totalReturn',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.totalReturn - b.performance.totalReturn,
    },
    {
      title: '夏普比率',
      dataIndex: ['performance', 'sharpeRatio'],
      key: 'sharpeRatio',
      render: (value) => formatNumber(value, 2),
      sorter: (a, b) => a.performance.sharpeRatio - b.performance.sharpeRatio,
    },
    {
      title: '最大回撤',
      dataIndex: ['performance', 'maxDrawdown'],
      key: 'maxDrawdown',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.maxDrawdown - b.performance.maxDrawdown,
    },
    {
      title: '胜率',
      dataIndex: ['performance', 'winRate'],
      key: 'winRate',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.winRate - b.performance.winRate,
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
      <StyledCard title="参数优化">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOptimize}
        >
          <Row gutter={16}>
            {parameters.map((param) => (
              <Col span={8} key={param.name}>
                <Form.Item
                  name={['range', param.name]}
                  label={param.label}
                  rules={[{ required: true }]}
                >
                  <Space>
                    <InputNumber
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      placeholder="最小值"
                    />
                    <InputNumber
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      placeholder="最大值"
                    />
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

      <Card title="优化结果" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={results}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </>
  );
};

export default Optimizer; 
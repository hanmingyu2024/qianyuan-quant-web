import React from 'react';
import { Card, Descriptions, Tag, Button, Space, Divider } from 'antd';
import { EditOutlined, LineChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '@/utils/formatter';

interface Strategy {
  id: string;
  name: string;
  type: string;
  description: string;
  symbols: string[];
  timeframe: string;
  enabled: boolean;
  status: 'running' | 'stopped' | 'error';
  createdAt: string;
  updatedAt: string;
  author: string;
  version: string;
}

interface StrategyDetailProps {
  data: Strategy;
}

const StrategyDetail: React.FC<StrategyDetailProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <Card
      title="策略详情"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/strategy/edit/${data.id}`)}
          >
            编辑策略
          </Button>
          <Button
            icon={<LineChartOutlined />}
            onClick={() => navigate(`/strategy/backtest/${data.id}`)}
          >
            策略回测
          </Button>
        </Space>
      }
    >
      <Descriptions column={2}>
        <Descriptions.Item label="策略名称">{data.name}</Descriptions.Item>
        <Descriptions.Item label="策略类型">
          {data.type === 'trend' && '趋势策略'}
          {data.type === 'grid' && '网格策略'}
          {data.type === 'arbitrage' && '套利策略'}
          {data.type === 'mean_reversion' && '均值回归'}
        </Descriptions.Item>
        <Descriptions.Item label="交易对">
          {data.symbols.map((symbol) => (
            <Tag key={symbol}>{symbol}</Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="时间周期">{data.timeframe}</Descriptions.Item>
        <Descriptions.Item label="运行状态">
          <Tag color={data.status === 'running' ? 'green' : data.status === 'error' ? 'red' : 'default'}>
            {data.status === 'running' ? '运行中' : data.status === 'stopped' ? '已停止' : '异常'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="启用状态">
          <Tag color={data.enabled ? 'green' : 'default'}>
            {data.enabled ? '已启用' : '已禁用'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">{formatTime(data.createdAt)}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{formatTime(data.updatedAt)}</Descriptions.Item>
        <Descriptions.Item label="作者">{data.author}</Descriptions.Item>
        <Descriptions.Item label="版本">{data.version}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions column={1}>
        <Descriptions.Item label="策略描述">
          {data.description || '暂无描述'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default StrategyDetail; 
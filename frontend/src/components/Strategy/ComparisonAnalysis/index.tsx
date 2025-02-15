import React from 'react';
import { Card, Table, Row, Col, Statistic, Select, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';
import ComparisonChart from './ComparisonChart';

const { Option } = Select;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface Strategy {
  id: string;
  name: string;
  performance: {
    totalReturn: number;
    annualReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    volatility: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
  };
  returns: {
    time: string;
    value: number;
  }[];
}

interface ComparisonAnalysisProps {
  strategies: Strategy[];
  onStrategySelect: (strategyIds: string[]) => void;
  loading?: boolean;
}

const ComparisonAnalysis: React.FC<ComparisonAnalysisProps> = ({
  strategies,
  onStrategySelect,
  loading,
}) => {
  const [selectedStrategies, setSelectedStrategies] = React.useState<string[]>([]);

  const handleStrategyChange = (values: string[]) => {
    setSelectedStrategies(values);
    onStrategySelect(values);
  };

  const columns: ColumnsType<Strategy> = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: '总收益率',
      dataIndex: ['performance', 'totalReturn'],
      key: 'totalReturn',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a, b) => a.performance.totalReturn - b.performance.totalReturn,
    },
    {
      title: '年化收益率',
      dataIndex: ['performance', 'annualReturn'],
      key: 'annualReturn',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a, b) => a.performance.annualReturn - b.performance.annualReturn,
    },
    {
      title: '最大回撤',
      dataIndex: ['performance', 'maxDrawdown'],
      key: 'maxDrawdown',
      render: (value) => (
        <span style={{ color: '#f5222d' }}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a, b) => a.performance.maxDrawdown - b.performance.maxDrawdown,
    },
    {
      title: '夏普比率',
      dataIndex: ['performance', 'sharpeRatio'],
      key: 'sharpeRatio',
      render: (value) => formatNumber(value, 2),
      sorter: (a, b) => a.performance.sharpeRatio - b.performance.sharpeRatio,
    },
    {
      title: '波动率',
      dataIndex: ['performance', 'volatility'],
      key: 'volatility',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.volatility - b.performance.volatility,
    },
    {
      title: '胜率',
      dataIndex: ['performance', 'winRate'],
      key: 'winRate',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.winRate - b.performance.winRate,
    },
    {
      title: '盈亏比',
      dataIndex: ['performance', 'profitFactor'],
      key: 'profitFactor',
      render: (value) => formatNumber(value, 2),
      sorter: (a, b) => a.performance.profitFactor - b.performance.profitFactor,
    },
    {
      title: '交易次数',
      dataIndex: ['performance', 'totalTrades'],
      key: 'totalTrades',
      sorter: (a, b) => a.performance.totalTrades - b.performance.totalTrades,
    },
  ];

  return (
    <>
      <StyledCard>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="请选择要对比的策略"
            value={selectedStrategies}
            onChange={handleStrategyChange}
            maxTagCount={5}
          >
            {strategies.map(strategy => (
              <Option key={strategy.id} value={strategy.id}>
                {strategy.name}
              </Option>
            ))}
          </Select>
          {selectedStrategies.length > 0 && (
            <ComparisonChart
              data={strategies.filter(s => selectedStrategies.includes(s.id))}
            />
          )}
        </Space>
      </StyledCard>

      <Table
        columns={columns}
        dataSource={strategies}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={false}
        rowClassName={(record) => 
          selectedStrategies.includes(record.id) ? 'ant-table-row-selected' : ''
        }
        onRow={(record) => ({
          onClick: () => {
            const newSelected = selectedStrategies.includes(record.id)
              ? selectedStrategies.filter(id => id !== record.id)
              : [...selectedStrategies, record.id];
            handleStrategyChange(newSelected);
          },
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
};

export default ComparisonAnalysis; 
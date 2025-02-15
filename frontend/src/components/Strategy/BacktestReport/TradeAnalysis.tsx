import React from 'react';
import { Card, Table, Tag, Row, Col, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { formatTime, formatNumber, formatPercent } from '@/utils/formatter';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface Trade {
  time: string;
  symbol: string;
  direction: 'long' | 'short';
  type: 'open' | 'close';
  price: number;
  amount: number;
  pnl: number;
  pnlRate: number;
  holdingPeriod: number;
}

interface TradeAnalysisProps {
  data: Trade[];
}

const TradeAnalysis: React.FC<TradeAnalysisProps> = ({ data }) => {
  const statistics = React.useMemo(() => {
    const winningTrades = data.filter(trade => trade.pnl > 0);
    const losingTrades = data.filter(trade => trade.pnl < 0);

    return {
      totalTrades: data.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: winningTrades.length / data.length,
      avgWinning: winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length,
      avgLosing: losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length,
      avgHoldingPeriod: data.reduce((sum, trade) => sum + trade.holdingPeriod, 0) / data.length,
    };
  }, [data]);

  const columns: ColumnsType<Trade> = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time) => formatTime(time),
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '类型',
      key: 'type',
      render: (_, record) => (
        <Space>
          <Tag color={record.direction === 'long' ? 'green' : 'red'}>
            {record.direction === 'long' ? '多' : '空'}
          </Tag>
          <Tag>{record.type === 'open' ? '开仓' : '平仓'}</Tag>
        </Space>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatNumber(price, 2),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: '盈亏',
      key: 'pnl',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: record.pnl >= 0 ? '#52c41a' : '#f5222d' }}>
            {formatNumber(record.pnl, 2)} USDT
          </span>
          <span style={{ color: record.pnlRate >= 0 ? '#52c41a' : '#f5222d' }}>
            {formatPercent(record.pnlRate)}
          </span>
        </Space>
      ),
    },
    {
      title: '持仓时间',
      dataIndex: 'holdingPeriod',
      key: 'holdingPeriod',
      render: (period) => `${period} 分钟`,
    },
  ];

  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="总交易次数"
              value={statistics.totalTrades}
              suffix={`胜率 ${formatPercent(statistics.winRate)}`}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="平均盈利"
              value={statistics.avgWinning}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="平均亏损"
              value={statistics.avgLosing}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="平均持仓时间"
              value={statistics.avgHoldingPeriod}
              suffix="分钟"
            />
          </StyledCard>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => `${record.time}-${record.symbol}-${record.type}`}
        pagination={{
          pageSize: 50,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        scroll={{ x: true }}
      />
    </>
  );
};

export default TradeAnalysis; 
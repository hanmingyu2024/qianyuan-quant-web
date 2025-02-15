import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';
import TradingChart from './TradingChart';
import PositionList from './PositionList';
import OrderList from './OrderList';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface DashboardProps {
  data: {
    equity: {
      total: number;
      available: number;
      frozen: number;
      profit: number;
      profitRate: number;
    };
    positions: any[];
    orders: any[];
    performance: {
      totalReturn: number;
      todayReturn: number;
      winRate: number;
      sharpeRatio: number;
      maxDrawdown: number;
      volatility: number;
    };
    trades: {
      time: string[];
      equity: number[];
      benchmark: number[];
    };
  };
  loading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, loading }) => {
  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="账户权益"
              value={data.equity.total}
              precision={2}
              prefix="$"
              suffix={
                <Space>
                  <span style={{ fontSize: 14 }}>
                    {data.equity.profit >= 0 ? (
                      <span style={{ color: '#52c41a' }}>
                        <ArrowUpOutlined /> {formatPercent(data.equity.profitRate)}
                      </span>
                    ) : (
                      <span style={{ color: '#f5222d' }}>
                        <ArrowDownOutlined /> {formatPercent(data.equity.profitRate)}
                      </span>
                    )}
                  </span>
                </Space>
              }
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="可用资金"
              value={data.equity.available}
              precision={2}
              prefix="$"
            />
            <Progress
              percent={Number(formatPercent(data.equity.available / data.equity.total, 0))}
              size="small"
              status="active"
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="胜率"
              value={data.performance.winRate}
              precision={2}
              suffix="%"
            />
            <Progress
              percent={data.performance.winRate}
              size="small"
              status={data.performance.winRate >= 50 ? 'success' : 'exception'}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="最大回撤"
              value={data.performance.maxDrawdown}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
          </StyledCard>
        </Col>
      </Row>

      <StyledCard title="权益曲线" loading={loading}>
        <TradingChart data={data.trades} />
      </StyledCard>

      <Row gutter={16}>
        <Col span={12}>
          <StyledCard title="持仓明细" loading={loading}>
            <PositionList data={data.positions} />
          </StyledCard>
        </Col>
        <Col span={12}>
          <StyledCard title="委托记录" loading={loading}>
            <OrderList data={data.orders} />
          </StyledCard>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard; 
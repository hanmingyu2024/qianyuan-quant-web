import React from 'react';
import { Card, Row, Col, Statistic, Progress, Alert, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';
import RiskIndicators from './RiskIndicators';
import PositionMonitor from './PositionMonitor';
import OrderMonitor from './OrderMonitor';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface MonitorData {
  equity: {
    total: number;
    available: number;
    frozen: number;
    margin: number;
    marginRate: number;
    leverage: number;
    pnl: number;
    pnlRate: number;
    drawdown: number;
  };
  risks: {
    volatility: number;
    var: number;
    concentration: number;
    correlation: number;
    warnings: {
      type: 'info' | 'warning' | 'error';
      message: string;
    }[];
  };
  positions: Array<{
    symbol: string;
    direction: 'long' | 'short';
    amount: number;
    value: number;
    pnl: number;
    pnlRate: number;
    risk: number;
  }>;
  orders: Array<{
    id: string;
    symbol: string;
    type: 'limit' | 'market';
    direction: 'buy' | 'sell';
    price: number;
    amount: number;
    status: 'pending' | 'filled' | 'canceled';
    createTime: string;
  }>;
}

interface MonitorProps {
  data: MonitorData;
  loading?: boolean;
  onRefresh?: () => void;
}

const Monitor: React.FC<MonitorProps> = ({
  data,
  loading,
  onRefresh,
}) => {
  return (
    <>
      {data.risks.warnings.map((warning, index) => (
        <Alert
          key={index}
          message={warning.type === 'error' ? '风险警告' : '风险提示'}
          description={warning.message}
          type={warning.type}
          showIcon
          style={{ marginBottom: 16 }}
        />
      ))}

      <Card
        title="账户概览"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={6}>
            <StyledCard>
              <Statistic
                title="账户权益"
                value={data.equity.total}
                precision={2}
                prefix="$"
              />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard>
              <Statistic
                title="可用资金"
                value={data.equity.available}
                precision={2}
                prefix="$"
              />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard>
              <Statistic
                title="持仓盈亏"
                value={data.equity.pnl}
                precision={2}
                prefix="$"
                valueStyle={{ color: data.equity.pnl >= 0 ? '#52c41a' : '#f5222d' }}
                suffix={`(${formatPercent(data.equity.pnlRate)})`}
              />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard>
              <Statistic
                title="当前回撤"
                value={data.equity.drawdown}
                precision={2}
                suffix="%"
                valueStyle={{ color: '#f5222d' }}
              />
            </StyledCard>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <StyledCard title="杠杆率">
              <Progress
                type="dashboard"
                percent={data.equity.leverage * 100}
                format={(percent) => `${formatNumber(percent!, 1)}%`}
                status={data.equity.leverage >= 3 ? 'exception' : 'normal'}
              />
            </StyledCard>
          </Col>
          <Col span={8}>
            <StyledCard title="保证金率">
              <Progress
                type="dashboard"
                percent={data.equity.marginRate * 100}
                format={(percent) => `${formatNumber(percent!, 1)}%`}
                status={data.equity.marginRate <= 0.1 ? 'exception' : 'normal'}
              />
            </StyledCard>
          </Col>
          <Col span={8}>
            <StyledCard title="持仓集中度">
              <Progress
                type="dashboard"
                percent={data.risks.concentration * 100}
                format={(percent) => `${formatNumber(percent!, 1)}%`}
                status={data.risks.concentration >= 0.5 ? 'exception' : 'normal'}
              />
            </StyledCard>
          </Col>
        </Row>
      </Card>

      <RiskIndicators data={data.risks} />
      <PositionMonitor data={data.positions} />
      <OrderMonitor data={data.orders} />
    </>
  );
};

export default Monitor; 
import React from 'react';
import { Card, Descriptions, Row, Col, Statistic, Divider } from 'antd';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';
import ReturnChart from './ReturnChart';
import DrawdownChart from './DrawdownChart';
import MonthlyReturnTable from './MonthlyReturnTable';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface Performance {
  totalReturn: number;
  annualReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortino: number;
  calmar: number;
  winRate: number;
  profitFactor: number;
  recoveryFactor: number;
  trades: number;
  avgHoldingPeriod: number;
  avgWinAmount: number;
  avgLossAmount: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  returns: {
    time: string;
    value: number;
    benchmark: number;
  }[];
  drawdowns: {
    time: string;
    value: number;
  }[];
  monthlyReturns: {
    year: number;
    month: number;
    return: number;
    trades: number;
  }[];
}

interface PerformanceReportProps {
  data: Performance;
  loading?: boolean;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({
  data,
  loading,
}) => {
  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="总收益率"
              value={data.totalReturn}
              precision={2}
              suffix="%"
              valueStyle={{ color: data.totalReturn >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="年化收益率"
              value={data.annualReturn}
              precision={2}
              suffix="%"
              valueStyle={{ color: data.annualReturn >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="最大回撤"
              value={data.maxDrawdown}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="夏普比率"
              value={data.sharpeRatio}
              precision={2}
              valueStyle={{ color: data.sharpeRatio >= 2 ? '#52c41a' : data.sharpeRatio >= 1 ? '#faad14' : '#f5222d' }}
            />
          </StyledCard>
        </Col>
      </Row>

      <StyledCard title="收益曲线" loading={loading}>
        <ReturnChart data={data.returns} />
      </StyledCard>

      <StyledCard title="回撤分析" loading={loading}>
        <DrawdownChart data={data.drawdowns} />
      </StyledCard>

      <Card title="绩效指标" loading={loading}>
        <Descriptions column={3}>
          <Descriptions.Item label="总交易次数">{data.trades}</Descriptions.Item>
          <Descriptions.Item label="胜率">{formatPercent(data.winRate)}</Descriptions.Item>
          <Descriptions.Item label="盈亏比">{formatNumber(data.profitFactor, 2)}</Descriptions.Item>
          <Descriptions.Item label="索提诺比率">{formatNumber(data.sortino, 2)}</Descriptions.Item>
          <Descriptions.Item label="卡玛比率">{formatNumber(data.calmar, 2)}</Descriptions.Item>
          <Descriptions.Item label="恢复因子">{formatNumber(data.recoveryFactor, 2)}</Descriptions.Item>
          <Descriptions.Item label="平均持仓时间">{data.avgHoldingPeriod} 分钟</Descriptions.Item>
          <Descriptions.Item label="平均盈利">{formatNumber(data.avgWinAmount, 2)} USDT</Descriptions.Item>
          <Descriptions.Item label="平均亏损">{formatNumber(data.avgLossAmount, 2)} USDT</Descriptions.Item>
          <Descriptions.Item label="最大连续盈利">{data.maxConsecutiveWins} 次</Descriptions.Item>
          <Descriptions.Item label="最大连续亏损">{data.maxConsecutiveLosses} 次</Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      <StyledCard title="月度收益" loading={loading}>
        <MonthlyReturnTable data={data.monthlyReturns} />
      </StyledCard>
    </>
  );
};

export default PerformanceReport; 
import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import styled from 'styled-components';
import { formatNumber } from '@/utils/formatter';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface RiskData {
  volatility: number;
  var: number;
  concentration: number;
  correlation: number;
}

interface RiskIndicatorsProps {
  data: RiskData;
}

const RiskIndicators: React.FC<RiskIndicatorsProps> = ({ data }) => {
  return (
    <StyledCard title="风险指标">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="波动率"
            value={data.volatility * 100}
            precision={2}
            suffix="%"
            valueStyle={{ color: data.volatility >= 0.3 ? '#f5222d' : '#52c41a' }}
          />
          <Progress
            percent={data.volatility * 100}
            status={data.volatility >= 0.3 ? 'exception' : 'success'}
            showInfo={false}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="VaR"
            value={data.var}
            precision={2}
            prefix="$"
            valueStyle={{ color: '#f5222d' }}
          />
          <Progress
            percent={Math.min(data.var / 1000 * 100, 100)}
            status="exception"
            showInfo={false}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="持仓集中度"
            value={data.concentration * 100}
            precision={2}
            suffix="%"
            valueStyle={{ color: data.concentration >= 0.5 ? '#f5222d' : '#52c41a' }}
          />
          <Progress
            percent={data.concentration * 100}
            status={data.concentration >= 0.5 ? 'exception' : 'success'}
            showInfo={false}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="相关性"
            value={data.correlation}
            precision={2}
            valueStyle={{ color: Math.abs(data.correlation) >= 0.7 ? '#f5222d' : '#52c41a' }}
          />
          <Progress
            percent={Math.abs(data.correlation) * 100}
            status={Math.abs(data.correlation) >= 0.7 ? 'exception' : 'success'}
            showInfo={false}
          />
        </Col>
      </Row>
    </StyledCard>
  );
};

export default RiskIndicators; 
import React from 'react';
import { Card, Row, Col, Statistic, Progress, Alert, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface RiskMetrics {
  currentDrawdown: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  var: number;
  leverage: number;
  marginRate: number;
  concentration: number;
  positions: {
    symbol: string;
    risk: number;
    warning: string;
    level: 'normal' | 'warning' | 'danger';
  }[];
}

interface RiskMonitorProps {
  data: RiskMetrics;
  loading?: boolean;
}

const RiskMonitor: React.FC<RiskMonitorProps> = ({ data, loading }) => {
  const columns: ColumnsType<typeof data.positions[0]> = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '风险度',
      dataIndex: 'risk',
      key: 'risk',
      render: (risk) => (
        <Progress
          percent={risk * 100}
          size="small"
          status={risk >= 0.8 ? 'exception' : risk >= 0.5 ? 'active' : 'normal'}
          format={(percent) => `${formatNumber(percent!, 1)}%`}
        />
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const colorMap = {
          normal: 'green',
          warning: 'gold',
          danger: 'red',
        };
        const textMap = {
          normal: '正常',
          warning: '警告',
          danger: '危险',
        };
        return <Tag color={colorMap[level]}>{textMap[level]}</Tag>;
      },
    },
    {
      title: '风险提示',
      dataIndex: 'warning',
      key: 'warning',
    },
  ];

  return (
    <>
      {data.currentDrawdown <= -10 && (
        <Alert
          message="风险警告"
          description={`当前回撤已达 ${formatPercent(data.currentDrawdown)}，请注意风险控制！`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16}>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="当前回撤"
              value={data.currentDrawdown}
              precision={2}
              suffix="%"
              valueStyle={{ color: data.currentDrawdown <= -5 ? '#f5222d' : '#52c41a' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="波动率"
              value={data.volatility * 100}
              precision={2}
              suffix="%"
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="Beta系数"
              value={data.beta}
              precision={2}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard loading={loading}>
            <Statistic
              title="VaR"
              value={data.var}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#f5222d' }}
            />
          </StyledCard>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <StyledCard
            title="杠杆率"
            loading={loading}
          >
            <Progress
              type="dashboard"
              percent={data.leverage * 100}
              format={(percent) => `${formatNumber(percent!, 1)}%`}
              status={data.leverage >= 3 ? 'exception' : 'normal'}
            />
          </StyledCard>
        </Col>
        <Col span={8}>
          <StyledCard
            title="保证金率"
            loading={loading}
          >
            <Progress
              type="dashboard"
              percent={data.marginRate * 100}
              format={(percent) => `${formatNumber(percent!, 1)}%`}
              status={data.marginRate <= 0.1 ? 'exception' : 'normal'}
            />
          </StyledCard>
        </Col>
        <Col span={8}>
          <StyledCard
            title="持仓集中度"
            loading={loading}
          >
            <Progress
              type="dashboard"
              percent={data.concentration * 100}
              format={(percent) => `${formatNumber(percent!, 1)}%`}
              status={data.concentration >= 0.5 ? 'exception' : 'normal'}
            />
          </StyledCard>
        </Col>
      </Row>

      <Card title="持仓风险" loading={loading}>
        <Table
          columns={columns}
          dataSource={data.positions}
          rowKey="symbol"
          pagination={false}
        />
      </Card>
    </>
  );
};

export default RiskMonitor; 
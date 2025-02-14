import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Alert, Space } from 'antd';
import { Line, Gauge } from '@ant-design/plots';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined } from '@ant-design/icons';

interface RiskMetrics {
  totalValue: number;
  exposure: number;
  exposureLimit: number;
  var: number;  // Value at Risk
  varLimit: number;
  leverage: number;
  leverageLimit: number;
  concentration: number;
  concentrationLimit: number;
  marginUsage: number;
  marginLimit: number;
}

interface RiskAlert {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'danger';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

const RiskMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<RiskMetrics>({
    totalValue: 10000000,
    exposure: 6000000,
    exposureLimit: 8000000,
    var: 150000,
    varLimit: 200000,
    leverage: 1.5,
    leverageLimit: 2,
    concentration: 0.25,
    concentrationLimit: 0.3,
    marginUsage: 0.6,
    marginLimit: 0.8,
  });

  const [alerts, setAlerts] = useState<RiskAlert[]>([
    {
      id: '1',
      timestamp: Date.now(),
      level: 'warning',
      message: '投资组合VaR接近预警线',
      metric: 'VaR',
      value: 150000,
      threshold: 200000,
    },
    {
      id: '2',
      timestamp: Date.now() - 3600000,
      level: 'danger',
      message: '单一品种持仓集中度过高',
      metric: '持仓集中度',
      value: 0.25,
      threshold: 0.3,
    },
  ]);

  // 风险指标历史数据
  const riskHistory = [
    { time: '09:30', var: 120000, exposure: 5500000 },
    { time: '10:00', var: 135000, exposure: 5800000 },
    { time: '10:30', var: 142000, exposure: 6000000 },
    { time: '11:00', var: 150000, exposure: 6000000 },
  ];

  const alertColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const colorMap = {
          info: 'blue',
          warning: 'orange',
          danger: 'red',
        };
        return (
          <Tag color={colorMap[level as keyof typeof colorMap]}>
            {level.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: '指标',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: '当前值',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '信息',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px 0' }}>
      {alerts.length > 0 && (
        <Alert
          message="风险预警"
          description={
            <ul>
              {alerts.map(alert => (
                <li key={alert.id}>
                  <WarningOutlined style={{ color: alert.level === 'danger' ? '#ff4d4f' : '#faad14' }} />
                  {' '}
                  {alert.message}
                </li>
              ))}
            </ul>
          }
          type={alerts.some(a => a.level === 'danger') ? 'error' : 'warning'}
          showIcon
        />
      )}

      <Row gutter={16}>
        <Col span={8}>
          <Card title="风险敞口">
            <Statistic
              title="当前敞口"
              value={metrics.exposure}
              precision={0}
              valueStyle={{ color: metrics.exposure > metrics.exposureLimit * 0.8 ? '#cf1322' : '#3f8600' }}
              prefix="¥"
              suffix={` / ¥${metrics.exposureLimit.toLocaleString()}`}
            />
            <Progress
              percent={Math.round((metrics.exposure / metrics.exposureLimit) * 100)}
              status={metrics.exposure > metrics.exposureLimit * 0.8 ? 'exception' : 'active'}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="VaR">
            <Gauge
              percent={(metrics.var / metrics.varLimit) * 100}
              range={{
                color: ['l(0) 0:#30BF78 0.5:#FAAD14 1:#F4664A'],
              }}
              indicator={{
                pointer: {
                  style: {
                    stroke: '#D0D0D0',
                  },
                },
                pin: {
                  style: {
                    stroke: '#D0D0D0',
                  },
                },
              }}
              statistic={{
                content: {
                  formatter: ({ percent }: { percent: number }) => `${(percent || 0).toFixed(2)}%`,
                  style: {
                    color: metrics.var > metrics.varLimit * 0.8 ? '#cf1322' : '#3f8600',
                  },
                },
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="杠杆率">
            <Statistic
              value={metrics.leverage}
              precision={2}
              valueStyle={{ color: metrics.leverage > metrics.leverageLimit * 0.8 ? '#cf1322' : '#3f8600' }}
              suffix={`x / ${metrics.leverageLimit}x`}
            />
            <Progress
              percent={Math.round((metrics.leverage / metrics.leverageLimit) * 100)}
              status={metrics.leverage > metrics.leverageLimit * 0.8 ? 'exception' : 'active'}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="风险指标趋势">
            <Line
              data={riskHistory}
              xField="time"
              yField="var"
              seriesField="type"
              smooth
              point={{
                size: 2,
                shape: 'circle',
              }}
              yAxis={{
                label: {
                  formatter: (v: string) => `¥${parseInt(v).toLocaleString()}`,
                },
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="持仓集中度">
            <Statistic
              title="最大单一持仓比例"
              value={metrics.concentration * 100}
              precision={1}
              valueStyle={{ color: metrics.concentration > metrics.concentrationLimit * 0.8 ? '#cf1322' : '#3f8600' }}
              suffix="%"
            />
            <Progress
              percent={Math.round((metrics.concentration / metrics.concentrationLimit) * 100)}
              status={metrics.concentration > metrics.concentrationLimit * 0.8 ? 'exception' : 'active'}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="风险预警记录">
        <Table
          columns={alertColumns}
          dataSource={alerts}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showQuickJumper: true,
          }}
        />
      </Card>
    </Space>
  );
};

export default RiskMonitor; 
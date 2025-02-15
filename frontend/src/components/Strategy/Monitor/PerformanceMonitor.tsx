import React, { useEffect, useRef } from 'react';
import { Card, Alert, Progress, Space, Statistic, Row, Col, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts';
import styled from 'styled-components';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { formatNumber, formatPercent } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 300px;
  margin: 16px 0;
`;

interface MonitorMetrics {
  equity: number;
  equityChange: number;
  dailyPnL: number;
  openPositions: number;
  marginUsage: number;
  marginLevel: number;
  unrealizedPnL: number;
  realizedPnL: number;
  drawdown: number;
  riskLevel: 'low' | 'medium' | 'high';
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
  }>;
  equityHistory: Array<[number, number]>;
  pnlHistory: Array<[number, number]>;
}

interface PerformanceMonitorProps {
  metrics: MonitorMetrics;
  onAlert?: (alert: any) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  onAlert,
}) => {
  const { t } = useTranslation();
  const equityChartRef = useRef<HTMLDivElement>(null);
  const pnlChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (equityChartRef.current && metrics.equityHistory.length > 0) {
      const chart = echarts.init(equityChartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const [time, value] = params[0].data;
            return `${new Date(time).toLocaleString()}<br/>
                    ${t('monitor.equity')}: ${formatNumber(value)}`;
          }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'time',
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => formatNumber(value)
          }
        },
        series: [{
          data: metrics.equityHistory,
          type: 'line',
          smooth: true,
          areaStyle: {},
        }]
      });
    }
  }, [metrics.equityHistory]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {metrics.alerts.map((alert, index) => (
        <Alert
          key={index}
          message={alert.message}
          type={alert.type}
          showIcon
          closable
        />
      ))}

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('monitor.equity')}
              value={metrics.equity}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: metrics.equityChange >= 0 ? '#3f8600' : '#cf1322' }}
              suffix={
                <Tag color={metrics.equityChange >= 0 ? 'success' : 'error'}>
                  {formatPercent(metrics.equityChange)}
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('monitor.dailyPnL')}
              value={metrics.dailyPnL}
              precision={2}
              prefix={metrics.dailyPnL >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: metrics.dailyPnL >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('monitor.marginUsage')}
              value={metrics.marginUsage}
              suffix="%"
              prefix={<WarningOutlined />}
              valueStyle={{ 
                color: metrics.marginUsage > 80 ? '#cf1322' : 
                       metrics.marginUsage > 50 ? '#faad14' : '#3f8600'
              }}
            />
            <Progress 
              percent={metrics.marginUsage} 
              showInfo={false}
              status={
                metrics.marginUsage > 80 ? 'exception' :
                metrics.marginUsage > 50 ? 'normal' : 'success'
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('monitor.drawdown')}
              value={Math.abs(metrics.drawdown)}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title={t('monitor.equityCurve')}>
        <ChartContainer ref={equityChartRef} />
      </Card>
    </Space>
  );
};

export default PerformanceMonitor; 
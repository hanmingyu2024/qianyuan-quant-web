import React from 'react';
import { Card, Row, Col, Statistic, Alert, Space, Badge, Timeline, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent, formatTime } from '@/utils/formatter';

const StyledCard = styled(Card)`
  .monitor-chart {
    height: 200px;
    margin: 16px 0;
  }
  
  .alert-badge {
    .ant-badge-status-dot {
      width: 8px;
      height: 8px;
    }
  }
`;

interface AlertMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

interface StrategyStatus {
  running: boolean;
  lastUpdate: number;
  position: {
    symbol: string;
    size: number;
    entryPrice: number;
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
  };
  performance: {
    todayReturn: number;
    todayTrades: number;
    balance: number;
    equity: number;
  };
  riskMetrics: {
    leverage: number;
    marginLevel: number;
    drawdown: number;
  };
  alerts: AlertMessage[];
}

interface RealTimeMonitorProps {
  status: StrategyStatus;
  onAcknowledge: (alertId: string) => void;
  onStop: () => void;
}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  status,
  onAcknowledge,
  onStop,
}) => {
  const { t } = useTranslation();
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    // 实现实时权益曲线图表配置...

    return () => {
      chart.dispose();
    };
  }, [status]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error': return <StopOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Badge
              status={status.running ? 'success' : 'error'}
              text={status.running ? '运行中' : '已停止'}
              className="alert-badge"
            />
            <div style={{ marginTop: 8 }}>
              最后更新: {formatTime(status.lastUpdate)}
            </div>
            {status.running && (
              <Button
                danger
                type="primary"
                icon={<StopOutlined />}
                onClick={onStop}
                style={{ marginTop: 16 }}
              >
                停止策略
              </Button>
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日收益"
              value={status.performance.todayReturn}
              precision={2}
              suffix="%"
              valueStyle={{ color: status.performance.todayReturn >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <div>交易次数: {status.performance.todayTrades}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="账户权益"
              value={status.performance.equity}
              precision={2}
              prefix="$"
            />
            <div>可用余额: ${formatNumber(status.performance.balance, 2)}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Alert
              type={status.riskMetrics.drawdown > 10 ? 'warning' : 'info'}
              message={
                <Space direction="vertical">
                  <div>当前回撤: {formatPercent(status.riskMetrics.drawdown)}</div>
                  <div>杠杆率: {formatNumber(status.riskMetrics.leverage, 2)}x</div>
                  <div>保证金率: {formatPercent(status.riskMetrics.marginLevel)}</div>
                </Space>
              }
              showIcon
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <StyledCard title="实时权益">
            <div className="monitor-chart" ref={chartRef} />
          </StyledCard>
        </Col>
        <Col span={8}>
          <Card title="告警消息" extra={<AlertOutlined />}>
            <Timeline>
              {status.alerts.map(alert => (
                <Timeline.Item
                  key={alert.id}
                  dot={getAlertIcon(alert.type)}
                  color={alert.type === 'success' ? 'green' : alert.type === 'warning' ? 'orange' : 'red'}
                >
                  <Space direction="vertical">
                    <div>
                      <strong>{alert.title}</strong>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {formatTime(alert.timestamp)}
                      </div>
                    </div>
                    <div>{alert.message}</div>
                    {!alert.acknowledged && (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        确认
                      </Button>
                    )}
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {status.position.size !== 0 && (
        <Card title="当前持仓">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="交易对"
                value={status.position.symbol}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="持仓量"
                value={status.position.size}
                precision={4}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="入场价格"
                value={status.position.entryPrice}
                precision={2}
                prefix="$"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="未实现盈亏"
                value={status.position.unrealizedPnlPercent}
                precision={2}
                suffix="%"
                prefix={status.position.unrealizedPnl >= 0 ? '+' : '-'}
                valueStyle={{ color: status.position.unrealizedPnl >= 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Col>
          </Row>
        </Card>
      )}
    </Space>
  );
};

export default RealTimeMonitor; 
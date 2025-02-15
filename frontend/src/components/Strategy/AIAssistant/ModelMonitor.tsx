import React from 'react';
import { Card, Row, Col, Statistic, Progress, Timeline, Alert, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { LineChartOutlined, ClockCircleOutlined, ApiOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatTime } from '@/utils/formatter';

const StyledCard = styled(Card)`
  .ant-timeline {
    margin-top: 16px;
  }
`;

const ChartContainer = styled.div`
  height: 300px;
  margin: 16px 0;
`;

interface ModelMetrics {
  accuracy: number;
  latency: number;
  memory: number;
  requests: number;
  errors: number;
  uptime: number;
}

interface ModelEvent {
  time: string;
  type: 'info' | 'warning' | 'error';
  message: string;
}

interface ModelMonitorProps {
  metrics: ModelMetrics;
  events: ModelEvent[];
  history: Array<{
    time: string;
    accuracy: number;
    latency: number;
  }>;
}

const ModelMonitor: React.FC<ModelMonitorProps> = ({
  metrics,
  events,
  history,
}) => {
  const { t } = useTranslation();
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['Accuracy', 'Latency'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: history.map(item => item.time),
      },
      yAxis: [
        {
          type: 'value',
          name: 'Accuracy (%)',
          min: 0,
          max: 100,
        },
        {
          type: 'value',
          name: 'Latency (ms)',
          min: 0,
        },
      ],
      series: [
        {
          name: 'Accuracy',
          type: 'line',
          data: history.map(item => item.accuracy),
          yAxisIndex: 0,
          smooth: true,
        },
        {
          name: 'Latency',
          type: 'line',
          data: history.map(item => item.latency),
          yAxisIndex: 1,
          smooth: true,
        },
      ],
    };

    chartInstance.current.setOption(option);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [history]);

  return (
    <StyledCard title={t('ai.monitor.title')}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('ai.monitor.accuracy')}
              value={metrics.accuracy}
              suffix="%"
              prefix={<LineChartOutlined />}
            />
            <Progress
              percent={metrics.accuracy}
              status={metrics.accuracy >= 90 ? 'success' : 'normal'}
              showInfo={false}
              strokeWidth={4}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('ai.monitor.latency')}
              value={metrics.latency}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
            />
            <Progress
              percent={Math.min((metrics.latency / 1000) * 100, 100)}
              status={metrics.latency <= 500 ? 'success' : 'exception'}
              showInfo={false}
              strokeWidth={4}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('ai.monitor.requests')}
              value={metrics.requests}
              prefix={<ApiOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <Tag color="red">{metrics.errors} errors</Tag>
                <Tag color="green">{formatTime(metrics.uptime)} uptime</Tag>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <ChartContainer ref={chartRef} />

      <Timeline>
        {events.map((event, index) => (
          <Timeline.Item
            key={index}
            color={
              event.type === 'error' ? 'red' :
              event.type === 'warning' ? 'orange' : 'blue'
            }
          >
            <Alert
              message={event.message}
              type={event.type}
              showIcon
              style={{ marginBottom: 0 }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {formatTime(event.time)}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </StyledCard>
  );
};

export default ModelMonitor; 
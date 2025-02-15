import * as React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  TrendingUpOutlined,
  WarningOutlined,
  DollarOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent, formatDate } from '@/utils/formatter';

const StyledCard = styled(Card)`
  .performance-chart {
    height: 300px;
    margin: 16px 0;
  }
`;

interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  trades: number;
  dailyStats: Array<{
    date: string;
    return: number;
    drawdown: number;
    trades: number;
    pnl: number;
  }>;
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics,
}) => {
  const { t } = useTranslation();
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['累计收益', '回撤'],
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: metrics.dailyStats.map(d => d.date),
      },
      yAxis: [
        {
          type: 'value',
          name: '收益率',
          axisLabel: {
            formatter: '{value}%',
          },
        },
        {
          type: 'value',
          name: '回撤',
          axisLabel: {
            formatter: '{value}%',
          },
          inverse: true,
        },
      ],
      series: [
        {
          name: '累计收益',
          type: 'line',
          data: metrics.dailyStats.map(d => d.return),
          smooth: true,
          areaStyle: {
            opacity: 0.1,
          },
        },
        {
          name: '回撤',
          type: 'line',
          yAxisIndex: 1,
          data: metrics.dailyStats.map(d => d.drawdown),
          smooth: true,
          areaStyle: {
            opacity: 0.1,
          },
          itemStyle: {
            color: '#ff4d4f',
          },
        },
      ],
    };

    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [metrics]);

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: '收益率',
      dataIndex: 'return',
      key: 'return',
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a: any, b: any) => a.return - b.return,
    },
    {
      title: '回撤',
      dataIndex: 'drawdown',
      key: 'drawdown',
      render: (value: number) => (
        <span style={{ color: '#ff4d4f' }}>
          {formatPercent(Math.abs(value))}
        </span>
      ),
    },
    {
      title: '交易次数',
      dataIndex: 'trades',
      key: 'trades',
    },
    {
      title: '盈亏',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatNumber(value, 2)}
        </span>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收益率"
              value={metrics.totalReturn}
              precision={2}
              suffix="%"
              prefix={<TrendingUpOutlined />}
              valueStyle={{ color: metrics.totalReturn >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <Progress
              percent={Math.min(Math.abs(metrics.totalReturn), 100)}
              status={metrics.totalReturn >= 0 ? 'success' : 'exception'}
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="夏普比率"
              value={metrics.sharpeRatio}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: metrics.sharpeRatio >= 1 ? '#52c41a' : '#faad14' }}
            />
            <Progress
              percent={Math.min(metrics.sharpeRatio * 50, 100)}
              status={metrics.sharpeRatio >= 1 ? 'success' : 'normal'}
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最大回撤"
              value={Math.abs(metrics.maxDrawdown)}
              precision={2}
              suffix="%"
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress
              percent={Math.min(Math.abs(metrics.maxDrawdown), 100)}
              status="exception"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="胜率"
              value={metrics.winRate}
              precision={2}
              suffix="%"
              prefix={<FieldTimeOutlined />}
            />
            <Progress
              percent={metrics.winRate}
              status={metrics.winRate >= 50 ? 'success' : 'normal'}
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>

      <StyledCard title="收益曲线">
        <div className="performance-chart" ref={chartRef} />
      </StyledCard>

      <Card title="每日统计">
        <Table
          dataSource={metrics.dailyStats}
          columns={columns}
          rowKey="date"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>
    </Space>
  );
};

export default PerformanceDashboard; 
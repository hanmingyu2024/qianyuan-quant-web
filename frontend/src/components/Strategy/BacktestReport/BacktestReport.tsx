import React from 'react';
import { Card, Row, Col, Statistic, Table, Space, Tabs, Tag, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts';
import styled from 'styled-components';
import {
  TrendingUpOutlined,
  FallOutlined,
  RiseOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { formatNumber, formatPercent, formatTime } from '@/utils/formatter';

const { TabPane } = Tabs;

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

interface Trade {
  timestamp: number;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  holdingPeriod: number;
  fees: number;
}

interface BacktestResult {
  metrics: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    averageTrade: number;
    averageWin: number;
    averageLoss: number;
    bestTrade: number;
    worstTrade: number;
    averageHoldingTime: number;
    alpha: number;
    beta: number;
    sortino: number;
    calmar: number;
  };
  trades: Trade[];
  equity: Array<[number, number]>;
  drawdown: Array<[number, number]>;
  monthlyReturns: Record<string, number>;
}

interface BacktestReportProps {
  result: BacktestResult;
}

const BacktestReport: React.FC<BacktestReportProps> = ({
  result,
}) => {
  const { t } = useTranslation();
  const equityChartRef = React.useRef<HTMLDivElement>(null);
  const drawdownChartRef = React.useRef<HTMLDivElement>(null);
  const monthlyChartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!equityChartRef.current || !drawdownChartRef.current || !monthlyChartRef.current) return;

    // 初始化权益曲线图表
    const equityChart = echarts.init(equityChartRef.current);
    const equityOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const time = formatTime(params[0].data[0]);
          return `${time}<br/>${t('strategy.backtest.equity')}: ${formatNumber(params[0].data[1], 2)}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: t('strategy.backtest.equity'),
        axisLabel: {
          formatter: (value: number) => formatNumber(value, 2),
        },
      },
      series: [
        {
          name: t('strategy.backtest.equity'),
          type: 'line',
          data: result.equity,
          smooth: true,
          areaStyle: {
            opacity: 0.1,
          },
        },
      ],
    };
    equityChart.setOption(equityOption);

    // 初始化回撤图表
    const drawdownChart = echarts.init(drawdownChartRef.current);
    const drawdownOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const time = formatTime(params[0].data[0]);
          return `${time}<br/>${t('strategy.backtest.drawdown')}: ${formatPercent(Math.abs(params[0].data[1]))}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: t('strategy.backtest.drawdown'),
        inverse: true,
        axisLabel: {
          formatter: (value: number) => formatPercent(Math.abs(value)),
        },
      },
      series: [
        {
          name: t('strategy.backtest.drawdown'),
          type: 'line',
          data: result.drawdown,
          smooth: true,
          areaStyle: {
            opacity: 0.1,
            color: '#ff4d4f',
          },
          itemStyle: {
            color: '#ff4d4f',
          },
        },
      ],
    };
    drawdownChart.setOption(drawdownOption);

    // 初始化月度收益热力图
    const monthlyChart = echarts.init(monthlyChartRef.current);
    const monthlyData = Object.entries(result.monthlyReturns).map(([date, value]) => {
      const [year, month] = date.split('-');
      return [year, parseInt(month) - 1, value];
    });
    const monthlyOption = {
      tooltip: {
        formatter: (params: any) => {
          const date = new Date(params.data[0], params.data[1]);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}<br/>${t('strategy.backtest.return')}: ${formatPercent(params.data[2])}`;
        },
      },
      visualMap: {
        min: Math.min(...Object.values(result.monthlyReturns)),
        max: Math.max(...Object.values(result.monthlyReturns)),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 20,
        inRange: {
          color: ['#ff4d4f', '#ffffff', '#52c41a'],
        },
      },
      calendar: {
        top: 50,
        left: 30,
        right: 30,
        cellSize: ['auto', 20],
        range: monthlyData.map(item => item[0]),
        itemStyle: {
          borderWidth: 0.5,
        },
        yearLabel: { show: true },
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: monthlyData,
      },
    };
    monthlyChart.setOption(monthlyOption);

    return () => {
      equityChart.dispose();
      drawdownChart.dispose();
      monthlyChart.dispose();
    };
  }, [result, t]);

  const tradeColumns = [
    {
      title: t('strategy.backtest.time'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (value: number) => formatTime(value),
    },
    {
      title: t('strategy.backtest.type'),
      dataIndex: 'type',
      key: 'type',
      render: (value: string) => (
        <Tag color={value === 'buy' ? '#52c41a' : '#ff4d4f'}>
          {t(`strategy.backtest.${value}`)}
        </Tag>
      ),
    },
    {
      title: t('strategy.backtest.price'),
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => formatNumber(value, 2),
    },
    {
      title: t('strategy.backtest.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number) => formatNumber(value, 4),
    },
    {
      title: t('strategy.backtest.pnl'),
      dataIndex: 'pnl',
      key: 'pnl',
      render: (value: number, record: Trade) => (
        <Space>
          <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {formatNumber(value, 2)}
          </span>
          <span>({formatPercent(record.pnlPercent)})</span>
        </Space>
      ),
      sorter: (a: Trade, b: Trade) => a.pnl - b.pnl,
    },
    {
      title: t('strategy.backtest.holdingTime'),
      dataIndex: 'holdingPeriod',
      key: 'holdingPeriod',
      render: (value: number) => `${value}m`,
    },
    {
      title: t('strategy.backtest.fees'),
      dataIndex: 'fees',
      key: 'fees',
      render: (value: number) => formatNumber(value, 4),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('strategy.backtest.totalReturn')}
              value={result.metrics.totalReturn}
              precision={2}
              suffix="%"
              prefix={<TrendingUpOutlined />}
              valueStyle={{ color: result.metrics.totalReturn >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('strategy.backtest.sharpeRatio')}
              value={result.metrics.sharpeRatio}
              precision={2}
              prefix={<RiseOutlined />}
              valueStyle={{ color: result.metrics.sharpeRatio >= 1 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('strategy.backtest.maxDrawdown')}
              value={Math.abs(result.metrics.maxDrawdown)}
              precision={2}
              suffix="%"
              prefix={<FallOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('strategy.backtest.winRate')}
              value={result.metrics.winRate}
              precision={2}
              suffix="%"
              prefix={<FieldTimeOutlined />}
              valueStyle={{ color: result.metrics.winRate >= 50 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="equity">
          <TabPane tab={t('strategy.backtest.equityCurve')} key="equity">
            <ChartContainer ref={equityChartRef} />
          </TabPane>
          <TabPane tab={t('strategy.backtest.drawdownCurve')} key="drawdown">
            <ChartContainer ref={drawdownChartRef} />
          </TabPane>
          <TabPane tab={t('strategy.backtest.monthlyReturns')} key="monthly">
            <ChartContainer ref={monthlyChartRef} />
          </TabPane>
        </Tabs>
      </Card>

      <Card title={t('strategy.backtest.trades')}>
        <Table
          dataSource={result.trades}
          columns={tradeColumns}
          rowKey={(record, index) => index.toString()}
          scroll={{ x: true }}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  );
};

export default BacktestReport; 
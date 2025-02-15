import * as React from 'react';
import { Card, Tabs, Row, Col, Statistic, Table, Divider, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent, formatTime } from '@/utils/formatter';
import { DownloadOutlined } from '@ant-design/icons';
import EquityChart from './EquityChart';
import TradeAnalysis from './TradeAnalysis';
import PositionAnalysis from './PositionAnalysis';
import RiskAnalysis from './RiskAnalysis';

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface Trade {
  id: string;
  time: string;
  symbol: string;
  direction: 'buy' | 'sell';
  type: 'open' | 'close';
  price: number;
  amount: number;
  profit: number;
  commission: number;
}

interface BacktestResult {
  summary: {
    startTime: string;
    endTime: string;
    initialCapital: number;
    finalCapital: number;
    totalReturn: number;
    annualReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    avgHoldingPeriod: number;
  };
  equity: {
    time: string;
    value: number;
    drawdown: number;
    benchmark: number;
  }[];
  trades: {
    time: string;
    symbol: string;
    direction: 'long' | 'short';
    type: 'open' | 'close';
    price: number;
    amount: number;
    pnl: number;
    pnlRate: number;
    holdingPeriod: number;
  }[];
  positions: {
    symbol: string;
    direction: 'long' | 'short';
    avgPrice: number;
    amount: number;
    value: number;
    pnl: number;
    pnlRate: number;
    holdingPeriod: number;
  }[];
  risks: {
    volatility: number;
    beta: number;
    alpha: number;
    informationRatio: number;
    sortino: number;
    calmar: number;
    omega: number;
  };
}

interface BacktestReportProps {
  data: BacktestResult;
  loading?: boolean;
  onExport?: () => void;
}

const BacktestReport: React.FC<BacktestReportProps> = ({ data, loading, onExport }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const time = formatTime(params[0].data[0]);
          const value = formatNumber(params[0].data[1], 2);
          return `${time}<br/>${params[0].seriesName}: ${value}`;
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
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} USDT',
        },
      },
      series: [
        {
          name: '账户权益',
          type: 'line',
          data: data.equity.map(({ time, value }) => [time, value]),
          areaStyle: {
            opacity: 0.1,
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  const columns: ColumnsType<Trade> = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time) => formatTime(time),
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction, record) => (
        `${direction === 'buy' ? '买入' : '卖出'}${record.type === 'open' ? '开仓' : '平仓'}`
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatNumber(price, 2),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit) => (
        <span style={{ color: profit >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatNumber(profit, 2)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Card
        title="回测报告"
        extra={
          <Button icon={<DownloadOutlined />} onClick={onExport}>
            导出报告
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={6}>
            <StyledCard loading={loading}>
              <Statistic
                title="总收益率"
                value={data.summary.totalReturn}
                precision={2}
                suffix="%"
                valueStyle={{ color: data.summary.totalReturn >= 0 ? '#52c41a' : '#f5222d' }}
              />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard loading={loading}>
              <Statistic
                title="年化收益率"
                value={data.summary.annualReturn}
                precision={2}
                suffix="%"
                valueStyle={{ color: data.summary.annualReturn >= 0 ? '#52c41a' : '#f5222d' }}
              />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard loading={loading}>
              <Statistic
                title="最大回撤"
                value={data.summary.maxDrawdown}
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
                value={data.summary.sharpeRatio}
                precision={2}
                valueStyle={{ color: data.summary.sharpeRatio >= 2 ? '#52c41a' : data.summary.sharpeRatio >= 1 ? '#faad14' : '#f5222d' }}
              />
            </StyledCard>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={6}>
            <StyledCard loading={loading}>
              <Statistic
                title="总交易次数"
                value={data.summary.totalTrades}
                suffix={`胜率 ${formatPercent(data.summary.winRate)}`}
              />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard loading={loading}>
              <Statistic
                title="盈亏比"
                value={data.summary.profitFactor}
                precision={2}
              />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard loading={loading}>
              <Statistic
                title="平均持仓时间"
                value={data.summary.avgHoldingPeriod}
                suffix="分钟"
              />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard loading={loading}>
              <Statistic
                title="最终资金"
                value={data.summary.finalCapital}
                precision={2}
                prefix="$"
              />
            </StyledCard>
          </Col>
        </Row>
        <ChartContainer ref={chartRef} />
      </Card>

      <Card title="交易记录" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={data.trades}
          rowKey="id"
          pagination={{ pageSize: 50 }}
        />
      </Card>

      <Tabs
        items={[
          {
            key: 'equity',
            label: '权益曲线',
            children: <EquityChart data={data.equity} />,
          },
          {
            key: 'trades',
            label: '交易分析',
            children: <TradeAnalysis data={data.trades} />,
          },
          {
            key: 'positions',
            label: '持仓分析',
            children: <PositionAnalysis data={data.positions} />,
          },
          {
            key: 'risks',
            label: '风险分析',
            children: <RiskAnalysis data={data.risks} />,
          },
        ]}
      />
    </>
  );
};

export default BacktestReport; 
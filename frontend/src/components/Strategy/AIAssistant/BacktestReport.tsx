import React from 'react';
import { Card, Tabs, Row, Col, Statistic, Progress, Table, Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent, formatDate } from '@/utils/formatter';

const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  .ant-tabs-content {
    margin-top: 16px;
  }
`;

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
}

interface BacktestResult {
  summary: {
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
  };
  trades: Trade[];
  equity: Array<[number, number]>; // [timestamp, equity]
  drawdown: Array<[number, number]>; // [timestamp, drawdown]
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
  const equityChartInstance = React.useRef<echarts.ECharts>();
  const drawdownChartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!equityChartRef.current || !drawdownChartRef.current) return;

    equityChartInstance.current = echarts.init(equityChartRef.current);
    drawdownChartInstance.current = echarts.init(drawdownChartRef.current);

    const equityOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const [time, value] = params[0].data;
          return `${formatDate(time)}<br/>
            ${t('ai.backtest.equity')}: ${formatNumber(value, 2)}`;
        },
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: t('ai.backtest.equity'),
      },
      series: [{
        data: result.equity,
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.1,
        },
      }],
    };

    const drawdownOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const [time, value] = params[0].data;
          return `${formatDate(time)}<br/>
            ${t('ai.backtest.drawdown')}: ${formatPercent(value)}`;
        },
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: t('ai.backtest.drawdown'),
        inverse: true,
      },
      series: [{
        data: result.drawdown,
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.1,
        },
        itemStyle: {
          color: '#ff4d4f',
        },
      }],
    };

    equityChartInstance.current.setOption(equityOption);
    drawdownChartInstance.current.setOption(drawdownOption);

    return () => {
      equityChartInstance.current?.dispose();
      drawdownChartInstance.current?.dispose();
    };
  }, [result]);

  const tradeColumns = [
    {
      title: t('ai.backtest.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'buy' ? 'green' : 'red'}>
          {type === 'buy' ? t('ai.backtest.buy') : t('ai.backtest.sell')}
        </Tag>
      ),
    },
    {
      title: t('ai.backtest.entryTime'),
      dataIndex: 'entryTime',
      key: 'entryTime',
      render: (time: string) => formatDate(time),
    },
    {
      title: t('ai.backtest.exitTime'),
      dataIndex: 'exitTime',
      key: 'exitTime',
      render: (time: string) => formatDate(time),
    },
    {
      title: t('ai.backtest.entryPrice'),
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      render: (price: number) => formatNumber(price, 2),
    },
    {
      title: t('ai.backtest.exitPrice'),
      dataIndex: 'exitPrice',
      key: 'exitPrice',
      render: (price: number) => formatNumber(price, 2),
    },
    {
      title: t('ai.backtest.pnl'),
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl: number) => (
        <span style={{ color: pnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatNumber(pnl, 2)}
        </span>
      ),
    },
    {
      title: t('ai.backtest.pnlPercent'),
      dataIndex: 'pnlPercent',
      key: 'pnlPercent',
      render: (pnlPercent: number) => (
        <span style={{ color: pnlPercent >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatPercent(pnlPercent)}
        </span>
      ),
    },
  ];

  return (
    <StyledCard title={t('ai.backtest.title')}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title={t('ai.backtest.totalReturn')}
            value={result.summary.totalReturn}
            suffix="%"
            precision={2}
            prefix={<LineChartOutlined />}
            valueStyle={{ color: result.summary.totalReturn >= 0 ? '#52c41a' : '#ff4d4f' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('ai.backtest.sharpeRatio')}
            value={result.summary.sharpeRatio}
            precision={2}
            prefix={<RiseOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('ai.backtest.maxDrawdown')}
            value={result.summary.maxDrawdown}
            suffix="%"
            precision={2}
            prefix={<FallOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('ai.backtest.profitFactor')}
            value={result.summary.profitFactor}
            precision={2}
            prefix={<DollarOutlined />}
          />
        </Col>
      </Row>

      <Tabs defaultActiveKey="equity">
        <TabPane tab={t('ai.backtest.equityCurve')} key="equity">
          <ChartContainer ref={equityChartRef} />
        </TabPane>
        <TabPane tab={t('ai.backtest.drawdownCurve')} key="drawdown">
          <ChartContainer ref={drawdownChartRef} />
        </TabPane>
        <TabPane tab={t('ai.backtest.trades')} key="trades">
          <Table
            dataSource={result.trades}
            columns={tradeColumns}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </TabPane>
      </Tabs>
    </StyledCard>
  );
};

export default BacktestReport; 
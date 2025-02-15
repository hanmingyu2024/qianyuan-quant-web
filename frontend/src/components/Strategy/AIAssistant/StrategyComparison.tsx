import * as React from 'react';
import { Card, Table, Space, Tag, Progress, Radio, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { formatNumber, formatPercent, formatTime as formatDate } from '@/utils/formatter';
import type { ColumnType } from 'antd/es/table';

const StyledCard = styled(Card)`
  .comparison-chart {
    height: 400px;
    margin: 16px 0;
  }
`;

interface StrategyMetrics {
  id: string;
  name: string;
  parameters: Record<string, any>;
  performance: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    trades: number;
  };
  equity: Array<[number, number]>;
}

interface StrategyComparisonProps {
  strategies: StrategyMetrics[];
}

const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  strategies,
}) => {
  const { t } = useTranslation();
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();
  const [chartType, setChartType] = React.useState<'equity' | 'returns'>('equity');

  React.useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const time = formatDate(params[0].data[0]);
          let result = `${time}<br/>`;
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${formatNumber(param.data[1], 2)}${chartType === 'returns' ? '%' : ''}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: strategies.map(s => s.name),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: chartType === 'equity' ? 'Equity' : 'Returns (%)',
        axisLabel: {
          formatter: (value: number) => chartType === 'returns' ? `${value}%` : value,
        },
      },
      series: strategies.map(strategy => ({
        name: strategy.name,
        type: 'line',
        data: strategy.equity,
        smooth: true,
        showSymbol: false,
        areaStyle: {
          opacity: 0.1,
        },
      })),
    };

    chartInstance.current.setOption(option);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [strategies, chartType]);

  const columns: ColumnType<StrategyMetrics>[] = [
    {
      title: t('ai.comparison.strategy'),
      dataIndex: 'name',
      key: 'name',
      fixed: true as const,
      width: 200,
    },
    {
      title: t('ai.comparison.return'),
      dataIndex: ['performance', 'totalReturn'],
      key: 'return',
      render: (value: number) => (
        <Space>
          <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {formatPercent(value)}
          </span>
          <Progress
            percent={Math.min(Math.abs(value), 100)}
            size="small"
            showInfo={false}
            strokeColor={value >= 0 ? '#52c41a' : '#ff4d4f'}
          />
        </Space>
      ),
      sorter: (a: StrategyMetrics, b: StrategyMetrics) =>
        a.performance.totalReturn - b.performance.totalReturn,
    },
    {
      title: t('ai.comparison.sharpe'),
      dataIndex: ['performance', 'sharpeRatio'],
      key: 'sharpe',
      render: (value: number) => (
        <Tag color={value >= 1 ? 'success' : value >= 0 ? 'warning' : 'error'}>
          {formatNumber(value, 2)}
        </Tag>
      ),
      sorter: (a: StrategyMetrics, b: StrategyMetrics) =>
        a.performance.sharpeRatio - b.performance.sharpeRatio,
    },
    {
      title: t('ai.comparison.drawdown'),
      dataIndex: ['performance', 'maxDrawdown'],
      key: 'drawdown',
      render: (value: number) => (
        <span style={{ color: '#ff4d4f' }}>
          {formatPercent(Math.abs(value))}
        </span>
      ),
      sorter: (a: StrategyMetrics, b: StrategyMetrics) =>
        Math.abs(a.performance.maxDrawdown) - Math.abs(b.performance.maxDrawdown),
    },
    {
      title: t('ai.comparison.winRate'),
      dataIndex: ['performance', 'winRate'],
      key: 'winRate',
      render: (value: number) => (
        <Space>
          <span>{formatPercent(value)}</span>
          <Progress
            percent={value}
            size="small"
            showInfo={false}
            strokeColor={value >= 50 ? '#52c41a' : '#faad14'}
          />
        </Space>
      ),
      sorter: (a: StrategyMetrics, b: StrategyMetrics) =>
        a.performance.winRate - b.performance.winRate,
    },
    {
      title: t('ai.comparison.trades'),
      dataIndex: ['performance', 'trades'],
      key: 'trades',
      render: (value: number) => formatNumber(value, 0),
      sorter: (a: StrategyMetrics, b: StrategyMetrics) =>
        a.performance.trades - b.performance.trades,
    },
    {
      title: t('ai.comparison.parameters'),
      dataIndex: 'parameters',
      key: 'parameters',
      render: (params: Record<string, any>) => (
        <Space wrap>
          {Object.entries(params).map(([key, value]) => (
            <Tooltip key={key} title={key}>
              <Tag>{`${key}: ${value}`}</Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <StyledCard
      title={t('ai.comparison.title')}
      extra={
        <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
          <Radio.Button value="equity">{t('ai.comparison.equity')}</Radio.Button>
          <Radio.Button value="returns">{t('ai.comparison.returns')}</Radio.Button>
        </Radio.Group>
      }
    >
      <div className="comparison-chart" ref={chartRef} />
      
      <Table
        dataSource={strategies}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={false}
      />
    </StyledCard>
  );
};

export default StrategyComparison; 
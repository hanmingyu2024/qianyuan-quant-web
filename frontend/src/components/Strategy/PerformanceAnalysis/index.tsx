import React from 'react';
import { Card, Row, Col, Statistic, Divider, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent, formatTime } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

interface MonthlyPerformance {
  month: string;
  return: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
}

interface PerformanceData {
  summary: {
    totalReturn: number;
    annualReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    volatility: number;
    beta: number;
    alpha: number;
    informationRatio: number;
    sortino: number;
    calmar: number;
    winRate: number;
    profitFactor: number;
    recoveryFactor: number;
    trades: number;
  };
  monthly: MonthlyPerformance[];
  returns: {
    time: string;
    value: number;
  }[];
}

interface PerformanceAnalysisProps {
  data: PerformanceData;
}

const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ data }) => {
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
          return `${time}<br/>${params[0].seriesName}: ${value}%`;
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
          formatter: '{value}%',
        },
      },
      series: [
        {
          name: '累计收益',
          type: 'line',
          data: data.returns.map(({ time, value }) => [time, value * 100]),
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

  const columns: ColumnsType<MonthlyPerformance> = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: '收益率',
      dataIndex: 'return',
      key: 'return',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a, b) => a.return - b.return,
    },
    {
      title: '夏普比率',
      dataIndex: 'sharpeRatio',
      key: 'sharpeRatio',
      render: (value) => formatNumber(value, 2),
      sorter: (a, b) => a.sharpeRatio - b.sharpeRatio,
    },
    {
      title: '最大回撤',
      dataIndex: 'maxDrawdown',
      key: 'maxDrawdown',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.maxDrawdown - b.maxDrawdown,
    },
    {
      title: '胜率',
      dataIndex: 'winRate',
      key: 'winRate',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.winRate - b.winRate,
    },
    {
      title: '交易次数',
      dataIndex: 'trades',
      key: 'trades',
      sorter: (a, b) => a.trades - b.trades,
    },
  ];

  return (
    <>
      <Card title="绩效概览">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="总收益率"
              value={data.summary.totalReturn}
              precision={2}
              suffix="%"
              valueStyle={{ color: data.summary.totalReturn >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="年化收益率"
              value={data.summary.annualReturn}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="最大回撤"
              value={data.summary.maxDrawdown}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="夏普比率"
              value={data.summary.sharpeRatio}
              precision={2}
            />
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="波动率"
              value={data.summary.volatility}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Beta"
              value={data.summary.beta}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Alpha"
              value={data.summary.alpha}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="信息比率"
              value={data.summary.informationRatio}
              precision={2}
            />
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Sortino比率"
              value={data.summary.sortino}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Calmar比率"
              value={data.summary.calmar}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="胜率"
              value={data.summary.winRate}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="盈亏比"
              value={data.summary.profitFactor}
              precision={2}
            />
          </Col>
        </Row>
        <ChartContainer ref={chartRef} />
      </Card>

      <Card title="月度绩效" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={data.monthly}
          rowKey="month"
          pagination={false}
        />
      </Card>
    </>
  );
};

export default PerformanceAnalysis; 
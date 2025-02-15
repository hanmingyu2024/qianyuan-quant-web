import React from 'react';
import { Card, Table, Select, Button, Space, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { Option } = Select;

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

interface Strategy {
  id: string;
  name: string;
  performance: {
    totalReturn: number;
    annualReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
    trades: number;
  };
  equity: {
    time: number;
    value: number;
  }[];
}

interface ComparisonProps {
  strategies: Strategy[];
  onStrategySelect: (ids: string[]) => void;
}

const Comparison: React.FC<ComparisonProps> = ({
  strategies,
  onStrategySelect,
}) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current || !strategies.length) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: strategies.map((s) => s.name),
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
      series: strategies.map((strategy) => ({
        name: strategy.name,
        type: 'line',
        data: strategy.equity.map(({ time, value }) => [time, value]),
      })),
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
  }, [strategies]);

  const columns: ColumnsType<Strategy> = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '总收益率',
      dataIndex: ['performance', 'totalReturn'],
      key: 'totalReturn',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.totalReturn - b.performance.totalReturn,
    },
    {
      title: '年化收益率',
      dataIndex: ['performance', 'annualReturn'],
      key: 'annualReturn',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.annualReturn - b.performance.annualReturn,
    },
    {
      title: '最大回撤',
      dataIndex: ['performance', 'maxDrawdown'],
      key: 'maxDrawdown',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.maxDrawdown - b.performance.maxDrawdown,
    },
    {
      title: '夏普比率',
      dataIndex: ['performance', 'sharpeRatio'],
      key: 'sharpeRatio',
      render: (value) => formatNumber(value, 2),
      sorter: (a, b) => a.performance.sharpeRatio - b.performance.sharpeRatio,
    },
    {
      title: '胜率',
      dataIndex: ['performance', 'winRate'],
      key: 'winRate',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.performance.winRate - b.performance.winRate,
    },
  ];

  return (
    <Card title="策略对比">
      {strategies.length ? (
        <>
          <Table
            columns={columns}
            dataSource={strategies}
            rowKey="id"
            pagination={false}
          />
          <ChartContainer ref={chartRef} />
        </>
      ) : (
        <Empty description="请选择要对比的策略" />
      )}
    </Card>
  );
};

export default Comparison; 
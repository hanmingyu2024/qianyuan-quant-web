import React from 'react';
import { Card, Row, Col, Statistic, Divider } from 'antd';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 400px;
  margin-top: 16px;
`;

interface PerformanceData {
  totalReturn: number;
  annualReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  winRate: number;
  profitFactor: number;
  trades: {
    total: number;
    profitable: number;
    unprofitable: number;
    avgProfit: number;
    avgLoss: number;
  };
  monthly: {
    time: string;
    return: number;
  }[];
}

interface PerformanceProps {
  data: PerformanceData;
}

const Performance: React.FC<PerformanceProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.monthly.map(item => item.time),
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%',
        },
      },
      series: [
        {
          name: '月度收益',
          type: 'bar',
          data: data.monthly.map(item => ({
            value: item.return,
            itemStyle: {
              color: item.return >= 0 ? '#52c41a' : '#f5222d',
            },
          })),
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

  return (
    <>
      <Card title="策略绩效">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="总收益率"
              value={data.totalReturn}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="年化收益率"
              value={data.annualReturn}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="最大回撤"
              value={data.maxDrawdown}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="夏普比率"
              value={data.sharpeRatio}
              precision={2}
            />
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="波动率"
              value={data.volatility}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="胜率"
              value={data.winRate}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="盈亏比"
              value={data.profitFactor}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="交易次数"
              value={data.trades.total}
            />
          </Col>
        </Row>
        <Divider />
        <ChartContainer ref={chartRef} />
      </Card>
    </>
  );
};

export default Performance; 
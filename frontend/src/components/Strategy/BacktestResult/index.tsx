import React from 'react';
import { Card, Row, Col, Statistic, Divider } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 400px;
  margin-top: 16px;
`;

interface BacktestResult {
  totalReturn: number;
  annualReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  trades: number;
  equity: {
    time: number;
    value: number;
  }[];
}

interface BacktestResultProps {
  data: BacktestResult;
}

const BacktestResult: React.FC<BacktestResultProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
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

  return (
    <Card title="回测结果">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="总收益率"
            value={data.totalReturn}
            precision={2}
            valueStyle={{ color: data.totalReturn >= 0 ? '#3f8600' : '#cf1322' }}
            prefix={data.totalReturn >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
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
            valueStyle={{ color: '#cf1322' }}
            suffix="%"
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
            title="胜率"
            value={data.winRate}
            precision={2}
            suffix="%"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="交易次数"
            value={data.trades}
          />
        </Col>
      </Row>
      <ChartContainer ref={chartRef} />
    </Card>
  );
};

export default BacktestResult; 
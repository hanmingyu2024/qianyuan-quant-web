import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const ChartContainer = styled.div`
  height: 600px;
  width: 100%;
`;

export const KlineChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const klineData = useSelector((state: any) => state.market.klineData);

  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: klineData.map(item => item.time)
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        type: 'candlestick',
        data: klineData.map(item => [
          item.open,
          item.close,
          item.low,
          item.high
        ])
      }]
    };
    
    chart.setOption(option);
    
    return () => chart.dispose();
  }, [klineData]);

  return <ReactECharts option={option} style={{ height: '600px' }} />;
}; 
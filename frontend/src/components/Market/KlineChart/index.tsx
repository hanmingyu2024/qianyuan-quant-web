import React, { useEffect, useRef } from 'react';
import { Card, Radio, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';
import * as echarts from 'echarts';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import styled from 'styled-components';

const ChartContainer = styled.div`
  height: 500px;
  width: 100%;
`;

const ToolBar = styled.div`
  padding: 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const KlineChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();
  const klineData = useSelector((state: RootState) => state.market.klineData);
  const [period, setPeriod] = React.useState('1h');

  useEffect(() => {
    if (!chartRef.current) return;
    
    chartInstance.current = echarts.init(chartRef.current);
    
    const option = {
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      xAxis: {
        type: 'category',
        data: klineData.map(item => item.time),
      },
      yAxis: {
        type: 'value',
        scale: true,
      },
      series: [
        {
          type: 'candlestick',
          data: klineData.map(item => [
            item.open,
            item.close,
            item.low,
            item.high,
          ]),
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          bottom: '5%',
          start: 50,
          end: 100,
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
  }, [klineData]);

  const handlePeriodChange = (e: RadioChangeEvent) => {
    setPeriod(e.target.value);
    // TODO: 触发获取新周期数据的 action
  };

  return (
    <>
      <ToolBar>
        <Radio.Group value={period} onChange={handlePeriodChange}>
          <Space>
            <Radio.Button value="1m">1分钟</Radio.Button>
            <Radio.Button value="5m">5分钟</Radio.Button>
            <Radio.Button value="15m">15分钟</Radio.Button>
            <Radio.Button value="1h">1小时</Radio.Button>
            <Radio.Button value="4h">4小时</Radio.Button>
            <Radio.Button value="1d">日线</Radio.Button>
          </Space>
        </Radio.Group>
      </ToolBar>
      <ChartContainer ref={chartRef} />
    </>
  );
};

export default KlineChart; 
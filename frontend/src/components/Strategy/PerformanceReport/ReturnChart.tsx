import React from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { formatTime, formatPercent } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 400px;
`;

interface ReturnChartProps {
  data: {
    time: string;
    value: number;
    benchmark: number;
  }[];
}

const ReturnChart: React.FC<ReturnChartProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const time = formatTime(params[0].value[0]);
          let html = `${time}<br/>`;
          params.forEach(param => {
            html += `${param.marker} ${param.seriesName}: ${formatPercent(param.value[1])}%<br/>`;
          });
          return html;
        },
      },
      legend: {
        data: ['策略收益', '基准收益'],
        top: 10,
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
        name: '收益率(%)',
        axisLabel: {
          formatter: '{value}%',
        },
      },
      series: [
        {
          name: '策略收益',
          type: 'line',
          data: data.map(item => [item.time, item.value]),
          lineStyle: {
            width: 2,
          },
          areaStyle: {
            opacity: 0.1,
          },
        },
        {
          name: '基准收益',
          type: 'line',
          data: data.map(item => [item.time, item.benchmark]),
          lineStyle: {
            width: 2,
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

  return <ChartContainer ref={chartRef} />;
};

export default ReturnChart; 
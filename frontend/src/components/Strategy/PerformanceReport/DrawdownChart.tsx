import React from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { formatTime, formatPercent } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 400px;
`;

interface DrawdownChartProps {
  data: {
    time: string;
    value: number;
  }[];
}

const DrawdownChart: React.FC<DrawdownChartProps> = ({ data }) => {
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
          return `${time}<br/>${params[0].marker} 回撤: ${formatPercent(params[0].value[1])}%`;
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
        name: '回撤(%)',
        inverse: true,
        axisLabel: {
          formatter: '{value}%',
        },
      },
      series: [
        {
          type: 'line',
          data: data.map(item => [item.time, item.value]),
          lineStyle: {
            width: 2,
            color: '#f5222d',
          },
          areaStyle: {
            color: '#f5222d',
            opacity: 0.1,
          },
        },
      ],
      visualMap: {
        show: false,
        pieces: [
          {
            gt: -5,
            lte: 0,
            color: '#ffa39e',
          },
          {
            gt: -10,
            lte: -5,
            color: '#ff7875',
          },
          {
            lte: -10,
            color: '#f5222d',
          },
        ],
      },
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

export default DrawdownChart; 
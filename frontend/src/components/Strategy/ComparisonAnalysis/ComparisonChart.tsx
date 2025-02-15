import React from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { formatTime, formatPercent } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 400px;
  margin-top: 16px;
`;

interface Strategy {
  id: string;
  name: string;
  returns: {
    time: string;
    value: number;
  }[];
}

interface ComparisonChartProps {
  data: Strategy[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
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
        data: data.map(s => s.name),
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
      series: data.map(strategy => ({
        name: strategy.name,
        type: 'line',
        data: strategy.returns.map(item => [item.time, item.value]),
        showSymbol: false,
        lineStyle: {
          width: 2,
        },
      })),
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          bottom: 10,
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

export default ComparisonChart; 
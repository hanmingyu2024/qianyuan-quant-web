import React from 'react';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { formatTime, formatPercent } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 500px;
`;

interface EquityChartProps {
  data: {
    time: string;
    value: number;
    drawdown: number;
    benchmark: number;
  }[];
}

const EquityChart: React.FC<EquityChartProps> = ({ data }) => {
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
        data: ['策略收益', '基准收益', '回撤'],
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
      yAxis: [
        {
          type: 'value',
          name: '收益率(%)',
          position: 'left',
          axisLabel: {
            formatter: '{value}%',
          },
        },
        {
          type: 'value',
          name: '回撤(%)',
          position: 'right',
          inverse: true,
          axisLabel: {
            formatter: '{value}%',
          },
        },
      ],
      series: [
        {
          name: '策略收益',
          type: 'line',
          data: data.map(item => [item.time, item.value]),
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.1 },
        },
        {
          name: '基准收益',
          type: 'line',
          data: data.map(item => [item.time, item.benchmark]),
          lineStyle: { width: 2 },
        },
        {
          name: '回撤',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(item => [item.time, item.drawdown]),
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

export default EquityChart; 
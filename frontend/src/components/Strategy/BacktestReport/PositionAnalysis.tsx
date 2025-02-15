import React from 'react';
import { Card, Table, Tag, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatNumber, formatPercent } from '@/utils/formatter';
import * as echarts from 'echarts';
import styled from 'styled-components';

const ChartContainer = styled.div`
  height: 400px;
  margin-bottom: 16px;
`;

interface Position {
  symbol: string;
  direction: 'long' | 'short';
  avgPrice: number;
  amount: number;
  value: number;
  pnl: number;
  pnlRate: number;
  holdingPeriod: number;
}

interface PositionAnalysisProps {
  data: Position[];
}

const PositionAnalysis: React.FC<PositionAnalysisProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current) return;

    const totalValue = data.reduce((sum, pos) => sum + Math.abs(pos.value), 0);
    const positionData = data.map(pos => ({
      name: `${pos.symbol} ${pos.direction === 'long' ? '多' : '空'}`,
      value: Math.abs(pos.value),
      percentage: Math.abs(pos.value) / totalValue,
    }));

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>
            持仓金额: $${formatNumber(params.value, 2)}<br/>
            占比: ${formatPercent(params.data.percentage)}`;
        },
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              formatter: '{b}\n{d}%',
            },
          },
          data: positionData,
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

  const columns: ColumnsType<Position> = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction) => (
        <Tag color={direction === 'long' ? 'green' : 'red'}>
          {direction === 'long' ? '多' : '空'}
        </Tag>
      ),
    },
    {
      title: '均价',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
      render: (price) => formatNumber(price, 2),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: '市值',
      dataIndex: 'value',
      key: 'value',
      render: (value) => formatNumber(value, 2),
    },
    {
      title: '盈亏',
      key: 'pnl',
      render: (_, record) => (
        <div>
          <div style={{ color: record.pnl >= 0 ? '#52c41a' : '#f5222d' }}>
            {formatNumber(record.pnl, 2)} USDT
          </div>
          <Progress
            percent={Math.abs(record.pnlRate * 100)}
            size="small"
            status={record.pnl >= 0 ? 'success' : 'exception'}
            format={(percent) => `${formatNumber(percent!, 2)}%`}
          />
        </div>
      ),
    },
    {
      title: '持仓时间',
      dataIndex: 'holdingPeriod',
      key: 'holdingPeriod',
      render: (period) => `${period} 分钟`,
    },
  ];

  return (
    <>
      <ChartContainer ref={chartRef} />
      <Table
        columns={columns}
        dataSource={data}
        rowKey="symbol"
        pagination={false}
        scroll={{ x: true }}
      />
    </>
  );
};

export default PositionAnalysis; 
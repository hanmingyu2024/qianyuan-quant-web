import React from 'react';
import { Card, Table, Tag, DatePicker, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatTime, formatNumber } from '@/utils/formatter';

const { RangePicker } = DatePicker;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

interface Trade {
  id: string;
  time: string;
  symbol: string;
  direction: 'buy' | 'sell';
  type: 'open' | 'close';
  price: number;
  amount: number;
  value: number;
  fee: number;
  profit: number;
  profitRate: number;
}

interface TradeHistoryProps {
  data: Trade[];
  onTimeRangeChange: (range: [number, number]) => void;
  onExport: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({
  data,
  onTimeRangeChange,
  onExport,
  onRefresh,
  loading,
}) => {
  const handleTimeRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      onTimeRangeChange([dates[0].valueOf(), dates[1].valueOf()]);
    }
  };

  const columns: ColumnsType<Trade> = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time) => formatTime(time),
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction, record) => (
        <Tag color={direction === 'buy' ? 'green' : 'red'}>
          {direction === 'buy' ? '买入' : '卖出'}
          {record.type === 'open' ? '开仓' : '平仓'}
        </Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatNumber(price, 2),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: '交易额',
      dataIndex: 'value',
      key: 'value',
      render: (value) => formatNumber(value, 2),
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => formatNumber(fee, 4),
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit) => (
        <span style={{ color: profit >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatNumber(profit, 2)}
        </span>
      ),
    },
    {
      title: '盈亏率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      render: (rate) => (
        <span style={{ color: rate >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatNumber(rate * 100, 2)}%
        </span>
      ),
    },
  ];

  return (
    <Card title="交易记录">
      <ToolBar>
        <RangePicker showTime onChange={handleTimeRangeChange} />
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={onExport}
          >
            导出
          </Button>
        </Space>
      </ToolBar>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          total: data.length,
          pageSize: 50,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        loading={loading}
      />
    </Card>
  );
};

export default TradeHistory; 
import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatPercent } from '@/utils/formatter';

interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
  trades: number;
}

interface MonthlyReturnTableProps {
  data: MonthlyReturn[];
}

const MonthlyReturnTable: React.FC<MonthlyReturnTableProps> = ({ data }) => {
  const columns: ColumnsType<MonthlyReturn> = [
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      render: (month) => `${month}月`,
    },
    {
      title: '收益率',
      dataIndex: 'return',
      key: 'return',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatPercent(value)}
        </span>
      ),
      sorter: (a, b) => a.return - b.return,
    },
    {
      title: '交易次数',
      dataIndex: 'trades',
      key: 'trades',
      sorter: (a, b) => a.trades - b.trades,
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        let color = record.return >= 5 ? 'green' :
                    record.return >= 0 ? 'blue' :
                    record.return >= -5 ? 'gold' : 'red';
        let text = record.return >= 5 ? '优秀' :
                   record.return >= 0 ? '盈利' :
                   record.return >= -5 ? '亏损' : '严重亏损';
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record) => `${record.year}-${record.month}`}
      pagination={false}
      scroll={{ y: 400 }}
    />
  );
};

export default MonthlyReturnTable; 
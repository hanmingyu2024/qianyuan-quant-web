import React from 'react';
import { Table, Tag, Button, Space, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { formatNumber, formatPercent } from '@/utils/formatter';

interface Position {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  amount: number;
  avgPrice: number;
  currentPrice: number;
  profit: number;
  profitRate: number;
  margin: number;
  leverage: number;
  updateTime: string;
}

interface PositionListProps {
  data: Position[];
  loading?: boolean;
  onClose?: (position: Position) => void;
  onAdjustMargin?: (position: Position) => void;
  onAdjustLeverage?: (position: Position) => void;
}

const PositionList: React.FC<PositionListProps> = ({
  data,
  loading,
  onClose,
  onAdjustMargin,
  onAdjustLeverage,
}) => {
  const handleClose = (position: Position) => {
    Modal.confirm({
      title: '平仓确认',
      icon: <ExclamationCircleOutlined />,
      content: `确定要平掉 ${position.symbol} 的${position.direction === 'long' ? '多' : '空'}仓吗？`,
      onOk: () => onClose?.(position),
    });
  };

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
      title: '持仓数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: '开仓均价',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
      render: (price) => formatNumber(price, 2),
    },
    {
      title: '当前价格',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price) => formatNumber(price, 2),
    },
    {
      title: '未实现盈亏',
      key: 'profit',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: record.profit >= 0 ? '#52c41a' : '#f5222d' }}>
            {formatNumber(record.profit, 2)} USDT
          </span>
          <span style={{ color: record.profitRate >= 0 ? '#52c41a' : '#f5222d' }}>
            {formatPercent(record.profitRate)}
          </span>
        </Space>
      ),
    },
    {
      title: '保证金',
      dataIndex: 'margin',
      key: 'margin',
      render: (margin) => `${formatNumber(margin, 2)} USDT`,
    },
    {
      title: '杠杆',
      dataIndex: 'leverage',
      key: 'leverage',
      render: (leverage) => `${leverage}x`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => onAdjustMargin?.(record)}
          >
            调整保证金
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => onAdjustLeverage?.(record)}
          >
            调整杠杆
          </Button>
          <Button
            type="link"
            danger
            size="small"
            onClick={() => handleClose(record)}
          >
            平仓
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: true }}
      summary={(pageData) => {
        const totalProfit = pageData.reduce((sum, pos) => sum + pos.profit, 0);
        const totalMargin = pageData.reduce((sum, pos) => sum + pos.margin, 0);

        return (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5}>
                总计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>
                <span style={{ color: totalProfit >= 0 ? '#52c41a' : '#f5222d' }}>
                  {formatNumber(totalProfit, 2)} USDT
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6}>
                {formatNumber(totalMargin, 2)} USDT
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} colSpan={2} />
            </Table.Summary.Row>
          </Table.Summary>
        );
      }}
    />
  );
};

export default PositionList; 
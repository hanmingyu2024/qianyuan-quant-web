import React from 'react';
import { Table } from 'antd';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const Container = styled.div`
  .ant-table {
    background: transparent;
  }
  .ask-row {
    color: #f5222d;
  }
  .bid-row {
    color: #52c41a;
  }
`;

interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
  percentage: number;
}

const OrderBook: React.FC = () => {
  const { asks, bids } = useSelector((state: RootState) => state.market.orderBook);

  const columns = [
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: '33%',
      render: (price: number) => price.toFixed(2),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      width: '33%',
      render: (amount: number) => amount.toFixed(4),
    },
    {
      title: '累计',
      dataIndex: 'total',
      key: 'total',
      width: '34%',
      render: (total: number) => total.toFixed(4),
    },
  ];

  const processOrderBookData = (data: [number, number][], type: 'ask' | 'bid'): OrderBookItem[] => {
    let total = 0;
    const maxTotal = Math.max(...data.map(([_, amount]) => amount));
    
    return data.map(([price, amount]) => {
      total += amount;
      return {
        price,
        amount,
        total,
        percentage: (total / maxTotal) * 100,
      };
    });
  };

  return (
    <Container>
      <Table
        columns={columns}
        dataSource={processOrderBookData(asks, 'ask')}
        rowKey="price"
        size="small"
        pagination={false}
        rowClassName="ask-row"
      />
      <Table
        columns={columns}
        dataSource={processOrderBookData(bids, 'bid')}
        rowKey="price"
        size="small"
        pagination={false}
        rowClassName="bid-row"
      />
    </Container>
  );
};

export default OrderBook; 
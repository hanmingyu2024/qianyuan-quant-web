import React from 'react'
import { Table, Tag, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

interface Order {
  id: string
  symbol: string
  type: 'limit' | 'market'
  direction: 'buy' | 'sell'
  price: number
  amount: number
  filled: number
  status: 'pending' | 'partial' | 'completed' | 'canceled'
  time: string
}

const OrderList: React.FC = () => {
  const orders = useSelector((state: RootState) => state.trading.orders)

  const columns: ColumnsType<Order> = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'limit' ? 'blue' : 'purple'}>
          {type === 'limit' ? '限价' : '市价'}
        </Tag>
      ),
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction) => (
        <Tag color={direction === 'buy' ? 'green' : 'red'}>
          {direction === 'buy' ? '买入' : '卖出'}
        </Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '已成交',
      dataIndex: 'filled',
      key: 'filled',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'processing', text: '待成交' },
          partial: { color: 'warning', text: '部分成交' },
          completed: { color: 'success', text: '已完成' },
          canceled: { color: 'default', text: '已取消' },
        }
        return (
          <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'completed' || record.status === 'canceled' ? null : (
          <Button type="link" danger size="small">
            撤单
          </Button>
        )
      ),
    },
  ]

  return <Table columns={columns} dataSource={orders} rowKey="id" />
}

export default OrderList 
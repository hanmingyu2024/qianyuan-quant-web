import React from 'react'
import { Table, Tag, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useOrderStore, Order } from '@/store/useOrderStore'

const OrderList: React.FC = () => {
  const { orders, loading, fetchOrders, cancelOrder } = useOrderStore()

  React.useEffect(() => {
    fetchOrders()
    // 设置定时刷新
    const timer = setInterval(fetchOrders, 10000)
    return () => clearInterval(timer)
  }, [fetchOrders])

  const columns: ColumnsType<Order> = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'limit' ? 'blue' : 'green'}>
          {type === 'limit' ? '限价单' : '市价单'}
        </Tag>
      ),
    },
    {
      title: '方向',
      dataIndex: 'side',
      key: 'side',
      render: (side: string) => (
        <Tag color={side === 'buy' ? '#52c41a' : '#ff4d4f'}>
          {side === 'buy' ? '买入' : '卖出'}
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'processing', text: '进行中' },
          filled: { color: 'success', text: '已完成' },
          cancelled: { color: 'default', text: '已取消' },
        }
        const { color, text } = statusMap[status as keyof typeof statusMap]
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <Button
              type="link"
              danger
              onClick={() => cancelOrder(record.id)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return <Table
    columns={columns}
    dataSource={orders}
    loading={loading}
    rowKey="id"
  />
}

export default OrderList 
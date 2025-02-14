import React from 'react'
import { Card, Table, Statistic, Row, Col, Button, Space, Tabs } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useUserStore } from '@/store/useUserStore'
import { useMarketStore } from '@/store/useMarketStore'
import TransferModal from '@/components/Assets/TransferModal'
import styles from './style.module.css'

interface AssetData {
  currency: string
  available: number
  frozen: number
  total: number
  valueInUSDT: number
}

interface TransferRecord {
  id: string
  type: 'deposit' | 'withdraw'
  currency: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  time: string
  txHash?: string
}

const Assets: React.FC = () => {
  const { userInfo } = useUserStore()
  const { marketData } = useMarketStore()
  const [transferType, setTransferType] = React.useState<'deposit' | 'withdraw' | null>(null)

  const calculateAssets = (): AssetData[] => {
    if (!userInfo) return []

    return Object.entries(userInfo.balance).map(([currency, amount]) => {
      const price = currency === 'USDT' ? 1 : marketData[`${currency}/USDT`]?.price || 0
      return {
        currency,
        available: amount,
        frozen: 0, // 从后端获取冻结金额
        total: amount,
        valueInUSDT: amount * price,
      }
    })
  }

  const columns: ColumnsType<AssetData> = [
    {
      title: '币种',
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: '可用',
      dataIndex: 'available',
      key: 'available',
      render: (value) => value.toFixed(8),
    },
    {
      title: '冻结',
      dataIndex: 'frozen',
      key: 'frozen',
      render: (value) => value.toFixed(8),
    },
    {
      title: '总额',
      dataIndex: 'total',
      key: 'total',
      render: (value) => value.toFixed(8),
    },
    {
      title: 'USDT估值',
      dataIndex: 'valueInUSDT',
      key: 'valueInUSDT',
      render: (value) => value.toFixed(2),
    },
  ]

  const transferColumns: ColumnsType<TransferRecord> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type === 'deposit' ? '充值' : '提现',
    },
    {
      title: '币种',
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => value.toFixed(8),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'processing', text: '处理中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '失败' },
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
      title: '交易哈希',
      dataIndex: 'txHash',
      key: 'txHash',
      render: (hash) => hash ? (
        <a href={`https://etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer">
          {hash.slice(0, 8)}...{hash.slice(-6)}
        </a>
      ) : '-',
    },
  ]

  const assets = calculateAssets()
  const totalValue = assets.reduce((sum, asset) => sum + asset.valueInUSDT, 0)

  return (
    <div className={styles.container}>
      <Card className={styles.overview}>
        <Row gutter={24}>
          <Col span={8}>
            <Statistic
              title="总资产估值 (USDT)"
              value={totalValue}
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="24h收益 (USDT)"
              value={0}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="冻结资产 (USDT)"
              value={0}
              precision={2}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title="资产列表"
        className={styles.assetList}
        extra={
          <Space>
            <Button type="primary" onClick={() => setTransferType('deposit')}>
              充值
            </Button>
            <Button onClick={() => setTransferType('withdraw')}>
              提现
            </Button>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'assets',
              label: '资产列表',
              children: (
                <Table
                  columns={columns}
                  dataSource={assets}
                  rowKey="currency"
                  pagination={false}
                />
              ),
            },
            {
              key: 'history',
              label: '充提记录',
              children: (
                <Table
                  columns={transferColumns}
                  dataSource={[]} // TODO: 从后端获取充提记录
                  rowKey="id"
                />
              ),
            },
          ]}
        />
      </Card>

      <TransferModal
        visible={!!transferType}
        type={transferType || 'deposit'}
        onClose={() => setTransferType(null)}
      />
    </div>
  )
}

export default Assets 
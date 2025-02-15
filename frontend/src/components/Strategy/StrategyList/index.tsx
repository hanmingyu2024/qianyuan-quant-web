import React from 'react';
import { Table, Tag, Button, Space, Switch, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, LineChartOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatTime } from '@/utils/formatter';

interface Strategy {
  id: string;
  name: string;
  type: string;
  symbols: string[];
  timeframe: string;
  enabled: boolean;
  status: 'running' | 'stopped' | 'error';
  createdAt: string;
  updatedAt: string;
}

interface StrategyListProps {
  data: Strategy[];
  loading?: boolean;
  onStatusChange: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}

const StrategyList: React.FC<StrategyListProps> = ({
  data,
  loading,
  onStatusChange,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '删除策略',
      content: '确定要删除该策略吗？',
      onOk: () => onDelete(id),
    });
  };

  const columns: ColumnsType<Strategy> = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/strategy/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          trend: '趋势策略',
          grid: '网格策略',
          arbitrage: '套利策略',
          mean_reversion: '均值回归',
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '交易对',
      dataIndex: 'symbols',
      key: 'symbols',
      render: (symbols: string[]) => (
        <>
          {symbols.map((symbol) => (
            <Tag key={symbol}>{symbol}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '时间周期',
      dataIndex: 'timeframe',
      key: 'timeframe',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          running: { text: '运行中', color: 'green' },
          stopped: { text: '已停止', color: 'default' },
          error: { text: '异常', color: 'red' },
        };
        const { text, color } = statusMap[status as keyof typeof statusMap];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled, record) => (
        <Switch
          checked={enabled}
          onChange={(checked) => onStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => formatTime(time),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (time) => formatTime(time),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/strategy/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<LineChartOutlined />}
            onClick={() => navigate(`/strategy/backtest/${record.id}`)}
          >
            回测
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
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
      pagination={{
        total: data.length,
        pageSize: 10,
        showQuickJumper: true,
        showSizeChanger: true,
      }}
    />
  );
};

export default StrategyList; 
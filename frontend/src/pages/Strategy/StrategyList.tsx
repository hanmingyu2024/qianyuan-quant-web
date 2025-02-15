import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Modal, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Strategy } from '../../store/slices/strategySlice';
import { strategyApi } from '@/services';
import StrategyEditor from './StrategyEditor';
import { RootState } from '../../store';

const StrategyList: React.FC = () => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | undefined>();
  const [loading, setLoading] = useState(false);
  const strategies = useSelector((state: RootState) => state.strategy.strategies);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const response = await strategyApi.getStrategies();
      // TODO: 更新 Redux store
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      message.error('获取策略列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await strategyApi.deleteStrategy(id);
      message.success('删除策略成功');
      fetchStrategies();
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      message.error('删除策略失败');
    }
  };

  const handleStartStop = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'active') {
        await strategyApi.stopStrategy(id);
        message.success('停止策略成功');
      } else {
        await strategyApi.startStrategy(id);
        message.success('启动策略成功');
      }
      fetchStrategies();
    } catch (error) {
      console.error('Failed to start/stop strategy:', error);
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          momentum: '动量策略',
          mean_reversion: '均值回归',
          arbitrage: '套利策略',
          custom: '自定义策略',
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'success', text: '运行中' },
          inactive: { color: 'default', text: '已停止' },
          backtest: { color: 'processing', text: '回测中' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Strategy) => (
        <Space size="middle">
          <Button
            type="text"
            icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleStartStop(record.id, record.status)}
          >
            {record.status === 'active' ? '停止' : '启动'}
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedStrategy(record);
              setVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除策略 "${record.name}" 吗？`,
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Card
        title="策略管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedStrategy(undefined);
              setVisible(true);
            }}
          >
            新建策略
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={strategies}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={selectedStrategy ? '编辑策略' : '新建策略'}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <StrategyEditor
          strategy={selectedStrategy}
          onSave={() => {
            setVisible(false);
            fetchStrategies();
          }}
        />
      </Modal>
    </div>
  );
};

export default StrategyList; 
import React from 'react';
import { Layout, Card, Table, Button, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { ColumnsType } from 'antd/es/table';

const { Content } = Layout;

const StyledContent = styled(Content)`
  padding: 16px;
`;

interface Strategy {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'error';
  createTime: string;
  updateTime: string;
}

const Strategy: React.FC = () => {
  const navigate = useNavigate();
  const strategies = useSelector((state: RootState) => state.strategy.strategies);

  const handleStart = (id: string) => {
    Modal.confirm({
      title: '启动策略',
      content: '确定要启动该策略吗？',
      onOk: async () => {
        try {
          // TODO: 调用启动策略的 API
          message.success('策略启动成功');
        } catch (error) {
          message.error('策略启动失败');
        }
      },
    });
  };

  const handleStop = (id: string) => {
    Modal.confirm({
      title: '停止策略',
      content: '确定要停止该策略吗？',
      onOk: async () => {
        try {
          // TODO: 调用停止策略的 API
          message.success('策略停止成功');
        } catch (error) {
          message.error('策略停止失败');
        }
      },
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
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Strategy['status']) => {
        const statusMap = {
          running: { color: 'success', text: '运行中' },
          stopped: { color: 'default', text: '已停止' },
          error: { color: 'error', text: '错误' },
        };
        return (
          <Tag color={statusMap[status].color}>
            {statusMap[status].text}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'stopped' ? (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record.id)}
            >
              启动
            </Button>
          ) : (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={() => handleStop(record.id)}
            >
              停止
            </Button>
          )}
          <Button onClick={() => navigate(`/strategy/${record.id}/edit`)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <StyledContent>
      <Card
        title="策略管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/strategy/create')}
          >
            新建策略
          </Button>
        }
      >
        <Table columns={columns} dataSource={strategies} rowKey="id" />
      </Card>
    </StyledContent>
  );
};

export default Strategy; 
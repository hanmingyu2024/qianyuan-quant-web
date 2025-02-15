import React from 'react';
import { Card, Table, Tag, Button, Space, Alert, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ExclamationCircleOutlined, BellOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatTime, formatNumber, formatPercent } from '@/utils/formatter';

const StyledAlert = styled(Alert)`
  margin-bottom: 16px;
`;

interface RiskRule {
  id: string;
  name: string;
  type: 'drawdown' | 'loss' | 'margin' | 'volatility';
  threshold: number;
  enabled: boolean;
}

interface RiskAlert {
  id: string;
  time: string;
  level: 'warning' | 'danger';
  type: string;
  message: string;
  value: number;
  threshold: number;
  handled: boolean;
}

interface RiskAlertProps {
  rules: RiskRule[];
  alerts: RiskAlert[];
  onRuleChange: (rule: RiskRule) => void;
  onAlertHandle: (alertId: string) => void;
  loading?: boolean;
}

const RiskAlert: React.FC<RiskAlertProps> = ({
  rules,
  alerts,
  onRuleChange,
  onAlertHandle,
  loading,
}) => {
  const handleRuleChange = (rule: RiskRule) => {
    Modal.confirm({
      title: '修改风险规则',
      icon: <ExclamationCircleOutlined />,
      content: '确定要修改该风险规则吗？',
      onOk: () => onRuleChange(rule),
    });
  };

  const ruleColumns: ColumnsType<RiskRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          drawdown: '回撤',
          loss: '亏损',
          margin: '保证金',
          volatility: '波动率',
        };
        return typeMap[type];
      },
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (value, record) => {
        return record.type === 'margin' ? 
          formatPercent(value) : 
          formatNumber(value, 2);
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'default'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleRuleChange({ ...record, enabled: !record.enabled })}
        >
          {record.enabled ? '禁用' : '启用'}
        </Button>
      ),
    },
  ];

  const alertColumns: ColumnsType<RiskAlert> = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time) => formatTime(time),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={level === 'warning' ? 'gold' : 'red'}>
          {level === 'warning' ? '警告' : '危险'}
        </Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '当前值',
      dataIndex: 'value',
      key: 'value',
      render: (value) => formatNumber(value, 2),
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (value) => formatNumber(value, 2),
    },
    {
      title: '状态',
      dataIndex: 'handled',
      key: 'handled',
      render: (handled) => (
        <Tag color={handled ? 'default' : 'red'}>
          {handled ? '已处理' : '未处理'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        !record.handled && (
          <Button
            type="link"
            onClick={() => onAlertHandle(record.id)}
          >
            标记已处理
          </Button>
        )
      ),
    },
  ];

  const unhandledAlerts = alerts.filter(alert => !alert.handled);

  return (
    <>
      {unhandledAlerts.length > 0 && (
        <StyledAlert
          message={`有 ${unhandledAlerts.length} 个未处理的风险预警`}
          type="warning"
          showIcon
          icon={<BellOutlined />}
        />
      )}

      <Card title="风险规则" style={{ marginBottom: 16 }}>
        <Table
          columns={ruleColumns}
          dataSource={rules}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>

      <Card title="预警记录">
        <Table
          columns={alertColumns}
          dataSource={alerts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>
    </>
  );
};

export default RiskAlert; 
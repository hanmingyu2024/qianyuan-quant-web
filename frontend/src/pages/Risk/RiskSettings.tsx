import React, { useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Space, Row, Col, Switch, Input, Table, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

interface RiskRule {
  id: string;
  metric: string;
  operator: '>' | '<' | '>=' | '<=';
  threshold: number;
  level: 'info' | 'warning' | 'danger';
  action: 'notify' | 'stop_trading' | 'reduce_position';
  enabled: boolean;
}

const RiskSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [rules, setRules] = useState<RiskRule[]>([
    {
      id: '1',
      metric: 'var',
      operator: '>',
      threshold: 200000,
      level: 'danger',
      action: 'stop_trading',
      enabled: true,
    },
    {
      id: '2',
      metric: 'concentration',
      operator: '>',
      threshold: 0.3,
      level: 'warning',
      action: 'notify',
      enabled: true,
    },
  ]);

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return '';
    return `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseCurrency = (value: string | undefined): number => {
    if (value === undefined) return 0;
    return parseFloat(value.replace(/\¥\s?|(,*)/g, ''));
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined) return '';
    return `${(value * 100).toFixed(0)}%`;
  };

  const parsePercentage = (value: string | undefined): number => {
    if (value === undefined) return 0;
    return parseFloat(value.replace('%', '')) / 100;
  };

  const handleSubmit = async (values: any) => {
    console.log('Risk settings:', values);
    // TODO: 保存风险设置
  };

  const handleAddRule = () => {
    const newRule: RiskRule = {
      id: Date.now().toString(),
      metric: 'var',
      operator: '>',
      threshold: 0,
      level: 'warning',
      action: 'notify',
      enabled: true,
    };
    setRules([...rules, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handleRuleChange = (id: string, field: keyof RiskRule, value: any) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const columns = [
    {
      title: '指标',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: string, record: RiskRule) => (
        <Select
          value={metric}
          style={{ width: 120 }}
          onChange={(value) => handleRuleChange(record.id, 'metric', value)}
        >
          <Option value="var">VaR</Option>
          <Option value="exposure">风险敞口</Option>
          <Option value="leverage">杠杆率</Option>
          <Option value="concentration">持仓集中度</Option>
          <Option value="margin">保证金使用率</Option>
        </Select>
      ),
    },
    {
      title: '运算符',
      dataIndex: 'operator',
      key: 'operator',
      render: (operator: string, record: RiskRule) => (
        <Select
          value={operator}
          style={{ width: 80 }}
          onChange={(value) => handleRuleChange(record.id, 'operator', value)}
        >
          <Option value=">">{'>'}</Option>
          <Option value="<">{'<'}</Option>
          <Option value=">=">{'>='}</Option>
          <Option value="<=">{'<='}</Option>
        </Select>
      ),
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (threshold: number, record: RiskRule) => (
        <InputNumber
          value={threshold}
          style={{ width: 120 }}
          onChange={(value) => handleRuleChange(record.id, 'threshold', value)}
          precision={record.metric === 'concentration' ? 2 : 0}
          step={record.metric === 'concentration' ? 0.01 : 1000}
        />
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string, record: RiskRule) => (
        <Select
          value={level}
          style={{ width: 100 }}
          onChange={(value) => handleRuleChange(record.id, 'level', value)}
        >
          <Option value="info">
            <Tag color="blue">信息</Tag>
          </Option>
          <Option value="warning">
            <Tag color="orange">警告</Tag>
          </Option>
          <Option value="danger">
            <Tag color="red">危险</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string, record: RiskRule) => (
        <Select
          value={action}
          style={{ width: 120 }}
          onChange={(value) => handleRuleChange(record.id, 'action', value)}
        >
          <Option value="notify">通知</Option>
          <Option value="stop_trading">停止交易</Option>
          <Option value="reduce_position">减仓</Option>
        </Select>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: RiskRule) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleRuleChange(record.id, 'enabled', checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RiskRule) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRule(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px 0' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          varLimit: 200000,
          exposureLimit: 8000000,
          leverageLimit: 2,
          concentrationLimit: 0.3,
          marginLimit: 0.8,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Card title="风险限额设置">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="varLimit"
                    label="VaR限额"
                    rules={[{ required: true, message: '请输入VaR限额' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={10000}
                      formatter={formatCurrency}
                      parser={parseCurrency as (value: string | undefined) => number}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="exposureLimit"
                    label="风险敞口限额"
                    rules={[{ required: true, message: '请输入风险敞口限额' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={1000000}
                      formatter={formatCurrency}
                      parser={parseCurrency as (value: string | undefined) => number}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="leverageLimit"
                    label="杠杆率限额"
                    rules={[{ required: true, message: '请输入杠杆率限额' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      max={10}
                      step={0.1}
                      precision={1}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="concentrationLimit"
                    label="持仓集中度限额"
                    rules={[{ required: true, message: '请输入持仓集中度限额' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={1}
                      step={0.01}
                      precision={2}
                      formatter={formatPercentage}
                      parser={parsePercentage as (value: string | undefined) => number}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="marginLimit"
                    label="保证金使用率限额"
                    rules={[{ required: true, message: '请输入保证金使用率限额' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={1}
                      step={0.01}
                      precision={2}
                      formatter={formatPercentage}
                      parser={parsePercentage as (value: string | undefined) => number}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card
          title="风险规则"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddRule}
            >
              添加规则
            </Button>
          }
          style={{ marginTop: 16 }}
        >
          <Table
            columns={columns}
            dataSource={rules}
            rowKey="id"
            pagination={false}
          />
        </Card>

        <Form.Item style={{ marginTop: 16 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              保存设置
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Space>
  );
};

export default RiskSettings; 
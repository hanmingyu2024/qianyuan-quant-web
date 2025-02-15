import React from 'react';
import { Card, Form, Input, Select, Switch, InputNumber, Button, Row, Col, Divider, Alert } from 'antd';
import styled from 'styled-components';

const { Option } = Select;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

interface SettingsProps {
  onSubmit: (values: any) => void;
  loading?: boolean;
  initialValues?: any;
}

const Settings: React.FC<SettingsProps> = ({
  onSubmit,
  loading,
  initialValues,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <>
      <Alert
        message="注意"
        description="修改策略设置可能会影响策略的运行，请谨慎操作。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <StyledCard title="基本设置">
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="策略名称"
                rules={[{ required: true, message: '请输入策略名称' }]}
              >
                <Input placeholder="请输入策略名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="策略类型"
                rules={[{ required: true, message: '请选择策略类型' }]}
              >
                <Select placeholder="请选择策略类型">
                  <Option value="trend">趋势策略</Option>
                  <Option value="grid">网格策略</Option>
                  <Option value="arbitrage">套利策略</Option>
                  <Option value="mean_reversion">均值回归</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="策略描述"
          >
            <TextArea
              rows={4}
              placeholder="请输入策略描述"
            />
          </Form.Item>

          <Divider>交易设置</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="symbols"
                label="交易对"
                rules={[{ required: true, message: '请选择交易对' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择交易对"
                  optionFilterProp="children"
                >
                  <Option value="BTC/USDT">BTC/USDT</Option>
                  <Option value="ETH/USDT">ETH/USDT</Option>
                  <Option value="BNB/USDT">BNB/USDT</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="timeframe"
                label="时间周期"
                rules={[{ required: true, message: '请选择时间周期' }]}
              >
                <Select placeholder="请选择时间周期">
                  <Option value="1m">1分钟</Option>
                  <Option value="5m">5分钟</Option>
                  <Option value="15m">15分钟</Option>
                  <Option value="1h">1小时</Option>
                  <Option value="4h">4小时</Option>
                  <Option value="1d">1天</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>通知设置</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="notifyEmail"
                label="通知邮箱"
                rules={[
                  { type: 'email', message: '请输入正确的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入通知邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="notifyTypes"
                label="通知类型"
              >
                <Select
                  mode="multiple"
                  placeholder="请选择通知类型"
                >
                  <Option value="trade">交易通知</Option>
                  <Option value="error">错误通知</Option>
                  <Option value="warning">警告通知</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="enabled"
            valuePropName="checked"
            label="启用策略"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </StyledCard>
    </>
  );
};

export default Settings; 
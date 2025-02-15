import React from 'react';
import { Card, Form, Input, Select, Switch, Button, Row, Col, TimePicker } from 'antd';
import styled from 'styled-components';

const { Option } = Select;

const StyledCard = styled(Card)`
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

interface NotificationSettingsProps {
  onSubmit: (values: any) => void;
  loading?: boolean;
  initialValues?: any;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSubmit,
  loading,
  initialValues,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <StyledCard title="通知设置">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          enabled: true,
          channels: ['email'],
          notifyTypes: ['trade', 'error'],
          dailyReport: true,
          reportTime: null,
          ...initialValues,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="enabled"
          valuePropName="checked"
          label="启用通知"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="channels"
          label="通知渠道"
          rules={[{ required: true, message: '请选择通知渠道' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择通知渠道"
          >
            <Option value="email">邮件</Option>
            <Option value="telegram">Telegram</Option>
            <Option value="webhook">Webhook</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notifyTypes"
          label="通知类型"
          rules={[{ required: true, message: '请选择通知类型' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择通知类型"
          >
            <Option value="trade">交易通知</Option>
            <Option value="error">错误通知</Option>
            <Option value="warning">警告通知</Option>
            <Option value="info">一般信息</Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
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
              name="telegramBotToken"
              label="Telegram Bot Token"
            >
              <Input placeholder="请输入 Telegram Bot Token" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="webhookUrl"
          label="Webhook URL"
          rules={[
            { type: 'url', message: '请输入正确的 URL 地址' },
          ]}
        >
          <Input placeholder="请输入 Webhook URL" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dailyReport"
              valuePropName="checked"
              label="每日报告"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="reportTime"
              label="报告时间"
              dependencies={['dailyReport']}
              rules={[
                ({ getFieldValue }) => ({
                  required: getFieldValue('dailyReport'),
                  message: '请选择报告时间',
                }),
              ]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: '100%' }}
                disabled={!form.getFieldValue('dailyReport')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </StyledCard>
  );
};

export default NotificationSettings; 
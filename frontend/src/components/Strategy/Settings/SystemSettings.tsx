import React, { useState } from 'react';
import { Card, Form, Input, Switch, Select, Space, Button, Tabs, message } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  ApiOutlined,
  NotificationOutlined,
  UserOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

const StyledCard = styled(Card)`
  .ant-card-head-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

interface APIConfig {
  exchange: string;
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
}

interface NotificationConfig {
  email: {
    enabled: boolean;
    address: string;
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  webhook: {
    enabled: boolean;
    url: string;
  };
  notifications: {
    orderFilled: boolean;
    positionClosed: boolean;
    marginCall: boolean;
    systemError: boolean;
  };
}

interface AccountConfig {
  username: string;
  email: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark';
}

interface SystemSettingsProps {
  apiConfig: APIConfig;
  notificationConfig: NotificationConfig;
  accountConfig: AccountConfig;
  onUpdateAPI: (config: APIConfig) => Promise<void>;
  onUpdateNotification: (config: NotificationConfig) => Promise<void>;
  onUpdateAccount: (config: AccountConfig) => Promise<void>;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({
  apiConfig,
  notificationConfig,
  accountConfig,
  onUpdateAPI,
  onUpdateNotification,
  onUpdateAccount,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [apiForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [accountForm] = Form.useForm();

  const handleAPISubmit = async (values: APIConfig) => {
    try {
      setLoading(true);
      await onUpdateAPI(values);
      message.success(t('settings.api.saveSuccess'));
    } catch (error) {
      message.error(t('settings.api.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (values: NotificationConfig) => {
    try {
      setLoading(true);
      await onUpdateNotification(values);
      message.success(t('settings.notification.saveSuccess'));
    } catch (error) {
      message.error(t('settings.notification.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (values: AccountConfig) => {
    try {
      setLoading(true);
      await onUpdateAccount(values);
      message.success(t('settings.account.saveSuccess'));
    } catch (error) {
      message.error(t('settings.account.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultActiveKey="api">
      <TabPane
        tab={
          <span>
            <ApiOutlined />
            {t('settings.api.title')}
          </span>
        }
        key="api"
      >
        <StyledCard>
          <Form
            form={apiForm}
            layout="vertical"
            initialValues={apiConfig}
            onFinish={handleAPISubmit}
          >
            <Form.Item
              name="exchange"
              label={t('settings.api.exchange')}
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="binance">Binance</Option>
                <Option value="okex">OKEx</Option>
                <Option value="huobi">Huobi</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="apiKey"
              label={t('settings.api.key')}
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="apiSecret"
              label={t('settings.api.secret')}
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="testnet"
              label={t('settings.api.testnet')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('settings.save')}
              </Button>
            </Form.Item>
          </Form>
        </StyledCard>
      </TabPane>

      {/* 通知设置 */}
      <TabPane
        tab={
          <span>
            <NotificationOutlined />
            {t('settings.notification.title')}
          </span>
        }
        key="notification"
      >
        <StyledCard>
          <Form
            form={notificationForm}
            layout="vertical"
            initialValues={notificationConfig}
            onFinish={handleNotificationSubmit}
          >
            {/* 邮件通知设置 */}
            <Form.Item label={t('settings.notification.email.title')}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name={['email', 'enabled']} valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
                <Form.Item
                  name={['email', 'address']}
                  rules={[
                    { required: true, type: 'email', message: t('settings.notification.email.invalid') }
                  ]}
                  noStyle
                >
                  <Input placeholder={t('settings.notification.email.placeholder')} />
                </Form.Item>
              </Space>
            </Form.Item>

            {/* Telegram通知设置 */}
            <Form.Item label={t('settings.notification.telegram.title')}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name={['telegram', 'enabled']} valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
                <Form.Item name={['telegram', 'botToken']} noStyle>
                  <Input placeholder={t('settings.notification.telegram.botToken')} />
                </Form.Item>
                <Form.Item name={['telegram', 'chatId']} noStyle>
                  <Input placeholder={t('settings.notification.telegram.chatId')} />
                </Form.Item>
              </Space>
            </Form.Item>

            {/* Webhook通知设置 */}
            <Form.Item label={t('settings.notification.webhook.title')}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name={['webhook', 'enabled']} valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
                <Form.Item name={['webhook', 'url']} noStyle>
                  <Input placeholder={t('settings.notification.webhook.url')} />
                </Form.Item>
              </Space>
            </Form.Item>

            {/* 通知事件设置 */}
            <Form.Item label={t('settings.notification.events.title')}>
              <Form.Item name={['notifications', 'orderFilled']} valuePropName="checked">
                <Switch checkedChildren={t('settings.notification.events.orderFilled')} />
              </Form.Item>
              <Form.Item name={['notifications', 'positionClosed']} valuePropName="checked">
                <Switch checkedChildren={t('settings.notification.events.positionClosed')} />
              </Form.Item>
              <Form.Item name={['notifications', 'marginCall']} valuePropName="checked">
                <Switch checkedChildren={t('settings.notification.events.marginCall')} />
              </Form.Item>
              <Form.Item name={['notifications', 'systemError']} valuePropName="checked">
                <Switch checkedChildren={t('settings.notification.events.systemError')} />
              </Form.Item>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('settings.save')}
              </Button>
            </Form.Item>
          </Form>
        </StyledCard>
      </TabPane>

      {/* 账户设置 */}
      <TabPane
        tab={
          <span>
            <UserOutlined />
            {t('settings.account.title')}
          </span>
        }
        key="account"
      >
        <StyledCard>
          <Form
            form={accountForm}
            layout="vertical"
            initialValues={accountConfig}
            onFinish={handleAccountSubmit}
          >
            <Form.Item
              name="username"
              label={t('settings.account.username')}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label={t('settings.account.email')}
              rules={[
                { required: true },
                { type: 'email', message: t('settings.account.emailInvalid') }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="timezone"
              label={t('settings.account.timezone')}
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="UTC+8">UTC+8 (Beijing)</Option>
                <Option value="UTC+0">UTC+0 (London)</Option>
                <Option value="UTC-5">UTC-5 (New York)</Option>
                <Option value="UTC-8">UTC-8 (Los Angeles)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label={t('settings.account.language')}
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="zh-CN">简体中文</Option>
                <Option value="en-US">English</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="theme"
              label={t('settings.account.theme')}
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="light">{t('settings.account.theme.light')}</Option>
                <Option value="dark">{t('settings.account.theme.dark')}</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('settings.save')}
              </Button>
            </Form.Item>
          </Form>
        </StyledCard>
      </TabPane>
    </Tabs>
  );
};

export default SystemSettings; 
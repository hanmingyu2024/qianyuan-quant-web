import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import { showSuccess, showError } from '@/utils/notification';
import { useI18n } from '@/utils/i18n';
import { useCache } from '@/hooks/useCache';

const { TabPane } = Tabs;

const UserSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const authStore = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { t } = useI18n();
  const [userPreferences, setUserPreferences] = useCache({
    key: 'user_preferences',
    initialValue: {
      theme: 'light',
      language: 'zh-CN',
      notifications: true,
    },
  });

  const handleUpdateProfile = async (values: { email: string; username: string }) => {
    try {
      setLoading(true);
      await userService.updateProfile(values);
      showSuccess(t('settings.profileUpdateSuccess'));
      authStore.fetchCurrentUser();
    } catch (error) {
      showError(t('settings.profileUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: { 
    currentPassword: string; 
    newPassword: string;
  }) => {
    try {
      setLoading(true);
      await userService.changePassword(values);
      showSuccess(t('settings.passwordChangeSuccess'));
      passwordForm.resetFields();
    } catch (error) {
      showError(t('settings.passwordChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t('settings.userSettings')}>
      <Tabs defaultActiveKey="profile">
        <TabPane tab={t('settings.profile')} key="profile">
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={{
              email: authStore.user?.email,
              username: authStore.user?.username,
            }}
            onFinish={handleUpdateProfile}
          >
            <Form.Item
              name="email"
              label={t('auth.email')}
              rules={[
                { required: true, message: t('validation.required') },
                { type: 'email', message: t('validation.email') }
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item
              name="username"
              label={t('auth.username')}
              rules={[
                { required: true, message: t('validation.required') },
                { min: 3, message: t('validation.usernameLength') }
              ]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('common.save')}
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab={t('settings.password')} key="password">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="currentPassword"
              label={t('settings.currentPassword')}
              rules={[
                { required: true, message: t('validation.required') }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={t('settings.newPassword')}
              rules={[
                { required: true, message: t('validation.required') },
                { min: 6, message: t('validation.password') }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={t('settings.confirmNewPassword')}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t('validation.required') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(t('validation.passwordMatch'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('settings.changePassword')}
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default UserSettings; 
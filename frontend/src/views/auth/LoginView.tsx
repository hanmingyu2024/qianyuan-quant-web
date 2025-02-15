import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import styled from 'styled-components';
import { useI18n } from '@/utils/i18n';

const { Title } = Typography;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const LoginView: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      setError(null);
      await authStore.login(values.username, values.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <LoginContainer>
      <StyledCard>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          {t('auth.login')}
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('auth.username')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.password')}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={authStore.loading}
            >
              {t('auth.login')}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register">{t('auth.register')}</Link>
          </div>
        </Form>
      </StyledCard>
    </LoginContainer>
  );
};

export default LoginView;
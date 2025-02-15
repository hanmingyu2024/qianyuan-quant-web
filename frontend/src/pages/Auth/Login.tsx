import * as React from 'react';
import { Card, Form, Input, Button, Tabs, message, Row, Col, Divider } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, MailOutlined, WechatOutlined, QqOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../store/slices/userSlice';
import { userApi } from '@/services';

const { TabPane } = Tabs;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('account');
  const [sendingCode, setSendingCode] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values: any) => {
    try {
      setLoading(true);
      // 这里调用登录 API
      const response = await userApi.login(values);
      dispatch(setToken(response.token));
      dispatch(setUser(response.user));
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error('登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    try {
      setSendingCode(true);
      const phone = form.getFieldValue('phone');
      if (!phone) {
        message.error('请输入手机号');
        return;
      }
      // 这里调用发送验证码 API
      await userApi.sendVerificationCode({ phone });
      message.success('验证码已发送');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      message.error('发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSocialLogin = (type: 'wechat' | 'qq') => {
    message.info(`${type === 'wechat' ? '微信' : 'QQ'}登录功能开发中`);
  };

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>乾元量化交易平台</h2>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="账号密码登录" key="account">
            <Form
              form={form}
              onFinish={handleLogin}
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名/邮箱' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名/邮箱"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="手机号登录" key="phone">
            <Form
              form={form}
              onFinish={handleLogin}
              size="large"
            >
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input
                  prefix={<MobileOutlined />}
                  placeholder="手机号"
                />
              </Form.Item>
              <Form.Item>
                <Row gutter={8}>
                  <Col span={16}>
                    <Form.Item
                      name="code"
                      noStyle
                      rules={[{ required: true, message: '请输入验证码' }]}
                    >
                      <Input
                        prefix={<LockOutlined />}
                        placeholder="验证码"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Button
                      block
                      disabled={countdown > 0}
                      loading={sendingCode}
                      onClick={handleSendCode}
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
        <Divider>其他登录方式</Divider>
        <div style={{ textAlign: 'center' }}>
          <Button
            type="link"
            icon={<WechatOutlined style={{ fontSize: 24, color: '#07C160' }} />}
            onClick={() => handleSocialLogin('wechat')}
          />
          <Button
            type="link"
            icon={<QqOutlined style={{ fontSize: 24, color: '#12B7F5' }} />}
            onClick={() => handleSocialLogin('qq')}
          />
        </div>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button type="link" onClick={() => navigate('/register')}>
            注册账号
          </Button>
          <Button type="link" onClick={() => navigate('/forgot-password')}>
            忘记密码
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login; 
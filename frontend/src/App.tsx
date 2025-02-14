import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Avatar, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { wsService } from './services/websocket';
import ManualTrading from './pages/Trading/ManualTrading';
import AutoTrading from './pages/Trading/AutoTrading';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import RiskMonitor from './pages/Risk/RiskMonitor';
import RiskSettings from './pages/Risk/RiskSettings';
import StrategyList from './pages/Strategy/StrategyList';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [wsStatus, setWsStatus] = useState(false);

  useEffect(() => {
    // 初始化 WebSocket 连接
    wsService.connect();

    // 定期检查连接状态
    const statusCheck = setInterval(() => {
      const status = wsService.getStatus();
      setWsStatus(status.connected);
    }, 1000);

    // 组件卸载时清理
    return () => {
      clearInterval(statusCheck);
      wsService.disconnect();
    };
  }, []);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'trading',
      icon: <LineChartOutlined />,
      label: '交易中心',
      children: [
        {
          key: 'manual-trading',
          label: '手动交易',
        },
        {
          key: 'automatic-trading',
          label: '自动交易',
        },
      ],
    },
    {
      key: 'analysis',
      icon: <BarChartOutlined />,
      label: '数据分析',
      children: [
        {
          key: 'market-analysis',
          label: '市场分析',
        },
        {
          key: 'performance-analysis',
          label: '绩效分析',
        },
      ],
    },
    {
      key: 'strategy',
      icon: <RobotOutlined />,
      label: '策略管理',
      children: [
        {
          key: 'strategy-list',
          label: '策略列表',
        },
        {
          key: 'strategy-backtest',
          label: '策略回测',
        },
      ],
    },
    {
      key: 'risk',
      icon: <SafetyCertificateOutlined />,
      label: '风控管理',
      children: [
        {
          key: 'risk-monitoring',
          label: '风险监控',
        },
        {
          key: 'risk-settings',
          label: '风控设置',
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'dashboard':
        navigate('/');
        break;
      case 'manual-trading':
        navigate('/trading/manual');
        break;
      case 'automatic-trading':
        navigate('/trading/auto');
        break;
      case 'market-analysis':
        navigate('/analysis/market');
        break;
      case 'performance-analysis':
        navigate('/analysis/performance');
        break;
      case 'strategy-list':
        navigate('/strategy/list');
        break;
      case 'strategy-backtest':
        navigate('/strategy/backtest');
        break;
      case 'risk-monitoring':
        navigate('/risk/monitoring');
        break;
      case 'risk-settings':
        navigate('/risk/settings');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">个人中心</Menu.Item>
      <Menu.Item key="settings">账户设置</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">退出登录</Menu.Item>
    </Menu>
  );

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return ['dashboard'];
    if (path.startsWith('/trading/manual')) return ['manual-trading'];
    if (path.startsWith('/trading/auto')) return ['automatic-trading'];
    if (path.startsWith('/analysis/market')) return ['market-analysis'];
    if (path.startsWith('/analysis/performance')) return ['performance-analysis'];
    if (path.startsWith('/strategy/list')) return ['strategy-list'];
    if (path.startsWith('/strategy/backtest')) return ['strategy-backtest'];
    if (path.startsWith('/risk/monitoring')) return ['risk-monitoring'];
    if (path.startsWith('/risk/settings')) return ['risk-settings'];
    if (path.startsWith('/settings')) return ['settings'];
    return [];
  };

  // 获取当前展开的子菜单
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/trading/')) return ['trading'];
    if (path.startsWith('/analysis/')) return ['analysis'];
    if (path.startsWith('/strategy/')) return ['strategy'];
    if (path.startsWith('/risk/')) return ['risk'];
    return [];
  };

  return (
    <Layout>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
        }}>
          {collapsed ? 'QY' : '乾元量化'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s', minHeight: '100vh' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        }}>
          <Space size="large">
            <Badge status={wsStatus ? "success" : "error"} text={wsStatus ? "已连接" : "未连接"} />
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: 4,
          minHeight: 280,
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trading/manual" element={<ManualTrading />} />
            <Route path="/trading/auto" element={<AutoTrading />} />
            <Route path="/analysis/market" element={<Analysis />} />
            <Route path="/analysis/performance" element={<Analysis />} />
            <Route path="/strategy/list" element={<StrategyList />} />
            <Route path="/strategy/backtest" element={<StrategyList />} />
            <Route path="/risk/monitoring" element={<RiskMonitor />} />
            <Route path="/risk/settings" element={<RiskSettings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App; 
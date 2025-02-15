import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const menuItems = [
    { key: 'market', label: '市场行情', path: '/' },
    { key: 'trading', label: '交易中心', path: '/trading' },
    { key: 'strategy', label: '策略管理', path: '/strategy' },
    { key: 'backtest', label: '回测系统', path: '/backtest' },
  ];

  return (
    <Layout>
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal">
          {menuItems.map(item => (
            <Menu.Item key={item.key}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </Header>
      <Layout>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

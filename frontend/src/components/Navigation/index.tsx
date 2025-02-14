import React from 'react';
import { Menu, Button, Space, Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DashboardOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import { RootState } from '../../store';
import { logout } from '../../store/slices/userSlice';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.currentUser);

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
        系统设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginRight: '48px',
          color: '#1890ff'
        }}>
          乾元量化
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ border: 'none', flex: 1 }}
        >
          <Menu.Item
            key="/"
            icon={<DashboardOutlined />}
            onClick={() => handleMenuClick('/')}
          >
            仪表盘
          </Menu.Item>
          <Menu.Item
            key="/trading"
            icon={<LineChartOutlined />}
            onClick={() => handleMenuClick('/trading')}
          >
            交易
          </Menu.Item>
          <Menu.Item
            key="/analysis"
            icon={<AreaChartOutlined />}
            onClick={() => handleMenuClick('/analysis')}
          >
            分析
          </Menu.Item>
          <Menu.SubMenu 
            key="strategy" 
            icon={<BarChartOutlined />} 
            title="策略"
          >
            <Menu.Item key="/strategy/list" onClick={() => handleMenuClick('/strategy/list')}>
              策略列表
            </Menu.Item>
            <Menu.Item key="/strategy/backtest" onClick={() => handleMenuClick('/strategy/backtest')}>
              回测
            </Menu.Item>
            <Menu.Item key="/strategy/optimization" onClick={() => handleMenuClick('/strategy/optimization')}>
              优化
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </div>
      <Space size="large">
        <Button
          type="text"
          icon={<BellOutlined />}
          onClick={() => navigate('/notifications')}
        />
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} src={user?.avatar} />
            <span>{user?.username || '用户'}</span>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
};

export default Navigation; 
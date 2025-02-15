import * as React from 'react';
import { Layout, Menu, Button, Space, Avatar, Dropdown, Badge, ConfigProvider } from 'antd';
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
import { RouterProvider } from 'react-router-dom';
import { wsService } from './services/websocket';
import { router } from '@/router';
import zhCN from 'antd/locale/zh_CN';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import NotificationProvider from '@/components/common/NotificationProvider';
import { AIProvider } from '@/contexts/AIContext';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <ErrorBoundary>
        <NotificationProvider>
          <AIProvider>
            <RouterProvider router={router} />
          </AIProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </ConfigProvider>
  );
};

export default App; 
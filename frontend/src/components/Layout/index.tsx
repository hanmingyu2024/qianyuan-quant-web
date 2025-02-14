import React from 'react'
import { Layout, Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import NotificationPanel from '@/components/Notification'
import Announcement from '@/components/Announcement'
import UserGuide from '@/components/UserGuide'
import MobileNav from '@/components/MobileNav'
import {
  HomeOutlined,
  LineChartOutlined,
  SwapOutlined,
  WalletOutlined,
  SettingOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import styles from './style.module.css'

const { Header, Sider, Content } = Layout

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>
    },
    {
      key: '/market',
      icon: <LineChartOutlined />,
      label: <Link to="/market">行情</Link>
    },
    {
      key: '/trading',
      icon: <SwapOutlined />,
      label: <Link to="/trading">交易</Link>
    },
    {
      key: '/assets',
      icon: <WalletOutlined />,
      label: <Link to="/assets">资产</Link>
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">设置</Link>
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: <Link to="/help">帮助</Link>
    }
  ]

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerLeft}>
          <MobileNav menuItems={menuItems} />
          <div className={styles.logo}>交易平台</div>
        </div>
        <div className={styles.headerRight}>
          <NotificationPanel />
        </div>
      </Header>
      <Layout>
        <Sider width={200} className={styles.sider}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className={styles.menu}
          />
        </Sider>
        <Content className={styles.content}>
          <Announcement />
          {children}
          <UserGuide />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout 
import React from 'react'
import { Drawer, Menu } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import styles from './style.module.css'

interface MobileNavProps {
  menuItems: any[]
}

const MobileNav: React.FC<MobileNavProps> = ({ menuItems }) => {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()

  return (
    <div className={styles.mobileNav}>
      <MenuOutlined className={styles.menuIcon} onClick={() => setOpen(true)} />
      <Drawer
        title="菜单"
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={() => setOpen(false)}
        />
      </Drawer>
    </div>
  )
}

export default MobileNav 
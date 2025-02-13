import React from 'react'
import { Badge, Dropdown, List, Typography } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useNotificationStore } from '@/store/useNotificationStore'
import styles from './style.module.css'

const { Text } = Typography

const NotificationPanel: React.FC = () => {
  const { notifications, markAsRead } = useNotificationStore()
  const unreadCount = notifications.filter(n => !n.read).length

  const items = [
    {
      key: 'notifications',
      label: (
        <List
          className={styles.list}
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item onClick={() => markAsRead(item.id)}>
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    <Text type="secondary">{item.time}</Text>
                    <div>{item.content}</div>
                  </>
                }
              />
              {!item.read && <Badge status="processing" />}
            </List.Item>
          )}
        />
      ),
    },
  ]

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} className={styles.badge}>
        <BellOutlined className={styles.icon} />
      </Badge>
    </Dropdown>
  )
}

export default NotificationPanel 
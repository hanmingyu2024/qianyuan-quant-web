import React from 'react'
import { Alert, Modal, List, Tag, Typography } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useAnnouncementStore } from '@/store/useAnnouncementStore'
import styles from './style.module.css'

const { Text, Paragraph } = Typography

interface AnnouncementProps {
  showBanner?: boolean
}

const Announcement: React.FC<AnnouncementProps> = ({ showBanner = true }) => {
  const { announcements, latestAnnouncement, markAsRead } = useAnnouncementStore()
  const [modalVisible, setModalVisible] = React.useState(false)

  if (!announcements.length) return null

  return (
    <>
      {showBanner && latestAnnouncement && !latestAnnouncement.read && (
        <Alert
          message={latestAnnouncement.title}
          type="info"
          showIcon
          icon={<BellOutlined />}
          action={
            <a onClick={() => setModalVisible(true)}>查看详情</a>
          }
          closable
          onClose={() => markAsRead(latestAnnouncement.id)}
          className={styles.banner}
        />
      )}

      <Modal
        title="系统公告"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item
              extra={
                <Tag color={item.type === 'important' ? 'red' : 'blue'}>
                  {item.type === 'important' ? '重要' : '普通'}
                </Tag>
              }
            >
              <List.Item.Meta
                title={
                  <div className={styles.title}>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary" className={styles.time}>
                      {item.time}
                    </Text>
                  </div>
                }
                description={
                  <Paragraph className={styles.content}>
                    {item.content}
                  </Paragraph>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  )
}

export default Announcement 
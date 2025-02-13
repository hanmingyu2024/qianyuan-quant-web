import React from 'react'
import { Card, Avatar, List, Input, Button, Badge, message } from 'antd'
import { UserOutlined, SendOutlined } from '@ant-design/icons'
import styles from '../style.module.css'

interface User {
  id: string
  name: string
  avatar?: string
  online: boolean
}

interface Comment {
  id: string
  userId: string
  content: string
  timestamp: number
}

interface PathCollaborationProps {
  users: User[]
  comments: Comment[]
  currentUser: User
  onComment: (content: string) => void
  onShare: (userId: string) => void
}

export const PathCollaboration: React.FC<PathCollaborationProps> = ({
  users,
  comments,
  currentUser,
  onComment,
  onShare,
}) => {
  const [commentText, setCommentText] = React.useState('')

  const handleSubmitComment = () => {
    if (!commentText.trim()) return
    
    onComment(commentText.trim())
    setCommentText('')
  }

  return (
    <Card title="协作" className={styles.collaboration}>
      <div className={styles.users}>
        <List
          dataSource={users}
          renderItem={user => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Badge
                    dot
                    status={user.online ? 'success' : 'default'}
                    offset={[-5, 5]}
                  >
                    <Avatar
                      src={user.avatar}
                      icon={!user.avatar && <UserOutlined />}
                    />
                  </Badge>
                }
                title={user.name}
              />
              {user.id !== currentUser.id && (
                <Button
                  type="link"
                  onClick={() => onShare(user.id)}
                >
                  分享
                </Button>
              )}
            </List.Item>
          )}
        />
      </div>

      <div className={styles.comments}>
        <List
          dataSource={comments}
          renderItem={comment => {
            const user = users.find(u => u.id === comment.userId)
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={user?.avatar}
                      icon={!user?.avatar && <UserOutlined />}
                    />
                  }
                  title={user?.name}
                  description={
                    <>
                      <div>{comment.content}</div>
                      <small>
                        {new Date(comment.timestamp).toLocaleString()}
                      </small>
                    </>
                  }
                />
              </List.Item>
            )
          }}
        />
      </div>

      <div className={styles.commentInput}>
        <Input.TextArea
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="添加评论..."
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmitComment}
          disabled={!commentText.trim()}
        >
          发送
        </Button>
      </div>
    </Card>
  )
}
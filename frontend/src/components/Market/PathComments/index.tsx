import React from 'react'
import { Card, List, Comment, Avatar, Form, Button, Input, Rate, Tag, Space, Tooltip } from 'antd'
import { UserOutlined, LikeOutlined, DislikeOutlined, MessageOutlined, StarOutlined, StarFilled } from '@ant-design/icons'
import styles from './style.module.css'

const { TextArea } = Input

interface PathComment {
  id: string
  author: string
  content: string
  rating: number
  likes: number
  dislikes: number
  timestamp: number
  replies: PathComment[]
  replyTo?: string
}

interface PathCommentsProps {
  pathId: string
  onFavorite?: () => void
  isFavorite?: boolean
}

const PathComments: React.FC<PathCommentsProps> = ({
  pathId,
  onFavorite,
  isFavorite,
}) => {
  const [comments, setComments] = React.useState<PathComment[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [rating, setRating] = React.useState(5)
  const [replyTo, setReplyTo] = React.useState<string | null>(null)

  const handleSubmit = () => {
    if (!value) return

    setSubmitting(true)
    
    const newComment: PathComment = {
      id: Date.now().toString(),
      author: '当前用户',
      content: value,
      rating,
      likes: 0,
      dislikes: 0,
      timestamp: Date.now(),
      replies: [],
      replyTo: replyTo,
    }

    if (replyTo) {
      setComments(comments.map(c => {
        if (c.id === replyTo) {
          return {
            ...c,
            replies: [newComment, ...c.replies],
          }
        }
        return c
      }))
    } else {
      setComments([newComment, ...comments])
    }

    setValue('')
    setRating(5)
    setReplyTo(null)
    setSubmitting(false)
  }

  const handleLike = (commentId: string) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 }
      }
      return c
    }))
  }

  const handleDislike = (commentId: string) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, dislikes: c.dislikes + 1 }
      }
      return c
    }))
  }

  const averageRating = React.useMemo(() => {
    if (!comments.length) return 0
    return comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
  }, [comments])

  return (
    <Card 
      title="路径评论" 
      className={styles.comments}
      extra={
        <Space>
          <Tag color="blue">平均评分</Tag>
          <Rate disabled value={averageRating} />
          <Button
            icon={isFavorite ? <StarFilled /> : <StarOutlined />}
            onClick={onFavorite}
          >
            收藏
          </Button>
        </Space>
      }
    >
      <Form className={styles.commentForm}>
        <Form.Item>
          <TextArea
            rows={4}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="写下你的评论..."
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Rate value={rating} onChange={setRating} />
            <Button
              htmlType="submit"
              loading={submitting}
              onClick={handleSubmit}
              type="primary"
            >
              提交评论
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <List
        className={styles.commentList}
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={comment => (
          <Comment
            author={comment.author}
            avatar={<Avatar icon={<UserOutlined />} />}
            content={comment.content}
            datetime={
              <Space>
                <span>{new Date(comment.timestamp).toLocaleString()}</span>
                <Rate disabled value={comment.rating} />
                <Button
                  icon={<LikeOutlined />}
                  onClick={() => handleLike(comment.id)}
                >
                  {comment.likes}
                </Button>
                <Button
                  icon={<DislikeOutlined />}
                  onClick={() => handleDislike(comment.id)}
                >
                  {comment.dislikes}
                </Button>
                <Tooltip key="reply" title="回复">
                  <Button
                    icon={<MessageOutlined />}
                    onClick={() => setReplyTo(comment.id)}
                  >
                    回复
                  </Button>
                </Tooltip>
              </Space>
            }
            actions={[
              <Tooltip key="like" title="赞">
                <Button
                  icon={<LikeOutlined />}
                  onClick={() => handleLike(comment.id)}
                >
                  {comment.likes}
                </Button>
              </Tooltip>,
              <Tooltip key="dislike" title="踩">
                <Button
                  icon={<DislikeOutlined />}
                  onClick={() => handleDislike(comment.id)}
                >
                  {comment.dislikes}
                </Button>
              </Tooltip>,
            ]}
            children={comment.replies?.map(reply => (
              <Comment
                key={reply.id}
                author={reply.author}
                avatar={<Avatar icon={<UserOutlined />} />}
                content={reply.content}
                datetime={
                  <Space>
                    <span>{new Date(reply.timestamp).toLocaleString()}</span>
                    <Rate disabled value={reply.rating} />
                  </Space>
                }
              />
            ))}
          />
        )}
      />
    </Card>
  )
}

export default PathComments 
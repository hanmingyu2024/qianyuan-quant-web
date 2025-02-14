import React from 'react'
import { Card, Collapse, Typography, Input, List, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import styles from './style.module.css'

const { Title, Paragraph } = Typography
const { Panel } = Collapse

interface FAQ {
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    question: '如何开始交易？',
    answer: '1. 完成实名认证\n2. 充值资金\n3. 选择交易对\n4. 下单交易',
    category: '交易',
  },
  {
    question: '如何充值？',
    answer: '在资产页面点击充值按钮，选择币种，使用提供的地址进行充值。',
    category: '资产',
  },
  {
    question: '如何启用二次验证？',
    answer: '在设置页面开启二次验证，使用Google Authenticator扫描二维码完成设置。',
    category: '安全',
  },
  // 添加更多FAQ...
]

const Help: React.FC = () => {
  const [searchText, setSearchText] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchText || 
      faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = !activeCategory || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className={styles.container}>
      <Card className={styles.searchCard}>
        <Title level={2}>帮助中心</Title>
        <Input
          size="large"
          placeholder="搜索问题..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.categories}>
          {categories.map(category => (
            <Tag
              key={category}
              color={activeCategory === category ? 'blue' : undefined}
              onClick={() => setActiveCategory(
                activeCategory === category ? null : category
              )}
              className={styles.categoryTag}
            >
              {category}
            </Tag>
          ))}
        </div>
      </Card>

      <Card title="常见问题" className={styles.faqCard}>
        <Collapse>
          {filteredFaqs.map((faq, index) => (
            <Panel
              key={index}
              header={faq.question}
              extra={<Tag>{faq.category}</Tag>}
            >
              <Paragraph>{faq.answer}</Paragraph>
            </Panel>
          ))}
        </Collapse>
      </Card>

      <Card title="联系我们" className={styles.contactCard}>
        <List>
          <List.Item>
            <List.Item.Meta
              title="客服邮箱"
              description="support@example.com"
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title="客服电话"
              description="400-123-4567"
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title="工作时间"
              description="周一至周五 9:00-18:00"
            />
          </List.Item>
        </List>
      </Card>
    </div>
  )
}

export default Help 
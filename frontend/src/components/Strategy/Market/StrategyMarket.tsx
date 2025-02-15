import React, { useState } from 'react';
import { Card, List, Tag, Rate, Space, Input, Select, Button, Modal, Tabs, Avatar } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  SearchOutlined,
  StarOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { formatTime } from '@/utils/formatter';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  .ant-card-meta-title {
    margin-bottom: 12px;
  }
  .ant-card-meta-description {
    height: 44px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

interface Strategy {
  id: string;
  name: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  rating: number;
  downloads: number;
  createdAt: number;
  updatedAt: number;
  price: number;
  type: 'template' | 'community';
  category: string;
}

interface StrategyMarketProps {
  strategies: Strategy[];
  onDownload: (strategy: Strategy) => Promise<void>;
  onPreview: (strategy: Strategy) => void;
}

const StrategyMarket: React.FC<StrategyMarketProps> = ({
  strategies,
  onDownload,
  onPreview,
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState<'template' | 'community'>('template');
  const [loading, setLoading] = useState(false);
  const [previewStrategy, setPreviewStrategy] = useState<Strategy | null>(null);

  const handleDownload = async (strategy: Strategy) => {
    try {
      setLoading(true);
      await onDownload(strategy);
    } finally {
      setLoading(false);
    }
  };

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = category === 'all' || strategy.category === category;
    const matchesType = strategy.type === type;
    return matchesSearch && matchesCategory && matchesType;
  });

  const renderStrategyList = (strategies: Strategy[]) => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
      dataSource={strategies}
      renderItem={strategy => (
        <List.Item>
          <StyledCard
            hoverable
            onClick={() => setPreviewStrategy(strategy)}
            actions={[
              <Rate disabled defaultValue={strategy.rating} />,
              strategy.type === 'template' ? (
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(strategy);
                  }}
                  loading={loading}
                >
                  {strategy.price > 0 ? `$${strategy.price}` : t('market.free')}
                </Button>
              ) : (
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(strategy);
                  }}
                >
                  {t('market.fork')}
                </Button>
              ),
            ]}
          >
            <Card.Meta
              avatar={
                <Avatar 
                  src={strategy.author.avatar}
                  icon={!strategy.author.avatar && <UserOutlined />}
                />
              }
              title={
                <Space>
                  {strategy.name}
                  {strategy.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              }
              description={strategy.description}
            />
            <div style={{ marginTop: 16 }}>
              <Space split="·">
                <span>{strategy.author.name}</span>
                <span>{formatTime(strategy.updatedAt)}</span>
                <span>
                  <StarOutlined /> {strategy.rating.toFixed(1)}
                </span>
                <span>
                  <DownloadOutlined /> {strategy.downloads}
                </span>
              </Space>
            </div>
          </StyledCard>
        </List.Item>
      )}
    />
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card>
        <Space>
          <Search
            placeholder={t('market.search.placeholder')}
            allowClear
            onSearch={value => setSearchText(value)}
            style={{ width: 300 }}
          />
          <Select value={category} onChange={setCategory} style={{ width: 200 }}>
            <Option value="all">{t('market.category.all')}</Option>
            <Option value="trend">{t('market.category.trend')}</Option>
            <Option value="mean-reversion">{t('market.category.meanReversion')}</Option>
            <Option value="arbitrage">{t('market.category.arbitrage')}</Option>
            <Option value="ml">{t('market.category.ml')}</Option>
          </Select>
        </Space>
      </Card>

      <Tabs activeKey={type} onChange={value => setType(value as 'template' | 'community')}>
        <TabPane tab={t('market.type.template')} key="template">
          {renderStrategyList(filteredStrategies)}
        </TabPane>

        <TabPane tab={t('market.type.community')} key="community">
          {renderStrategyList(filteredStrategies)}
        </TabPane>
      </Tabs>

      <Modal
        title={previewStrategy?.name}
        open={!!previewStrategy}
        onCancel={() => setPreviewStrategy(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewStrategy(null)}>
            {t('market.close')}
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={previewStrategy?.type === 'template' ? <DownloadOutlined /> : <ShareAltOutlined />}
            onClick={() => {
              if (previewStrategy) {
                handleDownload(previewStrategy);
              }
            }}
            loading={loading}
          >
            {previewStrategy?.type === 'template' ? 
              (previewStrategy?.price > 0 ? `$${previewStrategy.price}` : t('market.free')) : 
              t('market.fork')
            }
          </Button>,
        ]}
        width={800}
      >
        {previewStrategy && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Space split="·">
                <Avatar src={previewStrategy.author.avatar} icon={!previewStrategy.author.avatar && <UserOutlined />} />
                <span>{previewStrategy.author.name}</span>
                <span>{formatTime(previewStrategy.updatedAt)}</span>
                <span><StarOutlined /> {previewStrategy.rating.toFixed(1)}</span>
                <span><DownloadOutlined /> {previewStrategy.downloads}</span>
              </Space>
            </div>
            <div>
              {previewStrategy.tags.map(tag => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </div>
            <div>{previewStrategy.description}</div>
            {/* 这里可以添加策略的更多详细信息，如回测结果、使用说明等 */}
          </Space>
        )}
      </Modal>
    </Space>
  );
};

export default StrategyMarket; 
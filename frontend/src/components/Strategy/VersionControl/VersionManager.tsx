import React, { useState } from 'react';
import { Card, List, Tag, Button, Space, Modal, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  BranchesOutlined,
  RollbackOutlined,
  DiffOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { formatTime } from '@/utils/formatter';

const { Text, Paragraph } = Typography;

const StyledList = styled(List)`
  .ant-list-item {
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background: #f5f5f5;
    }
  }
`;

const DiffView = styled.pre`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
`;

interface Version {
  id: string;
  timestamp: number;
  message: string;
  author: string;
  changes: {
    added: number;
    removed: number;
    modified: number;
  };
  code: string;
}

interface VersionManagerProps {
  versions: Version[];
  currentVersion: string;
  onRollback: (versionId: string) => void;
  onCompare: (v1: string, v2: string) => Promise<string>;
}

const VersionManager: React.FC<VersionManagerProps> = ({
  versions,
  currentVersion,
  onRollback,
  onCompare,
}) => {
  const { t } = useTranslation();
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [diffModalVisible, setDiffModalVisible] = useState(false);
  const [diffContent, setDiffContent] = useState('');

  const handleCompare = async (v1: Version, v2: Version) => {
    const diff = await onCompare(v1.id, v2.id);
    setDiffContent(diff);
    setDiffModalVisible(true);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title={t('strategy.version.history')}>
        <StyledList
          dataSource={versions}
          renderItem={(version) => (
            <List.Item
              key={version.id}
              onClick={() => setSelectedVersion(version)}
              actions={[
                <Button
                  key="compare"
                  type="link"
                  icon={<DiffOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    const current = versions.find(v => v.id === currentVersion);
                    if (current) {
                      handleCompare(current, version);
                    }
                  }}
                >
                  {t('strategy.version.compare')}
                </Button>,
                <Button
                  key="rollback"
                  type="link"
                  icon={<RollbackOutlined />}
                  disabled={version.id === currentVersion}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRollback(version.id);
                  }}
                >
                  {t('strategy.version.rollback')}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<BranchesOutlined />}
                title={
                  <Space>
                    <Text>{version.message}</Text>
                    {version.id === currentVersion && (
                      <Tag color="green">{t('strategy.version.current')}</Tag>
                    )}
                  </Space>
                }
                description={
                  <Space>
                    <ClockCircleOutlined />
                    {formatTime(version.timestamp)}
                    <Text type="secondary">by {version.author}</Text>
                    <Tag color="blue">+{version.changes.added}</Tag>
                    <Tag color="red">-{version.changes.removed}</Tag>
                    <Tag color="orange">±{version.changes.modified}</Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={t('strategy.version.diff')}
        open={diffModalVisible}
        onCancel={() => setDiffModalVisible(false)}
        width={800}
        footer={null}
      >
        <DiffView>{diffContent}</DiffView>
      </Modal>
    </Space>
  );
};

export default VersionManager; 
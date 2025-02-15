import React from 'react';
import { Card, Button, Space, Statistic, Alert } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useI18n } from '@/utils/i18n';
import { cacheService } from '@/services/cacheService';
import { showSuccess } from '@/utils/notification';
import styled from 'styled-components';

const SettingItem = styled.div`
  margin-bottom: 24px;
`;

const CacheSettings: React.FC = () => {
  const { t } = useI18n();

  const handleClearCache = () => {
    cacheService.clear();
    showSuccess(t('settings.cacheClearSuccess'));
  };

  const handleClearExpiredCache = () => {
    cacheService.clearExpired();
    showSuccess(t('settings.expiredCacheClearSuccess'));
  };

  return (
    <Card title={t('settings.cacheManagement')}>
      <Alert
        message={t('settings.cacheWarning')}
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <SettingItem>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearCache}
          >
            {t('settings.clearAllCache')}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleClearExpiredCache}
          >
            {t('settings.clearExpiredCache')}
          </Button>
        </Space>
      </SettingItem>
    </Card>
  );
};

export default CacheSettings;
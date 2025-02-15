import React from 'react';
import { Card, Form, Switch, Select, Space, Button, Divider } from 'antd';
import { useThemeStore } from '@/stores/themeStore';
import { useLocaleStore, LocaleType } from '@/stores/localeStore';
import { useI18n } from '@/utils/i18n';
import { useCache } from '@/hooks/useCache';
import styled from 'styled-components';

const { Option } = Select;

const SettingItem = styled.div`
  margin-bottom: 24px;
  
  .setting-label {
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .setting-description {
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 12px;
  }
`;

const SystemSettings: React.FC = () => {
  const themeStore = useThemeStore();
  const localeStore = useLocaleStore();
  const { t } = useI18n();
  
  const [settings, setSettings] = useCache({
    key: 'system_settings',
    initialValue: {
      notifications: {
        email: true,
        browser: true,
        sound: true,
      },
      performance: {
        animations: true,
        autoRefresh: true,
      },
    },
  });

  const handleNotificationChange = (type: string, checked: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: checked,
      },
    });
  };

  const handlePerformanceChange = (type: string, checked: boolean) => {
    setSettings({
      ...settings,
      performance: {
        ...settings.performance,
        [type]: checked,
      },
    });
  };

  return (
    <Card title={t('settings.systemSettings')}>
      <SettingItem>
        <div className="setting-label">{t('settings.theme')}</div>
        <div className="setting-description">
          {t('settings.themeDescription')}
        </div>
        <Switch
          checked={themeStore.mode === 'dark'}
          onChange={(checked) => themeStore.setTheme(checked ? 'dark' : 'light')}
          checkedChildren={t('settings.darkMode')}
          unCheckedChildren={t('settings.lightMode')}
        />
      </SettingItem>

      <Divider />

      <SettingItem>
        <div className="setting-label">{t('settings.language')}</div>
        <div className="setting-description">
          {t('settings.languageDescription')}
        </div>
        <Select
          value={localeStore.currentLocale}
          onChange={(value: LocaleType) => localeStore.setLocale(value)}
          style={{ width: 200 }}
        >
          <Option value="zh-CN">简体中文</Option>
          <Option value="en-US">English</Option>
        </Select>
      </SettingItem>

      <Divider />

      <SettingItem>
        <div className="setting-label">{t('settings.notifications')}</div>
        <div className="setting-description">
          {t('settings.notificationsDescription')}
        </div>
        <Space direction="vertical">
          <Switch
            checked={settings.notifications.email}
            onChange={(checked) => handleNotificationChange('email', checked)}
            checkedChildren={t('settings.emailNotifications')}
            unCheckedChildren={t('settings.emailNotifications')}
          />
          <Switch
            checked={settings.notifications.browser}
            onChange={(checked) => handleNotificationChange('browser', checked)}
            checkedChildren={t('settings.browserNotifications')}
            unCheckedChildren={t('settings.browserNotifications')}
          />
          <Switch
            checked={settings.notifications.sound}
            onChange={(checked) => handleNotificationChange('sound', checked)}
            checkedChildren={t('settings.soundNotifications')}
            unCheckedChildren={t('settings.soundNotifications')}
          />
        </Space>
      </SettingItem>

      <Divider />

      <SettingItem>
        <div className="setting-label">{t('settings.performance')}</div>
        <div className="setting-description">
          {t('settings.performanceDescription')}
        </div>
        <Space direction="vertical">
          <Switch
            checked={settings.performance.animations}
            onChange={(checked) => handlePerformanceChange('animations', checked)}
            checkedChildren={t('settings.enableAnimations')}
            unCheckedChildren={t('settings.enableAnimations')}
          />
          <Switch
            checked={settings.performance.autoRefresh}
            onChange={(checked) => handlePerformanceChange('autoRefresh', checked)}
            checkedChildren={t('settings.autoRefresh')}
            unCheckedChildren={t('settings.autoRefresh')}
          />
        </Space>
      </SettingItem>
    </Card>
  );
};

export default SystemSettings;
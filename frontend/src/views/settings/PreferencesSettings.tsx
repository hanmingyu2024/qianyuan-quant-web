import * as React from 'react';
import { Card, Form, Switch, InputNumber, Select, Space, Divider } from 'antd';
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

interface UserPreferences {
  trading: {
    defaultOrderSize: number;
    confirmOrders: boolean;
    showPnL: boolean;
  };
  display: {
    chartStyle: 'candlestick' | 'line';
    timeFormat: '12h' | '24h';
    decimalPlaces: number;
  };
  alerts: {
    priceAlerts: boolean;
    orderAlerts: boolean;
    newsAlerts: boolean;
  };
}

const PreferencesSettings: React.FC = () => {
  const { t } = useI18n();
  
  const [preferences, setPreferences] = useCache<UserPreferences>({
    key: 'user_preferences',
    initialValue: {
      trading: {
        defaultOrderSize: 1,
        confirmOrders: true,
        showPnL: true,
      },
      display: {
        chartStyle: 'candlestick',
        timeFormat: '24h',
        decimalPlaces: 2,
      },
      alerts: {
        priceAlerts: true,
        orderAlerts: true,
        newsAlerts: false,
      },
    },
  });

  const handleTradingChange = (key: string, value: any) => {
    setPreferences({
      ...preferences,
      trading: {
        ...preferences.trading,
        [key]: value,
      },
    });
  };

  const handleDisplayChange = (key: string, value: any) => {
    setPreferences({
      ...preferences,
      display: {
        ...preferences.display,
        [key]: value,
      },
    });
  };

  const handleAlertChange = (key: string, value: boolean) => {
    setPreferences({
      ...preferences,
      alerts: {
        ...preferences.alerts,
        [key]: value,
      },
    });
  };

  return (
    <Card title={t('settings.preferences')}>
      <SettingItem>
        <div className="setting-label">{t('settings.tradingPreferences')}</div>
        <div className="setting-description">
          {t('settings.tradingPreferencesDescription')}
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label={t('settings.defaultOrderSize')}>
            <InputNumber
              value={preferences.trading.defaultOrderSize}
              onChange={(value) => handleTradingChange('defaultOrderSize', value)}
              min={0.01}
              step={0.01}
            />
          </Form.Item>
          <Switch
            checked={preferences.trading.confirmOrders}
            onChange={(checked) => handleTradingChange('confirmOrders', checked)}
            checkedChildren={t('settings.confirmOrders')}
            unCheckedChildren={t('settings.confirmOrders')}
          />
          <Switch
            checked={preferences.trading.showPnL}
            onChange={(checked) => handleTradingChange('showPnL', checked)}
            checkedChildren={t('settings.showPnL')}
            unCheckedChildren={t('settings.showPnL')}
          />
        </Space>
      </SettingItem>

      <Divider />

      <SettingItem>
        <div className="setting-label">{t('settings.displayPreferences')}</div>
        <div className="setting-description">
          {t('settings.displayPreferencesDescription')}
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label={t('settings.chartStyle')}>
            <Select
              value={preferences.display.chartStyle}
              onChange={(value) => handleDisplayChange('chartStyle', value)}
              style={{ width: 200 }}
            >
              <Option value="candlestick">{t('settings.candlestick')}</Option>
              <Option value="line">{t('settings.line')}</Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('settings.timeFormat')}>
            <Select
              value={preferences.display.timeFormat}
              onChange={(value) => handleDisplayChange('timeFormat', value)}
              style={{ width: 200 }}
            >
              <Option value="12h">12h</Option>
              <Option value="24h">24h</Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('settings.decimalPlaces')}>
            <InputNumber
              value={preferences.display.decimalPlaces}
              onChange={(value) => handleDisplayChange('decimalPlaces', value)}
              min={0}
              max={8}
            />
          </Form.Item>
        </Space>
      </SettingItem>

      <Divider />

      <SettingItem>
        <div className="setting-label">{t('settings.alertPreferences')}</div>
        <div className="setting-description">
          {t('settings.alertPreferencesDescription')}
        </div>
        <Space direction="vertical">
          <Switch
            checked={preferences.alerts.priceAlerts}
            onChange={(checked) => handleAlertChange('priceAlerts', checked)}
            checkedChildren={t('settings.priceAlerts')}
            unCheckedChildren={t('settings.priceAlerts')}
          />
          <Switch
            checked={preferences.alerts.orderAlerts}
            onChange={(checked) => handleAlertChange('orderAlerts', checked)}
            checkedChildren={t('settings.orderAlerts')}
            unCheckedChildren={t('settings.orderAlerts')}
          />
          <Switch
            checked={preferences.alerts.newsAlerts}
            onChange={(checked) => handleAlertChange('newsAlerts', checked)}
            checkedChildren={t('settings.newsAlerts')}
            unCheckedChildren={t('settings.newsAlerts')}
          />
        </Space>
      </SettingItem>
    </Card>
  );
};

export default PreferencesSettings;
import React from 'react';
import { Card, Tabs, DatePicker, Space, Button } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import MarketAnalysis from './MarketAnalysis';
import SignalAnalysis from './SignalAnalysis';
import FactorAnalysis from './FactorAnalysis';
import CorrelationAnalysis from './CorrelationAnalysis';

const { RangePicker } = DatePicker;

interface DataAnalysisProps {
  data: {
    market: any;
    signals: any;
    factors: any;
    correlation: any;
  };
  loading?: boolean;
  onTimeRangeChange?: (range: [number, number]) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

const DataAnalysis: React.FC<DataAnalysisProps> = ({
  data,
  loading,
  onTimeRangeChange,
  onRefresh,
  onExport,
}) => {
  const { t } = useTranslation();

  const handleTimeRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      onTimeRangeChange?.([dates[0].valueOf(), dates[1].valueOf()]);
    }
  };

  return (
    <Card
      title={t('analysis.title')}
      extra={
        <Space>
          <RangePicker onChange={handleTimeRangeChange} />
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
          >
            {t('common.refresh')}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={onExport}
          >
            {t('common.export')}
          </Button>
        </Space>
      }
    >
      <Tabs
        items={[
          {
            key: 'market',
            label: t('analysis.market.title'),
            children: <MarketAnalysis data={data.market} />,
          },
          {
            key: 'signals',
            label: t('analysis.signals.title'),
            children: <SignalAnalysis data={data.signals} />,
          },
          {
            key: 'factors',
            label: t('analysis.factors.title'),
            children: <FactorAnalysis data={data.factors} />,
          },
          {
            key: 'correlation',
            label: t('analysis.correlation.title'),
            children: <CorrelationAnalysis data={data.correlation} />,
          },
        ]}
      />
    </Card>
  );
};

export default DataAnalysis; 
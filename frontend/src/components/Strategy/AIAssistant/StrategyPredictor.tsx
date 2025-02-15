import React from 'react';
import { Card, Row, Col, Statistic, Progress, Alert, Space, Divider, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { LineChartOutlined, WarningOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const StyledCard = styled(Card)`
  .ant-statistic {
    margin-bottom: 16px;
  }
`;

interface RiskFactor {
  name: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

interface MarketCondition {
  name: string;
  suitability: number;
  description: string;
}

interface PerformancePrediction {
  expectedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  riskFactors: RiskFactor[];
  marketConditions: MarketCondition[];
}

interface StrategyPredictorProps {
  prediction: PerformancePrediction;
}

const StrategyPredictor: React.FC<StrategyPredictorProps> = ({
  prediction,
}) => {
  const { t } = useTranslation();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  return (
    <StyledCard title={t('ai.predictor.title')}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title={t('ai.predictor.expectedReturn')}
            value={prediction.expectedReturn}
            suffix="%"
            precision={2}
            prefix={<LineChartOutlined />}
          />
          <Progress
            percent={Math.min(prediction.expectedReturn, 100)}
            status={prediction.expectedReturn >= 0 ? 'success' : 'exception'}
            showInfo={false}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('ai.predictor.sharpeRatio')}
            value={prediction.sharpeRatio}
            precision={2}
            prefix={<SafetyCertificateOutlined />}
          />
          <Progress
            percent={Math.min(prediction.sharpeRatio * 20, 100)}
            status={prediction.sharpeRatio >= 1 ? 'success' : 'normal'}
            showInfo={false}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('ai.predictor.maxDrawdown')}
            value={prediction.maxDrawdown}
            suffix="%"
            precision={2}
            prefix={<WarningOutlined />}
          />
          <Progress
            percent={Math.min(Math.abs(prediction.maxDrawdown), 100)}
            status={Math.abs(prediction.maxDrawdown) <= 20 ? 'success' : 'exception'}
            showInfo={false}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('ai.predictor.winRate')}
            value={prediction.winRate}
            suffix="%"
            precision={2}
          />
          <Progress
            percent={prediction.winRate}
            status={prediction.winRate >= 50 ? 'success' : 'normal'}
            showInfo={false}
          />
        </Col>
      </Row>

      <Divider>{t('ai.predictor.riskAnalysis')}</Divider>

      <Space direction="vertical" style={{ width: '100%' }}>
        {prediction.riskFactors.map((factor, index) => (
          <Alert
            key={index}
            message={factor.name}
            description={
              <>
                <div>{factor.description}</div>
                <div style={{ marginTop: 8 }}>
                  <strong>{t('ai.predictor.mitigation')}:</strong> {factor.mitigation}
                </div>
              </>
            }
            type={getRiskColor(factor.level)}
            showIcon
          />
        ))}
      </Space>

      <Divider>{t('ai.predictor.marketSuitability')}</Divider>

      <Table
        dataSource={prediction.marketConditions}
        columns={[
          {
            title: t('ai.predictor.condition'),
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: t('ai.predictor.suitability'),
            dataIndex: 'suitability',
            key: 'suitability',
            render: (value: number) => (
              <Space>
                <Progress
                  percent={value}
                  size="small"
                  strokeColor={getSuitabilityColor(value)}
                />
                <span>{formatPercent(value)}</span>
              </Space>
            ),
          },
          {
            title: t('ai.predictor.description'),
            dataIndex: 'description',
            key: 'description',
          },
        ]}
        pagination={false}
      />
    </StyledCard>
  );
};

export default StrategyPredictor; 
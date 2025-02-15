import React from 'react';
import { Card, Row, Col, Progress, Alert, Space, Divider, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const StyledCard = styled(Card)`
  .ant-progress {
    margin-bottom: 16px;
  }
`;

interface MarketCondition {
  type: string;
  adaptability: number;
  description: string;
  recommendations: string[];
}

interface MarketFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number;
  description: string;
}

interface AdaptabilityAnalysis {
  overallScore: number;
  marketConditions: MarketCondition[];
  marketFactors: MarketFactor[];
  recommendations: string[];
}

interface MarketAdaptabilityProps {
  analysis: AdaptabilityAnalysis;
}

const MarketAdaptability: React.FC<MarketAdaptabilityProps> = ({
  analysis,
}) => {
  const { t } = useTranslation();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return '#52c41a';
      case 'negative': return '#ff4d4f';
      default: return '#faad14';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  return (
    <StyledCard title={t('ai.adaptability.title')}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Progress
              type="dashboard"
              percent={analysis.overallScore}
              strokeColor={getScoreColor(analysis.overallScore)}
              format={percent => (
                <div>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{percent}</div>
                  <div style={{ fontSize: 12 }}>{t('ai.adaptability.overallScore')}</div>
                </div>
              )}
            />
          </div>
        </Col>
      </Row>

      <Divider>{t('ai.adaptability.marketConditions')}</Divider>

      <Space direction="vertical" style={{ width: '100%' }}>
        {analysis.marketConditions.map((condition, index) => (
          <Card key={index} size="small">
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <h4>{condition.type}</h4>
                <p>{condition.description}</p>
              </Col>
              <Col flex="none">
                <Progress
                  type="circle"
                  percent={condition.adaptability}
                  width={60}
                  strokeColor={getScoreColor(condition.adaptability)}
                />
              </Col>
            </Row>
            {condition.recommendations.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <strong>{t('ai.adaptability.recommendations')}:</strong>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {condition.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </Space>

      <Divider>{t('ai.adaptability.marketFactors')}</Divider>

      <Table
        dataSource={analysis.marketFactors}
        columns={[
          {
            title: t('ai.adaptability.factor'),
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: t('ai.adaptability.impact'),
            dataIndex: 'impact',
            key: 'impact',
            render: (impact: string) => (
              <Alert
                message={t(`ai.adaptability.impacts.${impact}`)}
                type={impact === 'positive' ? 'success' : impact === 'negative' ? 'error' : 'warning'}
                style={{ padding: '0 8px' }}
              />
            ),
          },
          {
            title: t('ai.adaptability.strength'),
            dataIndex: 'strength',
            key: 'strength',
            render: (strength: number) => (
              <Progress
                percent={strength}
                size="small"
                strokeColor={getScoreColor(strength)}
              />
            ),
          },
          {
            title: t('ai.adaptability.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
          },
        ]}
        pagination={false}
      />

      <Divider>{t('ai.adaptability.recommendations')}</Divider>

      <Space direction="vertical" style={{ width: '100%' }}>
        {analysis.recommendations.map((recommendation, index) => (
          <Alert
            key={index}
            message={recommendation}
            type="info"
            showIcon
          />
        ))}
      </Space>
    </StyledCard>
  );
};

export default MarketAdaptability; 
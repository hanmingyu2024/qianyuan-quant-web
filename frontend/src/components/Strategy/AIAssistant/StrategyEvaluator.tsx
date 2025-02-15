import * as React from 'react';
import { Card, Collapse, Space, Tag, Typography, Progress, Descriptions, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { CheckCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { Panel } = Collapse;
const { Text, Title } = Typography;

const StyledCard = styled(Card)`
  .ant-collapse {
    background: transparent;
    border: none;
  }
  
  .ant-collapse-item {
    margin-bottom: 8px;
    border: 1px solid ${props => props.theme.colorBorder};
    border-radius: 8px !important;
    overflow: hidden;
  }
`;

interface EvaluationResult {
  score: number;
  robustness: {
    score: number;
    factors: Array<{
      name: string;
      score: number;
      description: string;
    }>;
  };
  reliability: {
    score: number;
    metrics: Array<{
      name: string;
      value: number;
      benchmark: number;
      status: 'good' | 'warning' | 'danger';
    }>;
  };
  risks: Array<{
    type: string;
    level: 'low' | 'medium' | 'high';
    description: string;
    suggestions: string[];
  }>;
}

interface StrategyEvaluatorProps {
  result: EvaluationResult;
}

const StrategyEvaluator: React.FC<StrategyEvaluatorProps> = ({
  result,
}) => {
  const { t } = useTranslation();

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  return (
    <StyledCard title={t('ai.evaluation.title')}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Progress
            type="circle"
            percent={result.score}
            format={percent => (
              <Title level={3} style={{ color: getScoreColor(result.score) }}>
                {percent}
              </Title>
            )}
          />
        </div>

        <Collapse defaultActiveKey={['robustness', 'reliability', 'risks']}>
          <Panel
            header={
              <Space>
                <CheckCircleOutlined />
                {t('ai.evaluation.robustness')}
                <Tag color={getScoreColor(result.robustness.score)}>
                  {formatNumber(result.robustness.score, 0)}
                </Tag>
              </Space>
            }
            key="robustness"
          >
            {result.robustness.factors.map((factor, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <Space align="start">
                  <Progress
                    type="circle"
                    percent={factor.score}
                    width={40}
                    format={percent => (
                      <Text style={{ fontSize: 12 }}>{percent}</Text>
                    )}
                  />
                  <div>
                    <Text strong>{factor.name}</Text>
                    <br />
                    <Text type="secondary">{factor.description}</Text>
                  </div>
                </Space>
              </div>
            ))}
          </Panel>

          <Panel
            header={
              <Space>
                <InfoCircleOutlined />
                {t('ai.evaluation.reliability')}
                <Tag color={getScoreColor(result.reliability.score)}>
                  {formatNumber(result.reliability.score, 0)}
                </Tag>
              </Space>
            }
            key="reliability"
          >
            <Descriptions column={1}>
              {result.reliability.metrics.map((metric, index) => (
                <Descriptions.Item
                  key={index}
                  label={metric.name}
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  <Space>
                    <Text>{formatNumber(metric.value, 2)}</Text>
                    <Text type="secondary">
                      ({t('ai.evaluation.benchmark')}: {formatNumber(metric.benchmark, 2)})
                    </Text>
                    <Tag color={
                      metric.status === 'good' ? 'success' :
                      metric.status === 'warning' ? 'warning' : 'error'
                    }>
                      {t(`ai.evaluation.status.${metric.status}`)}
                    </Tag>
                  </Space>
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Panel>

          <Panel
            header={
              <Space>
                <WarningOutlined />
                {t('ai.evaluation.risks')}
                <Tag color="red">
                  {result.risks.length}
                </Tag>
              </Space>
            }
            key="risks"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {result.risks.map((risk, index) => (
                <Alert
                  key={index}
                  message={
                    <Space>
                      <Text strong>{risk.type}</Text>
                      <Tag color={
                        risk.level === 'high' ? 'red' :
                        risk.level === 'medium' ? 'orange' : 'green'
                      }>
                        {t(`ai.evaluation.riskLevels.${risk.level}`)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <>
                      <div>{risk.description}</div>
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{t('ai.evaluation.suggestions')}:</Text>
                        <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                          {risk.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  }
                  type={
                    risk.level === 'high' ? 'error' :
                    risk.level === 'medium' ? 'warning' : 'info'
                  }
                  showIcon
                />
              ))}
            </Space>
          </Panel>
        </Collapse>
      </Space>
    </StyledCard>
  );
};

export default StrategyEvaluator; 
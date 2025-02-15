import React from 'react';
import { Card, Steps, Collapse, Alert, Space, Button, Tag, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  BulbOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { Step } = Steps;
const { Panel } = Collapse;

const StyledCard = styled(Card)`
  .ant-steps {
    margin-bottom: 24px;
  }
  
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

interface ParameterSuggestion {
  name: string;
  currentValue: number;
  suggestedValue: number;
  impact: number;
  reason: string;
}

interface LogicSuggestion {
  type: string;
  description: string;
  expectedImprovement: number;
  complexity: 'low' | 'medium' | 'high';
  code?: string;
}

interface RiskSuggestion {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  solution: string;
  impact: number;
}

interface OptimizationSuggestions {
  parameters: ParameterSuggestion[];
  logic: LogicSuggestion[];
  risks: RiskSuggestion[];
  expectedImprovement: number;
}

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestions;
  onApply: (type: string, suggestion: any) => void;
}

const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({
  suggestions,
  onApply,
}) => {
  const { t } = useTranslation();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return '#52c41a';
      case 'medium': return '#faad14';
      case 'high': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  return (
    <StyledCard
      title={
        <Space>
          <BulbOutlined />
          {t('ai.optimization.suggestions')}
          <Tag color="blue">
            +{formatPercent(suggestions.expectedImprovement)}
          </Tag>
        </Space>
      }
    >
      <Steps progressDot current={-1}>
        <Step
          title={t('ai.optimization.parameters')}
          description={`${suggestions.parameters.length} ${t('ai.optimization.suggestions')}`}
        />
        <Step
          title={t('ai.optimization.logic')}
          description={`${suggestions.logic.length} ${t('ai.optimization.suggestions')}`}
        />
        <Step
          title={t('ai.optimization.risks')}
          description={`${suggestions.risks.length} ${t('ai.optimization.issues')}`}
        />
      </Steps>

      <Collapse defaultActiveKey={['parameters', 'logic', 'risks']}>
        <Panel
          header={
            <Space>
              <CheckCircleOutlined />
              {t('ai.optimization.parameters')}
            </Space>
          }
          key="parameters"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {suggestions.parameters.map((suggestion, index) => (
              <Card key={index} size="small">
                <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <h4>{suggestion.name}</h4>
                    <p>{suggestion.reason}</p>
                    <Space>
                      <Tag>{t('ai.optimization.current')}: {formatNumber(suggestion.currentValue, 4)}</Tag>
                      <ArrowRightOutlined />
                      <Tag color="blue">{t('ai.optimization.suggested')}: {formatNumber(suggestion.suggestedValue, 4)}</Tag>
                    </Space>
                  </div>
                  <Space direction="vertical" align="end">
                    <Tag color={suggestion.impact >= 0 ? 'success' : 'error'}>
                      {suggestion.impact >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {formatPercent(Math.abs(suggestion.impact))}
                    </Tag>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => onApply('parameter', suggestion)}
                    >
                      {t('ai.optimization.apply')}
                    </Button>
                  </Space>
                </Space>
              </Card>
            ))}
          </Space>
        </Panel>

        <Panel
          header={
            <Space>
              <BulbOutlined />
              {t('ai.optimization.logic')}
            </Space>
          }
          key="logic"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {suggestions.logic.map((suggestion, index) => (
              <Card key={index} size="small">
                <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <h4>{suggestion.type}</h4>
                    <p>{suggestion.description}</p>
                    <Space>
                      <Tooltip title={t('ai.optimization.complexity')}>
                        <Tag color={getComplexityColor(suggestion.complexity)}>
                          {t(`ai.optimization.complexityLevels.${suggestion.complexity}`)}
                        </Tag>
                      </Tooltip>
                    </Space>
                  </div>
                  <Space direction="vertical" align="end">
                    <Tag color="success">
                      <ArrowUpOutlined />
                      {formatPercent(suggestion.expectedImprovement)}
                    </Tag>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => onApply('logic', suggestion)}
                    >
                      {t('ai.optimization.apply')}
                    </Button>
                  </Space>
                </Space>
              </Card>
            ))}
          </Space>
        </Panel>

        <Panel
          header={
            <Space>
              <ExclamationCircleOutlined />
              {t('ai.optimization.risks')}
            </Space>
          }
          key="risks"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {suggestions.risks.map((suggestion, index) => (
              <Alert
                key={index}
                message={
                  <Space>
                    <span>{suggestion.issue}</span>
                    <Tag color={getSeverityColor(suggestion.severity)}>
                      {t(`ai.optimization.severityLevels.${suggestion.severity}`)}
                    </Tag>
                  </Space>
                }
                description={
                  <>
                    <div>{suggestion.solution}</div>
                    <div style={{ marginTop: 8 }}>
                      <Space>
                        <Tag color="blue">
                          {t('ai.optimization.impact')}: {formatPercent(suggestion.impact)}
                        </Tag>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => onApply('risk', suggestion)}
                        >
                          {t('ai.optimization.apply')}
                        </Button>
                      </Space>
                    </div>
                  </>
                }
                type={getSeverityColor(suggestion.severity)}
                showIcon
              />
            ))}
          </Space>
        </Panel>
      </Collapse>
    </StyledCard>
  );
};

export default OptimizationSuggestions; 
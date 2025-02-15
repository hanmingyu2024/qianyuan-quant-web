import * as React from 'react';
import { Card, Space, Table, Tag, Button, Collapse, Progress, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import { LineChartOutlined, BulbOutlined, WarningOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { Panel } = Collapse;

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

interface BacktestResult {
  returns: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  trades: number;
}

interface BacktestAnalysis {
  performance: {
    score: number;
    strengths: string[];
    weaknesses: string[];
  };
  risks: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    suggestions: string[];
  };
  optimization: {
    parameters: Array<{
      name: string;
      current: number;
      suggested: number;
      reason: string;
    }>;
    expectedImprovement: number;
  };
}

interface BacktestAnalyzerProps {
  backtestResult: BacktestResult;
  onAnalyze: () => void;
  loading?: boolean;
}

const BacktestAnalyzer: React.FC<BacktestAnalyzerProps> = ({
  backtestResult,
  onAnalyze,
  loading,
}) => {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = React.useState<BacktestAnalysis | null>(null);

  const handleAnalyze = async () => {
    try {
      const prompt = `
Analyze the backtest results:
- Returns: ${backtestResult.returns}
- Sharpe Ratio: ${backtestResult.sharpeRatio}
- Max Drawdown: ${backtestResult.maxDrawdown}
- Win Rate: ${backtestResult.winRate}
- Profit Factor: ${backtestResult.profitFactor}
- Number of Trades: ${backtestResult.trades}

Please provide:
1. Performance analysis
2. Risk assessment
3. Strategy optimization suggestions
      `;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'codellama',
          prompt,
          stream: false,
        }),
      });

      const data = await response.json();
      const analysisResult = JSON.parse(data.response);
      setAnalysis(analysisResult);
      onAnalyze();
    } catch (error) {
      console.error('Error analyzing backtest:', error);
    }
  };

  return (
    <StyledCard
      title={t('ai.backtest.title')}
      extra={
        <Button
          type="primary"
          icon={<BulbOutlined />}
          onClick={handleAnalyze}
          loading={loading}
        >
          {t('ai.backtest.analyze')}
        </Button>
      }
    >
      {analysis && (
        <Collapse defaultActiveKey={['performance', 'risks', 'optimization']}>
          <Panel
            header={
              <Space>
                <LineChartOutlined />
                {t('ai.backtest.performance')}
                <Tag color="blue">{formatNumber(analysis.performance.score, 0)}</Tag>
              </Space>
            }
            key="performance"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t('ai.backtest.strengths')}:</Text>
                <ul>
                  {analysis.performance.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Text strong>{t('ai.backtest.weaknesses')}:</Text>
                <ul>
                  {analysis.performance.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </Space>
          </Panel>

          <Panel
            header={
              <Space>
                <WarningOutlined />
                {t('ai.backtest.risks')}
                <Tag color={
                  analysis.risks.level === 'high' ? 'red' :
                  analysis.risks.level === 'medium' ? 'orange' : 'green'
                }>
                  {t(`ai.backtest.riskLevels.${analysis.risks.level}`)}
                </Tag>
              </Space>
            }
            key="risks"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>{t('ai.backtest.riskFactors')}:</Text>
                <ul>
                  {analysis.risks.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Text strong>{t('ai.backtest.suggestions')}:</Text>
                <ul>
                  {analysis.risks.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </Space>
          </Panel>

          <Panel
            header={
              <Space>
                <BulbOutlined />
                {t('ai.backtest.optimization')}
                <Tag color="green">+{formatPercent(analysis.optimization.expectedImprovement)}</Tag>
              </Space>
            }
            key="optimization"
          >
            <Table
              dataSource={analysis.optimization.parameters}
              columns={[
                {
                  title: t('ai.backtest.parameter'),
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: t('ai.backtest.current'),
                  dataIndex: 'current',
                  key: 'current',
                  render: (value) => formatNumber(value, 4),
                },
                {
                  title: t('ai.backtest.suggested'),
                  dataIndex: 'suggested',
                  key: 'suggested',
                  render: (value) => formatNumber(value, 4),
                },
                {
                  title: t('ai.backtest.reason'),
                  dataIndex: 'reason',
                  key: 'reason',
                },
              ]}
              pagination={false}
            />
          </Panel>
        </Collapse>
      )}
    </StyledCard>
  );
};

export default BacktestAnalyzer; 
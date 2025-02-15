import React from 'react';
import { Tabs, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  RobotOutlined,
  LineChartOutlined,
  SettingOutlined,
  ExperimentOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAI } from '@/contexts/AIContext';
import ModelSelector from './ModelSelector';
import ModelManager from './ModelManager';
import CodeEditor from './CodeEditor';
import MarketAnalyzer from './MarketAnalyzer';
import StrategyTuner from './StrategyTuner';
import StrategyEvaluator from './StrategyEvaluator';
import StrategyGenerator from './StrategyGenerator';
import StrategyPredictor from './StrategyPredictor';

const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  .ant-tabs-nav {
    margin-bottom: 16px;
  }
`;

const AIAssistant: React.FC = () => {
  const { t } = useTranslation();
  const {
    models,
    selectedModel,
    setSelectedModel,
    loading,
    generateStrategy,
    analyzeMarket,
    optimizeStrategy,
    analyzePrediction,
  } = useAI();

  const [code, setCode] = React.useState('');
  const [analysis, setAnalysis] = React.useState(null);
  const [prediction, setPrediction] = React.useState<PerformancePrediction | null>(null);

  const handleGenerateStrategy = async (prompt: string) => {
    const generatedCode = await generateStrategy(prompt);
    setCode(generatedCode);
    const prediction = await analyzePrediction(generatedCode);
    setPrediction(prediction);
  };

  const handleAnalyzeMarket = async (data: any) => {
    const result = await analyzeMarket(data);
    setAnalysis(result);
  };

  return (
    <StyledCard>
      <Space direction="vertical" style={{ width: '100%' }}>
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
        />

        <Tabs defaultActiveKey="strategy">
          <TabPane
            tab={
              <span>
                <CodeOutlined />
                {t('ai.strategy.title')}
              </span>
            }
            key="strategy"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <StrategyGenerator
                onGenerate={handleGenerateStrategy}
                loading={loading}
              />
              <CodeEditor
                value={code}
                language="python"
                onChange={setCode}
              />
              {prediction && (
                <StrategyPredictor prediction={prediction} />
              )}
              <StrategyEvaluator result={analysis} />
            </Space>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                {t('ai.analysis.title')}
              </span>
            }
            key="analysis"
          >
            <MarketAnalyzer
              onAnalyze={handleAnalyzeMarket}
              loading={loading}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <ExperimentOutlined />
                {t('ai.tuner.title')}
              </span>
            }
            key="tuner"
          >
            <StrategyTuner
              parameters={[
                {
                  name: 'stopLoss',
                  value: 0.02,
                  min: 0.01,
                  max: 0.1,
                  step: 0.01,
                  description: t('ai.tuner.parameters.stopLossDesc'),
                },
                {
                  name: 'takeProfit',
                  value: 0.05,
                  min: 0.02,
                  max: 0.2,
                  step: 0.01,
                  description: t('ai.tuner.parameters.takeProfitDesc'),
                },
                // 添加更多参数...
              ]}
              onTune={optimizeStrategy}
              loading={loading}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                {t('ai.model.management')}
              </span>
            }
            key="management"
          >
            <ModelManager
              models={models}
              onAdd={() => {}}
              onUpdate={() => {}}
              onDelete={() => {}}
              onDownload={() => {}}
            />
          </TabPane>
        </Tabs>
      </Space>
    </StyledCard>
  );
};

export default AIAssistant; 
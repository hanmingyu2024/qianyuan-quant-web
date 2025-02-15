import React from 'react';
import { Card, Form, Select, Input, Button, Space, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { RobotOutlined, CodeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatPrompt } from '@/utils/ai';

const { Option } = Select;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  parameters: Array<{
    name: string;
    label: string;
    type: 'string' | 'number' | 'select';
    options?: string[];
    default?: any;
  }>;
}

const strategyTemplates: StrategyTemplate[] = [
  {
    id: 'ma_crossover',
    name: 'Moving Average Crossover',
    description: 'A strategy based on moving average crossover signals',
    template: `
Generate a trading strategy with the following specifications:
- Strategy Type: Moving Average Crossover
- Trading Pairs: \${pairs}
- Timeframe: \${timeframe}
- Fast MA Period: \${fastPeriod}
- Slow MA Period: \${slowPeriod}
- Risk Management:
  * Stop Loss: \${stopLoss}%
  * Take Profit: \${takeProfit}%
Additional Requirements:
\${requirements}
    `,
    parameters: [
      {
        name: 'pairs',
        label: 'Trading Pairs',
        type: 'select',
        options: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
      },
      {
        name: 'timeframe',
        label: 'Timeframe',
        type: 'select',
        options: ['1m', '5m', '15m', '1h', '4h', '1d'],
      },
      {
        name: 'fastPeriod',
        label: 'Fast MA Period',
        type: 'number',
        default: 10,
      },
      {
        name: 'slowPeriod',
        label: 'Slow MA Period',
        type: 'number',
        default: 20,
      },
      {
        name: 'stopLoss',
        label: 'Stop Loss (%)',
        type: 'number',
        default: 2,
      },
      {
        name: 'takeProfit',
        label: 'Take Profit (%)',
        type: 'number',
        default: 4,
      },
    ],
  },
  {
    id: 'rsi_strategy',
    name: 'RSI Strategy',
    description: 'A strategy based on RSI overbought/oversold signals',
    template: `
Generate a trading strategy with the following specifications:
- Strategy Type: RSI Trading
- Trading Pairs: \${pairs}
- Timeframe: \${timeframe}
- RSI Period: \${rsiPeriod}
- Overbought Level: \${overbought}
- Oversold Level: \${oversold}
- Risk Management:
  * Stop Loss: \${stopLoss}%
  * Take Profit: \${takeProfit}%
Additional Requirements:
\${requirements}
    `,
    parameters: [
      {
        name: 'pairs',
        label: 'Trading Pairs',
        type: 'select',
        options: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
      },
      {
        name: 'timeframe',
        label: 'Timeframe',
        type: 'select',
        options: ['1m', '5m', '15m', '1h', '4h', '1d'],
      },
      {
        name: 'rsiPeriod',
        label: 'RSI Period',
        type: 'number',
        default: 14,
      },
      {
        name: 'overbought',
        label: 'Overbought Level',
        type: 'number',
        default: 70,
      },
      {
        name: 'oversold',
        label: 'Oversold Level',
        type: 'number',
        default: 30,
      },
      {
        name: 'stopLoss',
        label: 'Stop Loss (%)',
        type: 'number',
        default: 2,
      },
      {
        name: 'takeProfit',
        label: 'Take Profit (%)',
        type: 'number',
        default: 4,
      },
    ],
  },
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands Strategy',
    description: 'A strategy based on Bollinger Bands breakout and mean reversion',
    template: `
Generate a trading strategy with the following specifications:
- Strategy Type: Bollinger Bands Trading
- Trading Pairs: \${pairs}
- Timeframe: \${timeframe}
- BB Period: \${bbPeriod}
- BB Standard Deviation: \${bbStdDev}
- Mean Reversion Factor: \${meanReversionFactor}
- Risk Management:
  * Stop Loss: \${stopLoss}%
  * Take Profit: \${takeProfit}%
Additional Requirements:
\${requirements}
    `,
    parameters: [
      {
        name: 'pairs',
        label: 'Trading Pairs',
        type: 'select',
        options: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
      },
      {
        name: 'timeframe',
        label: 'Timeframe',
        type: 'select',
        options: ['1m', '5m', '15m', '1h', '4h', '1d'],
      },
      {
        name: 'bbPeriod',
        label: 'BB Period',
        type: 'number',
        default: 20,
      },
      {
        name: 'bbStdDev',
        label: 'BB Standard Deviation',
        type: 'number',
        default: 2,
      },
      {
        name: 'meanReversionFactor',
        label: 'Mean Reversion Factor',
        type: 'number',
        default: 0.5,
      },
      {
        name: 'stopLoss',
        label: 'Stop Loss (%)',
        type: 'number',
        default: 2,
      },
      {
        name: 'takeProfit',
        label: 'Take Profit (%)',
        type: 'number',
        default: 4,
      },
    ],
  },
  {
    id: 'macd_strategy',
    name: 'MACD Strategy',
    description: 'A strategy based on MACD crossover and divergence signals',
    template: `
Generate a trading strategy with the following specifications:
- Strategy Type: MACD Trading
- Trading Pairs: \${pairs}
- Timeframe: \${timeframe}
- Fast EMA: \${fastEMA}
- Slow EMA: \${slowEMA}
- Signal Period: \${signalPeriod}
- Divergence Threshold: \${divergenceThreshold}
- Risk Management:
  * Stop Loss: \${stopLoss}%
  * Take Profit: \${takeProfit}%
Additional Requirements:
\${requirements}
    `,
    parameters: [
      {
        name: 'pairs',
        label: 'Trading Pairs',
        type: 'select',
        options: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
      },
      {
        name: 'timeframe',
        label: 'Timeframe',
        type: 'select',
        options: ['1m', '5m', '15m', '1h', '4h', '1d'],
      },
      {
        name: 'fastEMA',
        label: 'Fast EMA Period',
        type: 'number',
        default: 12,
      },
      {
        name: 'slowEMA',
        label: 'Slow EMA Period',
        type: 'number',
        default: 26,
      },
      {
        name: 'signalPeriod',
        label: 'Signal Period',
        type: 'number',
        default: 9,
      },
      {
        name: 'divergenceThreshold',
        label: 'Divergence Threshold',
        type: 'number',
        default: 0.2,
      },
      {
        name: 'stopLoss',
        label: 'Stop Loss (%)',
        type: 'number',
        default: 2,
      },
      {
        name: 'takeProfit',
        label: 'Take Profit (%)',
        type: 'number',
        default: 4,
      },
    ],
  },
];

interface StrategyGeneratorProps {
  onGenerate: (prompt: string) => Promise<void>;
  loading?: boolean;
}

const StrategyGenerator: React.FC<StrategyGeneratorProps> = ({
  onGenerate,
  loading,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = React.useState<StrategyTemplate | null>(null);

  const handleTemplateChange = (templateId: string) => {
    const template = strategyTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    if (template) {
      const initialValues = Object.fromEntries(
        template.parameters.map(p => [p.name, p.default])
      );
      form.setFieldsValue(initialValues);
    }
  };

  const handleGenerate = async (values: any) => {
    if (!selectedTemplate) return;
    const prompt = formatPrompt(selectedTemplate.template, values);
    await onGenerate(prompt);
  };

  return (
    <StyledCard title={t('ai.strategy.title')}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleGenerate}
      >
        <Form.Item
          name="template"
          label={t('ai.strategy.type')}
          rules={[{ required: true }]}
        >
          <Select onChange={handleTemplateChange}>
            {strategyTemplates.map(template => (
              <Option key={template.id} value={template.id}>
                {template.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedTemplate && (
          <>
            <div style={{ marginBottom: 16 }}>
              {selectedTemplate.description}
            </div>

            {selectedTemplate.parameters.map(param => (
              <Form.Item
                key={param.name}
                name={param.name}
                label={param.label}
                rules={[{ required: true }]}
              >
                {param.type === 'select' ? (
                  <Select>
                    {param.options?.map(opt => (
                      <Option key={opt} value={opt}>{opt}</Option>
                    ))}
                  </Select>
                ) : param.type === 'number' ? (
                  <Input type="number" />
                ) : (
                  <Input />
                )}
              </Form.Item>
            ))}

            <Form.Item
              name="requirements"
              label={t('ai.strategy.requirements')}
            >
              <TextArea rows={4} placeholder={t('ai.strategy.requirementsPlaceholder')} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<RobotOutlined />}
                loading={loading}
                htmlType="submit"
                block
              >
                {t('ai.strategy.generate')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </StyledCard>
  );
};

export default StrategyGenerator; 
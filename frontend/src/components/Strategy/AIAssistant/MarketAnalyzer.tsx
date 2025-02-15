import React from 'react';
import { Form, Select, DatePicker, Button, Card, Space, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { LineChartOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent } from '@/utils/formatter';
import type { MarketAnalysis } from '@/types/ai';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

interface MarketAnalyzerProps {
  onAnalyze: (analysis: MarketAnalysis) => void;
  loading?: boolean;
}

const MarketAnalyzer: React.FC<MarketAnalyzerProps> = ({
  onAnalyze,
  loading,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();
  const [analysisResult, setAnalysisResult] = React.useState<any>(null);

  const handleAnalyze = async (values: {
    symbol: string;
    timeRange: [moment.Moment, moment.Moment];
    indicators: string[];
  }) => {
    try {
      const prompt = `
Analyze the market conditions for:
- Symbol: ${values.symbol}
- Time Range: ${values.timeRange.map(t => t.format('YYYY-MM-DD')).join(' to ')}
- Indicators: ${values.indicators.join(', ')}
Please provide:
1. Market trend analysis
2. Key support and resistance levels
3. Technical indicator signals
4. Volatility analysis
5. Trading volume analysis
6. Market sentiment analysis
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
      const analysis = JSON.parse(data.response);
      setAnalysisResult(analysis);
      onAnalyze(analysis);

      // 更新图表
      if (chartRef.current && analysis.chartData) {
        chartInstance.current = echarts.init(chartRef.current);
        const option = {
          tooltip: {
            trigger: 'axis',
          },
          legend: {
            data: ['Price', 'Volume', 'MA5', 'MA10', 'MA20'],
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'time',
          },
          yAxis: [
            {
              type: 'value',
              name: 'Price',
            },
            {
              type: 'value',
              name: 'Volume',
            },
          ],
          series: [
            {
              name: 'Price',
              type: 'line',
              data: analysis.chartData.price,
            },
            {
              name: 'Volume',
              type: 'bar',
              yAxisIndex: 1,
              data: analysis.chartData.volume,
            },
            {
              name: 'MA5',
              type: 'line',
              data: analysis.chartData.ma5,
            },
            {
              name: 'MA10',
              type: 'line',
              data: analysis.chartData.ma10,
            },
            {
              name: 'MA20',
              type: 'line',
              data: analysis.chartData.ma20,
            },
          ],
        };

        chartInstance.current.setOption(option);
      }
    } catch (error) {
      console.error('Error analyzing market:', error);
    }
  };

  React.useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  const columns = [
    {
      title: t('ai.analysis.indicator'),
      dataIndex: 'indicator',
      key: 'indicator',
    },
    {
      title: t('ai.analysis.signal'),
      dataIndex: 'signal',
      key: 'signal',
      render: (signal: string) => {
        const color = signal === 'buy' ? 'green' : signal === 'sell' ? 'red' : 'blue';
        return <Tag color={color}>{t(`ai.analysis.signals.${signal}`)}</Tag>;
      },
    },
    {
      title: t('ai.analysis.strength'),
      dataIndex: 'strength',
      key: 'strength',
      render: (strength: number) => formatPercent(strength),
    },
    {
      title: t('ai.analysis.description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAnalyze}
      >
        <Form.Item
          name="symbol"
          label={t('ai.analysis.symbol')}
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            placeholder={t('ai.analysis.symbolPlaceholder')}
          >
            <Option value="BTC/USDT">BTC/USDT</Option>
            <Option value="ETH/USDT">ETH/USDT</Option>
            <Option value="BNB/USDT">BNB/USDT</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="timeRange"
          label={t('ai.analysis.timeRange')}
          rules={[{ required: true }]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="indicators"
          label={t('ai.analysis.indicators')}
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            placeholder={t('ai.analysis.indicatorsPlaceholder')}
          >
            <Option value="MA">MA</Option>
            <Option value="RSI">RSI</Option>
            <Option value="MACD">MACD</Option>
            <Option value="Bollinger">Bollinger Bands</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<LineChartOutlined />}
            htmlType="submit"
            loading={loading}
          >
            {t('ai.analysis.analyze')}
          </Button>
        </Form.Item>
      </Form>

      {analysisResult && (
        <>
          <ChartContainer ref={chartRef} />
          <Card title={t('ai.analysis.signals')}>
            <Table
              columns={columns}
              dataSource={analysisResult.signals}
              rowKey="indicator"
              pagination={false}
            />
          </Card>
        </>
      )}
    </Space>
  );
};

export default MarketAnalyzer; 
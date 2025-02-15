import React from 'react';
import { Card, Row, Col, Select, Space, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts';
import styled from 'styled-components';
import { formatNumber, formatPercent } from '@/utils/formatter';

const { Option } = Select;

const StyledCard = styled(Card)`
  .sensitivity-chart {
    height: 400px;
    margin: 16px 0;
  }
`;

interface ParameterSensitivity {
  name: string;
  sensitivity: number;
  impact: 'high' | 'medium' | 'low';
  values: number[];
  returns: number[];
  sharpeRatios: number[];
  drawdowns: number[];
}

interface SensitivityAnalysisProps {
  parameters: ParameterSensitivity[];
  onParameterChange?: (param: string, value: number) => void;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  parameters,
  onParameterChange,
}) => {
  const { t } = useTranslation();
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();
  const [selectedParam, setSelectedParam] = React.useState<string>(parameters[0]?.name || '');

  React.useEffect(() => {
    if (!chartRef.current || !selectedParam) return;

    const param = parameters.find(p => p.name === selectedParam);
    if (!param) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['Returns', 'Sharpe Ratio', 'Max Drawdown'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: param.values.map(v => formatNumber(v, 4)),
        name: selectedParam,
      },
      yAxis: [
        {
          type: 'value',
          name: 'Returns / Drawdown (%)',
          axisLabel: {
            formatter: (value: number) => `${value}%`,
          },
        },
        {
          type: 'value',
          name: 'Sharpe Ratio',
        },
      ],
      series: [
        {
          name: 'Returns',
          type: 'line',
          data: param.returns.map(v => formatNumber(v * 100, 2)),
          smooth: true,
        },
        {
          name: 'Sharpe Ratio',
          type: 'line',
          yAxisIndex: 1,
          data: param.sharpeRatios.map(v => formatNumber(v, 2)),
          smooth: true,
        },
        {
          name: 'Max Drawdown',
          type: 'line',
          data: param.drawdowns.map(v => formatNumber(v * 100, 2)),
          smooth: true,
        },
      ],
    };

    chartInstance.current.setOption(option);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [selectedParam, parameters]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: t('ai.sensitivity.parameter'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('ai.sensitivity.sensitivity'),
      dataIndex: 'sensitivity',
      key: 'sensitivity',
      render: (value: number) => formatPercent(value),
      sorter: (a: ParameterSensitivity, b: ParameterSensitivity) =>
        a.sensitivity - b.sensitivity,
    },
    {
      title: t('ai.sensitivity.impact'),
      dataIndex: 'impact',
      key: 'impact',
      render: (impact: string) => (
        <Tag color={getImpactColor(impact)}>
          {t(`ai.sensitivity.impacts.${impact}`)}
        </Tag>
      ),
    },
    {
      title: t('ai.sensitivity.range'),
      key: 'range',
      render: (_, record: ParameterSensitivity) => (
        <Space>
          <span>{formatNumber(Math.min(...record.values), 4)}</span>
          <span>-</span>
          <span>{formatNumber(Math.max(...record.values), 4)}</span>
        </Space>
      ),
    },
  ];

  return (
    <StyledCard title={t('ai.sensitivity.title')}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Select
            style={{ width: 200 }}
            value={selectedParam}
            onChange={setSelectedParam}
          >
            {parameters.map(param => (
              <Option key={param.name} value={param.name}>
                {param.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={24}>
          <div className="sensitivity-chart" ref={chartRef} />
        </Col>
        <Col span={24}>
          <Table
            dataSource={parameters}
            columns={columns}
            rowKey="name"
            pagination={false}
          />
        </Col>
      </Row>
    </StyledCard>
  );
};

export default SensitivityAnalysis; 
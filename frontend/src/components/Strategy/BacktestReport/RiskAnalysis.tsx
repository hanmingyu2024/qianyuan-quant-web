import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import styled from 'styled-components';
import { formatNumber } from '@/utils/formatter';
import * as echarts from 'echarts';

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const ChartContainer = styled.div`
  height: 400px;
  margin-bottom: 16px;
`;

interface RiskMetrics {
  volatility: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  sortino: number;
  calmar: number;
  omega: number;
}

interface RiskAnalysisProps {
  data: RiskMetrics;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      radar: {
        indicator: [
          { name: '夏普比率', max: 3 },
          { name: '索提诺比率', max: 3 },
          { name: '信息比率', max: 3 },
          { name: '卡玛比率', max: 3 },
          { name: 'Omega比率', max: 3 },
          { name: 'Alpha', max: 0.5 },
        ],
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                data.sharpeRatio,
                data.sortino,
                data.informationRatio,
                data.calmar,
                data.omega,
                data.alpha,
              ],
              name: '风险指标',
              areaStyle: {
                opacity: 0.1,
              },
            },
          ],
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <StyledCard>
            <Statistic
              title="波动率"
              value={data.volatility * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: data.volatility >= 0.3 ? '#f5222d' : '#52c41a' }}
            />
            <Progress
              percent={data.volatility * 100}
              status={data.volatility >= 0.3 ? 'exception' : 'success'}
              showInfo={false}
            />
          </StyledCard>
        </Col>
        <Col span={8}>
          <StyledCard>
            <Statistic
              title="Beta系数"
              value={data.beta}
              precision={2}
              valueStyle={{ color: Math.abs(data.beta - 1) >= 0.3 ? '#f5222d' : '#52c41a' }}
            />
            <Progress
              percent={Math.min(Math.abs(data.beta) * 100, 100)}
              status={Math.abs(data.beta - 1) >= 0.3 ? 'exception' : 'success'}
              showInfo={false}
            />
          </StyledCard>
        </Col>
        <Col span={8}>
          <StyledCard>
            <Statistic
              title="Alpha"
              value={data.alpha * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: data.alpha >= 0 ? '#52c41a' : '#f5222d' }}
            />
            <Progress
              percent={Math.abs(data.alpha * 100)}
              status={data.alpha >= 0 ? 'success' : 'exception'}
              showInfo={false}
            />
          </StyledCard>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="信息比率"
              value={data.informationRatio}
              precision={2}
              valueStyle={{ color: data.informationRatio >= 0.5 ? '#52c41a' : '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="索提诺比率"
              value={data.sortino}
              precision={2}
              valueStyle={{ color: data.sortino >= 1 ? '#52c41a' : '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="卡玛比率"
              value={data.calmar}
              precision={2}
              valueStyle={{ color: data.calmar >= 1 ? '#52c41a' : '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="Omega比率"
              value={data.omega}
              precision={2}
              valueStyle={{ color: data.omega >= 1.5 ? '#52c41a' : '#f5222d' }}
            />
          </StyledCard>
        </Col>
      </Row>

      <ChartContainer ref={chartRef} />
    </>
  );
};

export default RiskAnalysis; 
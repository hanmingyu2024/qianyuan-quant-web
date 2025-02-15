import React from 'react';
import { Card, Row, Col, Statistic, Table, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { formatNumber, formatPercent } from '@/utils/formatter';

const ChartContainer = styled.div`
  height: 400px;
  margin: 16px 0;
`;

interface RiskMetrics {
  value: number;
  risk: number;
  volatility: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  drawdownDuration: number;
  recoveryTime: number;
  varDaily: number;
  varWeekly: number;
  varMonthly: number;
  downSideRisk: number;
  trackingError: number;
}

interface RiskAnalysisProps {
  data: RiskMetrics;
  drawdownHistory: {
    startTime: string;
    endTime: string;
    duration: number;
    drawdown: number;
    recovery: number;
  }[];
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ data, drawdownHistory }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts>();

  React.useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    const option = {
      title: {
        text: '风险指标雷达图',
      },
      tooltip: {},
      radar: {
        indicator: [
          { name: '波动率', max: 100 },
          { name: '最大回撤', max: 100 },
          { name: '下行风险', max: 100 },
          { name: '日VaR', max: 100 },
          { name: 'Beta', max: 2 },
        ],
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                data.volatility,
                data.maxDrawdown,
                data.downSideRisk,
                data.varDaily,
                data.beta,
              ],
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

  const columns: ColumnsType<typeof drawdownHistory[0]> = [
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: '回撤幅度',
      dataIndex: 'drawdown',
      key: 'drawdown',
      render: (value) => formatPercent(value),
      sorter: (a, b) => a.drawdown - b.drawdown,
    },
    {
      title: '持续时间(天)',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: '恢复时间(天)',
      dataIndex: 'recovery',
      key: 'recovery',
      sorter: (a, b) => a.recovery - b.recovery,
    },
  ];

  return (
    <>
      <Card title="风险指标">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="波动率"
              value={data.volatility}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Beta"
              value={data.beta}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Alpha"
              value={data.alpha}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="信息比率"
              value={data.informationRatio}
              precision={2}
            />
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="最大回撤"
              value={data.maxDrawdown}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="日VaR"
              value={data.varDaily}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="下行风险"
              value={data.downSideRisk}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="跟踪误差"
              value={data.trackingError}
              precision={2}
              suffix="%"
            />
          </Col>
        </Row>
        <ChartContainer ref={chartRef} />
      </Card>

      <Card title="回撤历史" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={drawdownHistory}
          rowKey="startTime"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  );
};

export default RiskAnalysis; 
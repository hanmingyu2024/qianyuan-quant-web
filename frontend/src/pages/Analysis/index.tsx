import React from 'react';
import { Card, Row, Col, Space, Table, Select, DatePicker } from 'antd';
import { Line, Pie, DualAxes } from '@ant-design/plots';

const { RangePicker } = DatePicker;

const Analysis: React.FC = () => {
  // 模拟收益分析数据
  const profitAnalysisData = [
    { date: '2024-01', profit: 2.3, benchmark: 1.8 },
    { date: '2024-02', profit: 3.4, benchmark: 2.1 },
    { date: '2024-03', profit: 3.1, benchmark: 2.4 },
    { date: '2024-04', profit: 4.2, benchmark: 2.8 },
    { date: '2024-05', profit: 3.8, benchmark: 2.6 },
    { date: '2024-06', profit: 4.5, benchmark: 3.1 },
  ];

  // 模拟持仓分布数据
  const positionData = [
    { type: '金融', value: 35 },
    { type: '科技', value: 25 },
    { type: '医药', value: 20 },
    { type: '消费', value: 15 },
    { type: '其他', value: 5 },
  ];

  // 模拟交易统计数据
  const tradingStatsData = [
    {
      key: '1',
      date: '2024-02',
      totalTrades: 156,
      winRate: '65.4%',
      avgProfit: 2345.67,
      maxProfit: 12345.67,
      maxLoss: -5678.90,
      sharpeRatio: 2.34,
    },
    {
      key: '2',
      date: '2024-01',
      totalTrades: 142,
      winRate: '62.8%',
      avgProfit: 2123.45,
      maxProfit: 10234.56,
      maxLoss: -4567.89,
      sharpeRatio: 2.12,
    },
  ];

  const statsColumns = [
    {
      title: '月份',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '交易次数',
      dataIndex: 'totalTrades',
      key: 'totalTrades',
    },
    {
      title: '胜率',
      dataIndex: 'winRate',
      key: 'winRate',
    },
    {
      title: '平均收益',
      dataIndex: 'avgProfit',
      key: 'avgProfit',
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '最大收益',
      dataIndex: 'maxProfit',
      key: 'maxProfit',
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '最大回撤',
      dataIndex: 'maxLoss',
      key: 'maxLoss',
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '夏普比率',
      dataIndex: 'sharpeRatio',
      key: 'sharpeRatio',
      render: (text: number) => text.toFixed(2),
    },
  ];

  // 收益与基准对比配置
  const dualAxesConfig = {
    data: [profitAnalysisData, profitAnalysisData],
    xField: 'date',
    yField: ['profit', 'benchmark'],
    geometryOptions: [
      {
        geometry: 'line',
        smooth: true,
        label: {
          formatter: (datum: any) => `${datum.profit}%`,
        },
        lineStyle: {
          lineWidth: 3,
        },
      },
      {
        geometry: 'line',
        smooth: true,
        lineStyle: {
          lineWidth: 3,
          lineDash: [5, 5],
        },
        label: {
          formatter: (datum: any) => `${datum.benchmark}%`,
        },
      },
    ],
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px 0' }}>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="收益分析" extra={<RangePicker />}>
            <DualAxes {...dualAxesConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="持仓分布">
            <Pie
              data={positionData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'outer',
                content: '{name} {percentage}',
              }}
              interactions={[
                {
                  type: 'pie-legend-active',
                },
                {
                  type: 'element-active',
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="交易统计" extra={
            <Select defaultValue="3m" style={{ width: 120 }}>
              <Select.Option value="1m">近1月</Select.Option>
              <Select.Option value="3m">近3月</Select.Option>
              <Select.Option value="6m">近6月</Select.Option>
              <Select.Option value="1y">近1年</Select.Option>
            </Select>
          }>
            <Table
              columns={statsColumns}
              dataSource={tradingStatsData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Analysis; 
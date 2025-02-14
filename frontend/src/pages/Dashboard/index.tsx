import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';

// 模拟数据
const mockData = {
  totalAssets: 1528900,
  todayProfit: 12500,
  monthProfit: -8900,
  yearProfit: 152890,
  totalProfit: 528900,
  profitRate: 52.89,
  positions: [
    {
      symbol: '000001.SZ',
      name: '平安银行',
      value: 350000,
      ratio: 22.89,
      profit: 15800,
      profitRate: 4.73,
    },
    {
      symbol: '600036.SH',
      name: '招商银行',
      value: 280000,
      ratio: 18.31,
      profit: -8500,
      profitRate: -2.95,
    },
    {
      symbol: '601318.SH',
      name: '中国平安',
      value: 420000,
      ratio: 27.47,
      profit: 25600,
      profitRate: 6.49,
    },
  ],
};

// 收益曲线数据
const profitData = [
  { date: '2024-01-01', value: 1000000 },
  { date: '2024-01-15', value: 1080000 },
  { date: '2024-02-01', value: 1150000 },
  { date: '2024-02-15', value: 1280000 },
  { date: '2024-03-01', value: 1420000 },
  { date: '2024-03-15', value: 1528900 },
];

// 资产配置数据
const assetAllocationData = [
  { type: '股票', value: 850000 },
  { type: '期货', value: 320000 },
  { type: '期权', value: 180000 },
  { type: '现金', value: 178900 },
];

const Dashboard: React.FC = () => {
  const positionColumns = [
    {
      title: '代码',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '持仓市值',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value: number) => (
        <span>¥{value.toLocaleString()}</span>
      ),
    },
    {
      title: '占比',
      dataIndex: 'ratio',
      key: 'ratio',
      width: 100,
      render: (value: number) => (
        <Space>
          <Progress
            percent={value}
            size="small"
            showInfo={false}
            style={{ width: 60 }}
          />
          <span>{value.toFixed(2)}%</span>
        </Space>
      ),
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      width: 120,
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          ¥{value.toLocaleString()}
        </span>
      ),
    },
    {
      title: '收益率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      width: 100,
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="总资产"
              value={mockData.totalAssets}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={85}
              showInfo={false}
              status="active"
              strokeColor="#1890ff"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="今日收益"
              value={mockData.todayProfit}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
              suffix={<ArrowUpOutlined />}
            />
            <Progress
              percent={65}
              showInfo={false}
              status="active"
              strokeColor="#52c41a"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="本月收益"
              value={mockData.monthProfit}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d4f' }}
              suffix={<ArrowDownOutlined />}
            />
            <Progress
              percent={35}
              showInfo={false}
              status="exception"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="总收益率"
              value={mockData.profitRate}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress
              percent={75}
              showInfo={false}
              status="active"
              strokeColor="#722ed1"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="收益走势" bordered={false}>
            <Line
              data={profitData}
              xField="date"
              yField="value"
              smooth
              point={{
                size: 2,
                shape: 'circle',
              }}
              yAxis={{
                label: {
                  formatter: (value: string) => `¥${Number(value).toLocaleString()}`,
                },
              }}
              tooltip={{
                formatter: (datum: any) => {
                  return {
                    name: '总资产',
                    value: `¥${datum.value.toLocaleString()}`,
                  };
                },
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="资产配置" bordered={false}>
            <Pie
              data={assetAllocationData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'outer',
                content: '{name} {percentage}',
              }}
              interactions={[
                {
                  type: 'element-active',
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="持仓分析" bordered={false}>
            <Table
              columns={positionColumns}
              dataSource={mockData.positions}
              rowKey="symbol"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 
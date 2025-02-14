import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Button, Table, Space, Statistic, Select } from 'antd';
import { Line, Pie, DualAxes } from '@ant-design/plots';
import { DownloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface RiskReportData {
  date: string;
  var: number;
  cvar: number;
  exposure: number;
  leverage: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  treynorRatio: number;
  volatility: number;
}

const RiskReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [reportType, setReportType] = useState<string>('daily');

  // 模拟数据
  const reportData: RiskReportData[] = [
    {
      date: '2024-02-01',
      var: 150000,
      cvar: 180000,
      exposure: 6000000,
      leverage: 1.5,
      sharpeRatio: 2.1,
      maxDrawdown: 0.15,
      beta: 0.85,
      alpha: 0.03,
      informationRatio: 1.2,
      treynorRatio: 0.12,
      volatility: 0.18,
    },
    // ... 更多数据
  ];

  // 风险分解数据
  const riskDecomposition = [
    { type: '市场风险', value: 45 },
    { type: '信用风险', value: 25 },
    { type: '流动性风险', value: 15 },
    { type: '操作风险', value: 10 },
    { type: '其他风险', value: 5 },
  ];

  // 风险趋势数据
  const riskTrends = [
    { date: '2024-02-01', var: 150000, exposure: 6000000 },
    { date: '2024-02-02', var: 155000, exposure: 6200000 },
    { date: '2024-02-03', var: 148000, exposure: 5900000 },
    { date: '2024-02-04', var: 160000, exposure: 6400000 },
  ];

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'VaR',
      dataIndex: 'var',
      key: 'var',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'CVaR',
      dataIndex: 'cvar',
      key: 'cvar',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '风险敞口',
      dataIndex: 'exposure',
      key: 'exposure',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '杠杆率',
      dataIndex: 'leverage',
      key: 'leverage',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '夏普比率',
      dataIndex: 'sharpeRatio',
      key: 'sharpeRatio',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '最大回撤',
      dataIndex: 'maxDrawdown',
      key: 'maxDrawdown',
      render: (value: number) => `${(value * 100).toFixed(2)}%`,
    },
    {
      title: 'Beta',
      dataIndex: 'beta',
      key: 'beta',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Alpha',
      dataIndex: 'alpha',
      key: 'alpha',
      render: (value: number) => value.toFixed(2),
    },
  ];

  const handleExport = () => {
    // TODO: 导出报告
    console.log('Exporting report...');
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px 0' }}>
      <Card>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={setDateRange}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              value={reportType}
              onChange={setReportType}
            >
              <Option value="daily">日报</Option>
              <Option value="weekly">周报</Option>
              <Option value="monthly">月报</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出报告
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前VaR"
              value={150000}
              precision={0}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最大回撤"
              value={15}
              precision={2}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="夏普比率"
              value={2.1}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Beta"
              value={0.85}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="风险趋势">
            <DualAxes
              data={[riskTrends, riskTrends]}
              xField="date"
              yField={['var', 'exposure']}
              geometryOptions={[
                {
                  geometry: 'line',
                  smooth: true,
                  label: {
                    formatter: (datum: any) => `${datum.var.toLocaleString()}`,
                  },
                },
                {
                  geometry: 'line',
                  smooth: true,
                  label: {
                    formatter: (datum: any) => `${datum.exposure.toLocaleString()}`,
                  },
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="风险分解">
            <Pie
              data={riskDecomposition}
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
      </Row>

      <Card title="风险指标明细">
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="date"
          pagination={{
            pageSize: 10,
            showQuickJumper: true,
            showSizeChanger: true,
          }}
          scroll={{ x: true }}
        />
      </Card>
    </Space>
  );
};

export default RiskReport; 
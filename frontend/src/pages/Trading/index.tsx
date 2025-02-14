import React, { useState } from 'react';
import { Card, Row, Col, Form, Input, Select, Button, Table, Typography, Space, InputNumber } from 'antd';
import { Line } from '@ant-design/plots';

const { Title } = Typography;
const { Option } = Select;

const Trading: React.FC = () => {
  // 模拟实时行情数据
  const marketData = [
    {
      key: '1',
      symbol: '000001.SZ',
      name: '平安银行',
      price: 12.34,
      change: 0.45,
      changePercent: 3.78,
      volume: 123456,
      turnover: 1523456.78,
    },
    {
      key: '2',
      symbol: '600000.SH',
      name: '浦发银行',
      price: 15.67,
      change: -0.23,
      changePercent: -1.45,
      volume: 98765,
      turnover: 1547623.45,
    },
  ];

  // 模拟K线数据
  const klineData = [
    { time: '09:30', price: 12.34 },
    { time: '10:00', price: 12.45 },
    { time: '10:30', price: 12.56 },
    { time: '11:00', price: 12.43 },
    { time: '11:30', price: 12.67 },
    { time: '13:30', price: 12.78 },
    { time: '14:00', price: 12.89 },
    { time: '14:30', price: 12.95 },
  ];

  const marketColumns = [
    {
      title: '代码',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '最新价',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '涨跌额',
      dataIndex: 'change',
      key: 'change',
      render: (text: number) => (
        <span style={{ color: text >= 0 ? '#3f8600' : '#cf1322' }}>
          {text >= 0 ? '+' : ''}{text}
        </span>
      ),
    },
    {
      title: '涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (text: number) => (
        <span style={{ color: text >= 0 ? '#3f8600' : '#cf1322' }}>
          {text >= 0 ? '+' : ''}{text}%
        </span>
      ),
    },
    {
      title: '成交量',
      dataIndex: 'volume',
      key: 'volume',
    },
    {
      title: '成交额',
      dataIndex: 'turnover',
      key: 'turnover',
      render: (text: number) => text.toLocaleString(),
    },
  ];

  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('下单信息:', values);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px 0' }}>
      <Row gutter={16}>
        <Col span={16}>
          <Card title="实时行情">
            <Table
              columns={marketColumns}
              dataSource={marketData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="交易下单">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="symbol"
                label="交易品种"
                rules={[{ required: true, message: '请选择交易品种' }]}
              >
                <Select placeholder="请选择">
                  <Option value="000001.SZ">平安银行(000001)</Option>
                  <Option value="600000.SH">浦发银行(600000)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="type"
                label="交易方向"
                rules={[{ required: true, message: '请选择交易方向' }]}
              >
                <Select placeholder="请选择">
                  <Option value="buy">买入</Option>
                  <Option value="sell">卖出</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="price"
                label="委托价格"
                rules={[{ required: true, message: '请输入委托价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  min={0}
                  placeholder="请输入价格"
                />
              </Form.Item>

              <Form.Item
                name="quantity"
                label="委托数量"
                rules={[{ required: true, message: '请输入委托数量' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={100}
                  step={100}
                  placeholder="请输入数量"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  确认下单
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Card title="价格走势">
            <Line
              data={klineData}
              xField="time"
              yField="price"
              smooth={true}
              point={{
                size: 5,
                shape: 'diamond',
              }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Trading; 
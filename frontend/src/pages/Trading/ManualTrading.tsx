import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Form, Input, InputNumber, Select, Button, Space, Tag, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined } from '@ant-design/icons';
import { wsService } from '../../services/websocket';
import { tradingApi, marketApi } from '@/services';
import { API_ENDPOINTS } from '../../services/config';

const { Option } = Select;

// 模拟数据
const mockMarketData = [
  {
    symbol: '000001.SZ',
    name: '平安银行',
    price: 15.23,
    change: 0.45,
    changePercent: 2.95,
    high: 15.45,
    low: 14.98,
    volume: 2345678,
    amount: 35678912,
  },
  {
    symbol: '600000.SH',
    name: '浦发银行',
    price: 12.34,
    change: -0.23,
    changePercent: -1.83,
    high: 12.56,
    low: 12.21,
    volume: 1234567,
    amount: 15234567,
  },
];

const mockPositions = [
  {
    symbol: '000001.SZ',
    name: '平安银行',
    quantity: 10000,
    avgPrice: 14.85,
    currentPrice: 15.23,
    profit: 3800,
    profitPercent: 2.56,
  },
  {
    symbol: '600036.SH',
    name: '招商银行',
    quantity: 5000,
    avgPrice: 35.42,
    currentPrice: 34.89,
    profit: -2650,
    profitPercent: -1.49,
  },
];

const ManualTrading: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>({});

  useEffect(() => {
    // 初始化数据
    fetchInitialData();
    // 订阅实时数据
    setupWebSocket();

    return () => {
      // 清理 WebSocket 订阅
      wsService.unsubscribe('market', handleMarketUpdate);
      wsService.unsubscribe('position', handlePositionUpdate);
      wsService.unsubscribe('account', handleAccountUpdate);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [quotesRes, positionsRes] = await Promise.all([
        marketApi.getSymbols(),
        tradingApi.getPositions(),
      ]);

      setMarketData(quotesRes.data);
      setPositions(positionsRes.data);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const setupWebSocket = () => {
    wsService.subscribe('market', handleMarketUpdate);
    wsService.subscribe('position', handlePositionUpdate);
    wsService.subscribe('account', handleAccountUpdate);
  };

  const handleMarketUpdate = (data: any) => {
    setMarketData(prevData => {
      const index = prevData.findIndex(item => item.symbol === data.symbol);
      if (index === -1) {
        return [...prevData, data];
      }
      const newData = [...prevData];
      newData[index] = { ...newData[index], ...data };
      return newData;
    });
  };

  const handlePositionUpdate = (data: any) => {
    setPositions(data);
  };

  const handleAccountUpdate = (data: any) => {
    setAccountInfo(data);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await tradingApi.placeOrder(values);
      form.resetFields();
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchInitialData();
  };

  const marketColumns = [
    {
      title: '代码',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '最新价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '涨跌',
      dataIndex: 'change',
      key: 'change',
      width: 100,
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
        </span>
      ),
    },
    {
      title: '涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      width: 100,
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: '最高',
      dataIndex: 'high',
      key: 'high',
      width: 100,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '最低',
      dataIndex: 'low',
      key: 'low',
      width: 100,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '成交量',
      dataIndex: 'volume',
      key: 'volume',
      width: 120,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '成交额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (value: number) => value.toLocaleString(),
    },
  ];

  const positionColumns = [
    {
      title: '代码',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '持仓数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '持仓均价',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
      width: 100,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '最新价',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      width: 100,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      width: 120,
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
        </span>
      ),
    },
    {
      title: '盈亏比例',
      dataIndex: 'profitPercent',
      key: 'profitPercent',
      width: 100,
      render: (value: number) => (
        <Tag color={value >= 0 ? 'success' : 'error'}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button type="primary" size="small">买入</Button>
          <Button danger size="small">卖出</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card 
            title="实时行情" 
            extra={
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                刷新
              </Button>
            }
            bordered={false}
          >
            <Table
              columns={marketColumns}
              dataSource={marketData}
              rowKey="symbol"
              pagination={false}
              size="middle"
              scroll={{ x: 1000 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="交易下单" bordered={false}>
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
                <Select
                  showSearch
                  placeholder="请选择股票代码"
                  optionFilterProp="children"
                >
                  <Option value="000001.SZ">000001.SZ 平安银行</Option>
                  <Option value="600000.SH">600000.SH 浦发银行</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="direction"
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
                  min={0}
                  precision={2}
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
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => form.resetFields()}>重置</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    确认下单
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            title="持仓管理" 
            bordered={false}
            extra={
              <Space>
                <Statistic
                  title="总资产"
                  value={accountInfo.totalAssets}
                  precision={2}
                  prefix="¥"
                  style={{ display: 'inline-block', marginRight: 32 }}
                />
                <Statistic
                  title="持仓盈亏"
                  value={accountInfo.totalProfit}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: accountInfo.totalProfit >= 0 ? '#52c41a' : '#ff4d4f' }}
                  suffix={accountInfo.totalProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  style={{ display: 'inline-block' }}
                />
              </Space>
            }
          >
            <Table
              columns={positionColumns}
              dataSource={positions}
              rowKey="symbol"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManualTrading; 
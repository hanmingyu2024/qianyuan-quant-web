import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Space, Tag, Statistic, Progress, Alert, Switch } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, SettingOutlined, LineChartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { wsService } from '../../services/websocket';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../services/config';

// 模拟数据
const mockStrategies = [
  {
    id: '1',
    name: '均线交叉策略',
    description: '基于20日和60日均线交叉的趋势跟踪策略',
    status: 'running',
    symbols: ['000001.SZ', '600000.SH'],
    startTime: '2024-02-14 09:30:00',
    todayProfit: 2350.5,
    totalProfit: 15680.2,
    profitRate: 15.68,
    winRate: 65.4,
    maxDrawdown: 8.5,
  },
  {
    id: '2',
    name: '动量反转策略',
    description: '基于RSI指标的动量反转交易策略',
    status: 'stopped',
    symbols: ['600036.SH', '601318.SH'],
    startTime: '2024-02-13 09:30:00',
    todayProfit: -520.3,
    totalProfit: 8920.5,
    profitRate: 8.92,
    winRate: 58.7,
    maxDrawdown: 12.3,
  },
];

// 模拟收益曲线数据
const profitData = [
  { date: '2024-02-01', value: 10000 },
  { date: '2024-02-02', value: 10580 },
  { date: '2024-02-03', value: 11200 },
  { date: '2024-02-04', value: 10800 },
  { date: '2024-02-05', value: 11500 },
  { date: '2024-02-06', value: 12100 },
  { date: '2024-02-07', value: 11800 },
  { date: '2024-02-08', value: 12500 },
  { date: '2024-02-09', value: 13200 },
  { date: '2024-02-10', value: 12800 },
  { date: '2024-02-11', value: 13500 },
  { date: '2024-02-12', value: 14200 },
  { date: '2024-02-13', value: 15100 },
  { date: '2024-02-14', value: 15680 },
];

const AutoTrading: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>({
    status: 'normal',
    message: '所有自动交易策略运行正常，无异常告警',
  });

  useEffect(() => {
    // 初始化数据
    fetchInitialData();
    // 订阅实时数据
    setupWebSocket();

    return () => {
      // 清理 WebSocket 订阅
      wsService.unsubscribe('strategy', handleStrategyUpdate);
      wsService.unsubscribe('profit', handleProfitUpdate);
      wsService.unsubscribe('system', handleSystemUpdate);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [strategiesRes, profitRes] = await Promise.all([
        api.get(API_ENDPOINTS.STRATEGY.LIST),
        api.get(API_ENDPOINTS.ACCOUNT.PERFORMANCE),
      ]);

      setStrategies(strategiesRes.data);
      setProfitData(profitRes.data);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const setupWebSocket = () => {
    wsService.subscribe('strategy', handleStrategyUpdate);
    wsService.subscribe('profit', handleProfitUpdate);
    wsService.subscribe('system', handleSystemUpdate);
  };

  const handleStrategyUpdate = (data: any) => {
    setStrategies(prevStrategies => {
      const index = prevStrategies.findIndex(s => s.id === data.id);
      if (index === -1) {
        return [...prevStrategies, data];
      }
      const newStrategies = [...prevStrategies];
      newStrategies[index] = { ...newStrategies[index], ...data };
      return newStrategies;
    });
  };

  const handleProfitUpdate = (data: any) => {
    setProfitData(data);
  };

  const handleSystemUpdate = (data: any) => {
    setSystemStatus(data);
  };

  const handleStart = async (id: string) => {
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.STRATEGY.START.replace(':strategyId', id));
    } catch (error) {
      console.error('Failed to start strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async (id: string) => {
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.STRATEGY.STOP.replace(':strategyId', id));
    } catch (error) {
      console.error('Failed to stop strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          running: { color: 'success', text: '运行中' },
          stopped: { color: 'default', text: '已停止' },
          error: { color: 'error', text: '异常' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '交易品种',
      dataIndex: 'symbols',
      key: 'symbols',
      width: 150,
      render: (symbols: string[]) => symbols.join(', '),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
    },
    {
      title: '今日收益',
      dataIndex: 'todayProfit',
      key: 'todayProfit',
      width: 120,
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
        </span>
      ),
    },
    {
      title: '总收益',
      dataIndex: 'totalProfit',
      key: 'totalProfit',
      width: 120,
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
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
    {
      title: '胜率',
      dataIndex: 'winRate',
      key: 'winRate',
      width: 100,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
    {
      title: '最大回撤',
      dataIndex: 'maxDrawdown',
      key: 'maxDrawdown',
      width: 100,
      render: (value: number) => (
        <Tag color={value <= 10 ? 'success' : value <= 20 ? 'warning' : 'error'}>
          {value.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'running' ? (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={() => handleStop(record.id)}
            >
              停止
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record.id)}
            >
              启动
            </Button>
          )}
          <Button icon={<SettingOutlined />}>设置</Button>
          <Button icon={<LineChartOutlined />}>分析</Button>
        </Space>
      ),
    },
  ];

  const getSystemStats = () => {
    const runningStrategies = strategies.filter(s => s.status === 'running');
    const totalProfit = strategies.reduce((sum, s) => sum + s.totalProfit, 0);
    const avgProfitRate = strategies.reduce((sum, s) => sum + s.profitRate, 0) / strategies.length;

    return {
      totalStrategies: strategies.length,
      runningStrategies: runningStrategies.length,
      todayTotalProfit: runningStrategies.reduce((sum, s) => sum + s.todayProfit, 0),
      totalProfitRate: avgProfitRate,
    };
  };

  const stats = getSystemStats();

  return (
    <div>
      <Alert
        message={systemStatus.status === 'normal' ? '系统状态正常' : '系统异常'}
        description={systemStatus.message}
        type={systemStatus.status === 'normal' ? 'success' : 'error'}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="策略总数"
              value={stats.totalStrategies}
              suffix={`/ ${10}`}
            />
            <Progress
              percent={stats.totalStrategies * 10}
              size="small"
              status="active"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="运行中策略"
              value={stats.runningStrategies}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={(stats.runningStrategies / stats.totalStrategies) * 100}
              size="small"
              status="active"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="今日总收益"
              value={stats.todayTotalProfit}
              precision={2}
              prefix="¥"
              valueStyle={{ color: stats.todayTotalProfit >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <Progress
              percent={75}
              size="small"
              status="active"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="总收益率"
              value={stats.totalProfitRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: stats.totalProfitRate >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <Progress
              percent={82}
              size="small"
              status="active"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title="策略列表"
            bordered={false}
            extra={
              <Space>
                <Switch
                  checkedChildren="自动恢复"
                  unCheckedChildren="手动恢复"
                  defaultChecked
                />
                <Button type="primary">新建策略</Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={strategies}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1500 }}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
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
              label={{
                style: {
                  fill: '#aaa',
                },
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AutoTrading; 
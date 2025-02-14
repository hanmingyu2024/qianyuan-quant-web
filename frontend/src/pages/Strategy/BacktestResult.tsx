import React from 'react';
import { Card, Row, Col, Statistic, Table, Space } from 'antd';
import { Line, Column } from '@ant-design/plots';
import type { BacktestResult as BacktestResultType } from '../../store/slices/strategySlice';

interface BacktestResultProps {
  result: BacktestResultType;
}

interface EquityCurveData {
  time: string;
  equity: number;
}

interface MonthlyReturnData {
  month: string;
  profit: number;
}

const BacktestResult: React.FC<BacktestResultProps> = ({ result }) => {
  // 收益曲线数据
  const equityCurveData = result.trades.reduce((acc: EquityCurveData[], trade, index) => {
    const prevEquity = index > 0 ? acc[index - 1].equity : result.initialCapital;
    return [...acc, {
      time: new Date(trade.time).toLocaleString(),
      equity: prevEquity + trade.profit,
    }];
  }, []);

  // 每月收益数据
  const monthlyReturns = result.trades.reduce((acc: { [key: string]: number }, trade) => {
    const month = new Date(trade.time).toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + trade.profit;
    return acc;
  }, {});

  const monthlyReturnsData = Object.entries(monthlyReturns).map(([month, profit]) => ({
    month,
    profit,
  }));

  // 交易记录列
  const columns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: '交易品种',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '方向',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span style={{ color: type === 'buy' ? '#3f8600' : '#cf1322' }}>
          {type === 'buy' ? '买入' : '卖出'}
        </span>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toFixed(2),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '收益',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit: number) => (
        <span style={{ color: profit >= 0 ? '#3f8600' : '#cf1322' }}>
          {profit.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="初始资金"
              value={result.initialCapital}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最终资金"
              value={result.finalCapital}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收益率"
              value={result.totalReturn}
              precision={2}
              suffix="%"
              valueStyle={{ color: result.totalReturn >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="年化收益率"
              value={result.annualizedReturn}
              precision={2}
              suffix="%"
              valueStyle={{ color: result.annualizedReturn >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic
              title="最大回撤"
              value={result.maxDrawdown}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="夏普比率"
              value={result.sharpeRatio}
              precision={2}
              valueStyle={{ color: result.sharpeRatio >= 2 ? '#3f8600' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="权益曲线">
            <Line
              data={equityCurveData}
              xField="time"
              yField="equity"
              smooth={true}
              point={{
                size: 2,
                shape: 'circle',
              }}
              tooltip={{
                formatter: (datum: EquityCurveData) => {
                  return {
                    name: '权益',
                    value: datum.equity.toFixed(2),
                  };
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="月度收益">
            <Column
              data={monthlyReturnsData}
              xField="month"
              yField="profit"
              label={{
                position: 'middle',
                style: {
                  fill: '#FFFFFF',
                  opacity: 0.6,
                },
              }}
              meta={{
                profit: {
                  alias: '收益',
                },
              }}
              color={(datum: MonthlyReturnData) => (datum.profit >= 0 ? '#3f8600' : '#cf1322')}
            />
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Card title="交易记录">
            <Table
              columns={columns}
              dataSource={result.trades}
              rowKey={(record) => `${record.time}-${record.symbol}`}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default BacktestResult; 
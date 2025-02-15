import React from 'react';
import { Card, Table, Tag, DatePicker, Space, Button, Row, Col, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatTime, formatNumber, formatPercent } from '@/utils/formatter';

const { RangePicker } = DatePicker;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface Trade {
  id: string;
  time: string;
  symbol: string;
  type: 'open' | 'close';
  direction: 'long' | 'short';
  price: number;
  amount: number;
  value: number;
  fee: number;
  pnl: number;
  pnlRate: number;
  holdingPeriod: number;
}

interface TradeRecordProps {
  data: {
    trades: Trade[];
    statistics: {
      totalTrades: number;
      winningTrades: number;
      losingTrades: number;
      totalPnl: number;
      totalFee: number;
      avgHoldingPeriod: number;
    };
  };
  loading?: boolean;
  onTimeRangeChange: (range: [number, number]) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const TradeRecord: React.FC<TradeRecordProps> = ({
  data,
  loading,
  onTimeRangeChange,
  onRefresh,
  onExport,
}) => {
  const columns: ColumnsType<Trade> = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time) => formatTime(time),
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '类型',
      key: 'tradeType',
      render: (_, record) => (
        <Space>
          <Tag color={record.direction === 'long' ? 'green' : 'red'}>
            {record.direction === 'long' ? '多' : '空'}
          </Tag>
          <Tag>{record.type === 'open' ? '开仓' : '平仓'}</Tag>
        </Space>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatNumber(price, 2),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: '交易额',
      dataIndex: 'value',
      key: 'value',
      render: (value) => formatNumber(value, 2),
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => formatNumber(fee, 4),
    },
    {
      title: '盈亏',
      key: 'pnl',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: record.pnl >= 0 ? '#52c41a' : '#f5222d' }}>
            {formatNumber(record.pnl, 2)} USDT
          </span>
          <span style={{ color: record.pnlRate >= 0 ? '#52c41a' : '#f5222d' }}>
            {formatPercent(record.pnlRate)}
          </span>
        </Space>
      ),
    },
    {
      title: '持仓时间',
      dataIndex: 'holdingPeriod',
      key: 'holdingPeriod',
      render: (period) => `${period} 分钟`,
    },
  ];

  const handleTimeRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      onTimeRangeChange([dates[0].valueOf(), dates[1].valueOf()]);
    }
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <StyledCard>
            <Statistic
              title="总交易次数"
              value={data.statistics.totalTrades}
              suffix={`胜率 ${formatPercent(data.statistics.winningTrades / data.statistics.totalTrades)}`}
            />
          </StyledCard>
        </Col>
        <Col span={8}>
          <StyledCard>
            <Statistic
              title="总盈亏"
              value={data.statistics.totalPnl}
              precision={2}
              prefix="$"
              valueStyle={{ color: data.statistics.totalPnl >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={8}>
          <StyledCard>
            <Statistic
              title="平均持仓时间"
              value={data.statistics.avgHoldingPeriod}
              suffix="分钟"
            />
          </StyledCard>
        </Col>
      </Row>

      <Card
        title="交易记录"
        extra={
          <Space>
            <RangePicker showTime onChange={handleTimeRangeChange} />
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={onExport}
            >
              导出
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data.trades}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 50,
            showQuickJumper: true,
            showSizeChanger: true,
          }}
          scroll={{ x: true }}
        />
      </Card>
    </>
  );
};

export default TradeRecord; 
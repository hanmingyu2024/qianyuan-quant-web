import React from 'react';
import { Card, Table, Tag, DatePicker, Space, Button, Row, Col, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatTime, formatNumber } from '@/utils/formatter';

const { RangePicker } = DatePicker;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface FlowRecord {
  id: string;
  time: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'fee' | 'pnl';
  amount: number;
  balance: number;
  description: string;
}

interface FundFlowProps {
  data: {
    records: FlowRecord[];
    statistics: {
      totalDeposit: number;
      totalWithdraw: number;
      totalFee: number;
      totalPnl: number;
      balance: number;
    };
  };
  loading?: boolean;
  onTimeRangeChange: (range: [number, number]) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const FundFlow: React.FC<FundFlowProps> = ({
  data,
  loading,
  onTimeRangeChange,
  onRefresh,
  onExport,
}) => {
  const columns: ColumnsType<FlowRecord> = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time) => formatTime(time),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          deposit: { text: '入金', color: 'blue' },
          withdraw: { text: '出金', color: 'orange' },
          transfer: { text: '划转', color: 'purple' },
          fee: { text: '手续费', color: 'red' },
          pnl: { text: '盈亏', color: 'green' },
        };
        const { text, color } = typeMap[type];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span style={{ color: amount >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatNumber(amount, 2)} USDT
        </span>
      ),
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => `${formatNumber(balance, 2)} USDT`,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
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
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="总入金"
              value={data.statistics.totalDeposit}
              precision={2}
              prefix="$"
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="总出金"
              value={data.statistics.totalWithdraw}
              precision={2}
              prefix="$"
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="总手续费"
              value={data.statistics.totalFee}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#f5222d' }}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
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
      </Row>

      <Card
        title="资金流水"
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
          dataSource={data.records}
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

export default FundFlow; 
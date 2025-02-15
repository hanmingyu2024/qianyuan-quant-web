import React from 'react';
import { Card, Table, Tag, Space, Button, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RangePickerProps } from 'antd/es/date-picker';
import styled from 'styled-components';
import { formatTime } from '@/utils/formatter';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const StyledCard = styled(Card)`
  .ant-card-body {
    padding: 0;
  }
`;

const ToolBar = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
`;

interface Log {
  id: string;
  time: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface LogViewerProps {
  loading: boolean;
  data: Log[];
  onRefresh: () => void;
  onTimeRangeChange: (range: [number, number]) => void;
  onDownload: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({
  loading = false,
  data = [],
  onRefresh = () => {},
  onTimeRangeChange = () => {},
  onDownload = () => {},
}) => {
  const columns: ColumnsType<Log> = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 180,
      render: (time) => formatTime(time),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => {
        const colorMap = {
          info: 'blue',
          warning: 'gold',
          error: 'red',
        };
        return <Tag color={colorMap[level]}>{level.toUpperCase()}</Tag>;
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      width: 80,
      render: (details) =>
        details ? (
          <Button type="link" size="small" onClick={() => console.log(details)}>
            查看
          </Button>
        ) : null,
    },
  ];

  const handleTimeRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onTimeRangeChange([dates[0].valueOf(), dates[1].valueOf()]);
    }
  };

  return (
    <StyledCard>
      <ToolBar>
        <RangePicker showTime onChange={handleTimeRangeChange} />
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={onRefresh}
          >
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={onDownload}>
            导出
          </Button>
        </Space>
      </ToolBar>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          total: data.length,
          pageSize: 50,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </StyledCard>
  );
};

export default LogViewer; 
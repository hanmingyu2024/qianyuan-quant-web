import React from 'react';
import { Card, Table, Tag, DatePicker, Space, Button, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { formatTime } from '@/utils/formatter';

const { RangePicker } = DatePicker;
const { Search } = Input;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

interface Log {
  id: string;
  time: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface RunningLogProps {
  data: Log[];
  loading?: boolean;
  onTimeRangeChange: (range: [number, number]) => void;
  onSearch: (keyword: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const RunningLog: React.FC<RunningLogProps> = ({
  data,
  loading,
  onTimeRangeChange,
  onSearch,
  onRefresh,
  onExport,
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
      filters: [
        { text: 'INFO', value: 'info' },
        { text: 'WARNING', value: 'warning' },
        { text: 'ERROR', value: 'error' },
      ],
      onFilter: (value, record) => record.level === value,
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

  const handleTimeRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      onTimeRangeChange([dates[0].valueOf(), dates[1].valueOf()]);
    }
  };

  return (
    <Card title="运行日志">
      <ToolBar>
        <Space>
          <RangePicker showTime onChange={handleTimeRangeChange} />
          <Search
            placeholder="搜索日志"
            onSearch={onSearch}
            style={{ width: 200 }}
          />
        </Space>
        <Space>
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
      </ToolBar>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          total: data.length,
          pageSize: 50,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />
    </Card>
  );
};

export default RunningLog; 
import * as React from 'react';
import { Card, Table, Tag, Space, Button, DatePicker } from 'antd';
import { useI18n } from '@/utils/i18n';
import { useCache } from '@/hooks/useCache';
import type { TableProps } from 'antd';
import styled from 'styled-components';

const { RangePicker } = DatePicker;

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  module: string;
  details?: string;
}

const LogLevel = styled(Tag)<{ level: string }>`
  min-width: 60px;
  text-align: center;
`;

const SystemLogs: React.FC = () => {
  const { t } = useI18n();
  const [dateRange, setDateRange] = React.useState<[Date, Date] | null>(null);

  const columns: TableProps<LogEntry>['columns'] = [
    {
      title: t('logs.timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: t('logs.level'),
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <LogLevel
          level={level}
          color={level === 'error' ? 'red' : level === 'warning' ? 'orange' : 'blue'}
        >
          {level.toUpperCase()}
        </LogLevel>
      ),
      filters: [
        { text: 'INFO', value: 'info' },
        { text: 'WARNING', value: 'warning' },
        { text: 'ERROR', value: 'error' },
      ],
      onFilter: (value, record) => record.level === value,
    },
    {
      title: t('logs.module'),
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: t('logs.message'),
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: t('logs.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => console.log('View details', record)}>
            {t('logs.viewDetails')}
          </Button>
        </Space>
      ),
    },
  ];

  // 模拟日志数据
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'User logged in successfully',
      module: 'Auth',
    },
    // ... 更多模拟数据
  ];

  return (
    <Card 
      title={t('settings.systemLogs')}
      extra={
        <Space>
          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0]?.toDate()!, dates[1]?.toDate()!]);
              } else {
                setDateRange(null);
              }
            }}
          />
          <Button type="primary">{t('logs.export')}</Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={mockLogs}
        rowKey="id"
        pagination={{
          total: mockLogs.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </Card>
  );
};

export default SystemLogs; 
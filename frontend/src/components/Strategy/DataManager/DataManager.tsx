import * as React from 'react';
import { Card, Table, Button, Space, Form, Select, DatePicker, Input, Modal, Tag, Progress } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  CloudDownloadOutlined,
  SyncOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { formatTime, formatSize } from '@/utils/formatter';
import moment from 'moment';
import { TableColumnType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;

const StyledCard = styled(Card)`
  .ant-card-body {
    padding: 12px;
  }
`;

interface DataSource {
  id: string;
  name: string;
  type: 'spot' | 'futures' | 'options';
  exchange: string;
  symbol: string;
  interval: string;
  startTime: number;
  endTime: number;
  status: 'ready' | 'downloading' | 'error';
  size: number;
  lastUpdate: number;
}

interface DownloadConfig {
  exchange: string;
  symbol: string;
  interval: string;
  dateRange: [moment.Moment, moment.Moment];
}

interface DataManagerProps {
  dataSources: DataSource[];
  onDownload: (config: DownloadConfig) => Promise<void>;
  onSubscribe: (symbol: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const DataManager: React.FC<DataManagerProps> = ({
  dataSources,
  onDownload,
  onSubscribe,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [downloadModalVisible, setDownloadModalVisible] = React.useState(false);
  const [selectedSource, setSelectedSource] = React.useState<DataSource | null>(null);

  const columns: TableColumnType<DataSource>[] = [
    {
      title: t('data.symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string, record: DataSource) => (
        <Space>
          {text}
          <Tag color={record.type === 'spot' ? 'blue' : record.type === 'futures' ? 'green' : 'purple'}>
            {record.type.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: t('data.exchange'),
      dataIndex: 'exchange',
      key: 'exchange',
    },
    {
      title: t('data.interval'),
      dataIndex: 'interval',
      key: 'interval',
    },
    {
      title: t('data.dateRange'),
      key: 'dateRange',
      render: (_: unknown, record: DataSource) => (
        `${formatTime(record.startTime)} - ${formatTime(record.endTime)}`
      ),
    },
    {
      title: t('data.size'),
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatSize(size),
    },
    {
      title: t('data.status'),
      key: 'status',
      render: (_, record: DataSource) => {
        if (record.status === 'downloading') {
          return <Progress percent={75} size="small" status="active" />;
        }
        return (
          <Tag color={record.status === 'ready' ? 'success' : 'error'}>
            {t(`data.status.${record.status}`)}
          </Tag>
        );
      },
    },
    {
      title: t('data.actions'),
      key: 'actions',
      render: (_, record: DataSource) => (
        <Space>
          <Button
            icon={<SyncOutlined />}
            size="small"
            onClick={() => onSubscribe(record.symbol)}
          >
            {t('data.subscribe')}
          </Button>
          <Button
            icon={<SettingOutlined />}
            size="small"
            onClick={() => setSelectedSource(record)}
          >
            {t('data.manage')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <StyledCard>
        <Space>
          <Button
            type="primary"
            icon={<CloudDownloadOutlined />}
            onClick={() => setDownloadModalVisible(true)}
          >
            {t('data.download')}
          </Button>
          <Button icon={<DatabaseOutlined />}>
            {t('data.import')}
          </Button>
        </Space>
      </StyledCard>

      <Table
        dataSource={dataSources}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ x: true }}
      />

      <Modal
        title={t('data.download.title')}
        open={downloadModalVisible}
        onCancel={() => setDownloadModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            await onDownload(values as DownloadConfig);
            setDownloadModalVisible(false);
          }}
        >
          <Form.Item
            name="exchange"
            label={t('data.download.exchange')}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="binance">Binance</Option>
              <Option value="okex">OKEx</Option>
              <Option value="huobi">Huobi</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="symbol"
            label={t('data.download.symbol')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="interval"
            label={t('data.download.interval')}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="1m">1m</Option>
              <Option value="5m">5m</Option>
              <Option value="15m">15m</Option>
              <Option value="1h">1h</Option>
              <Option value="4h">4h</Option>
              <Option value="1d">1d</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label={t('data.download.dateRange')}
            rules={[{ required: true }]}
          >
            <RangePicker showTime />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default DataManager; 
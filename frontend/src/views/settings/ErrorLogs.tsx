import * as React from 'react';
import { Card, Table, Tag, Space, Button, Modal, Typography } from 'antd';
import { useI18n } from '@/utils/i18n';
import { useError } from '@/services/errorService';
import styled from 'styled-components';

const { Text, Paragraph } = Typography;

const StyledModal = styled(Modal)`
  .error-details {
    max-height: 400px;
    overflow-y: auto;
    font-family: monospace;
    background: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
  }
`;

const ErrorLogs: React.FC = () => {
  const { t } = useI18n();
  const { errorLogs, clearLogs } = useError();
  const [selectedError, setSelectedError] = React.useState<any>(null);

  const columns = [
    {
      title: t('logs.timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: t('logs.error'),
      dataIndex: 'error',
      key: 'error',
    },
    {
      title: t('logs.actions'),
      key: 'actions',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => setSelectedError(record)}>
          {t('logs.viewDetails')}
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card
        title={t('settings.errorLogs')}
        extra={
          <Button danger onClick={clearLogs}>
            {t('logs.clearLogs')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={errorLogs}
          rowKey="timestamp"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      <StyledModal
        title={t('logs.errorDetails')}
        open={!!selectedError}
        onCancel={() => setSelectedError(null)}
        footer={null}
        width={800}
      >
        {selectedError && (
          <div>
            <Paragraph>
              <Text strong>{t('logs.timestamp')}:</Text>{' '}
              {new Date(selectedError.timestamp).toLocaleString()}
            </Paragraph>
            <Paragraph>
              <Text strong>{t('logs.error')}:</Text> {selectedError.error}
            </Paragraph>
            {selectedError.context && (
              <Paragraph>
                <Text strong>{t('logs.context')}:</Text>
                <pre>{JSON.stringify(selectedError.context, null, 2)}</pre>
              </Paragraph>
            )}
            {selectedError.stack && (
              <Paragraph>
                <Text strong>{t('logs.stackTrace')}:</Text>
                <div className="error-details">
                  <pre>{selectedError.stack}</pre>
                </div>
              </Paragraph>
            )}
          </div>
        )}
      </StyledModal>
    </>
  );
};

export default ErrorLogs; 
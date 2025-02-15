import * as React from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { AIModel } from '@/types/ai';

const { Text } = Typography;

const StyledCard = styled(Card)`
  .ant-table {
    background: transparent;
  }
`;

interface ModelManagerProps {
  models: AIModel[];
  onAdd: (model: Omit<AIModel, 'id'>) => void;
  onUpdate: (id: string, model: Partial<AIModel>) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

const ModelManager: React.FC<ModelManagerProps> = ({
  models,
  onAdd,
  onUpdate,
  onDelete,
  onDownload,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [visible, setVisible] = React.useState(false);
  const [editingModel, setEditingModel] = React.useState<AIModel | null>(null);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingModel) {
        onUpdate(editingModel.id, values);
      } else {
        onAdd(values);
      }
      setVisible(false);
      form.resetFields();
      setEditingModel(null);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const columns = [
    {
      title: t('ai.model.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AIModel) => (
        <Space>
          <Text strong>{text}</Text>
          {record.capabilities.map(cap => (
            <Tag key={cap} color="blue">{t(`ai.model.capabilities.${cap}Short`)}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('ai.model.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('ai.model.parameters'),
      key: 'parameters',
      render: (_: any, record: AIModel) => (
        <Space>
          <Tag>T: {record.parameters.temperature}</Tag>
          <Tag>P: {record.parameters.topP}</Tag>
          <Tag>M: {record.parameters.maxTokens}</Tag>
        </Space>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: AIModel) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingModel(record);
              form.setFieldsValue(record);
              setVisible(true);
            }}
          />
          <Button
            type="text"
            icon={<CloudDownloadOutlined />}
            onClick={() => onDownload(record.id)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <StyledCard
        title={t('ai.model.manager')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingModel(null);
              form.resetFields();
              setVisible(true);
            }}
          >
            {t('ai.model.add')}
          </Button>
        }
      >
        <Table
          dataSource={models}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </StyledCard>

      <Modal
        title={editingModel ? t('ai.model.edit') : t('ai.model.add')}
        open={visible}
        onOk={handleSubmit}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
          setEditingModel(null);
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={t('ai.model.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('ai.model.description')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name={['parameters', 'temperature']}
            label={t('ai.model.temperature')}
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name={['parameters', 'topP']}
            label={t('ai.model.topP')}
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={1} step={0.05} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name={['parameters', 'maxTokens']}
            label={t('ai.model.maxTokens')}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={4096} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="capabilities"
            label={t('ai.model.capabilities')}
            rules={[{ required: true }]}
          >
            <Space>
              <Form.Item name={['capabilities', 'code']} valuePropName="checked" noStyle>
                <Switch checkedChildren="Code" unCheckedChildren="Code" />
              </Form.Item>
              <Form.Item name={['capabilities', 'analysis']} valuePropName="checked" noStyle>
                <Switch checkedChildren="Analysis" unCheckedChildren="Analysis" />
              </Form.Item>
              <Form.Item name={['capabilities', 'optimization']} valuePropName="checked" noStyle>
                <Switch checkedChildren="Optimization" unCheckedChildren="Optimization" />
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModelManager; 
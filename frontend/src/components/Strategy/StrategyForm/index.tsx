import React from 'react';
import { Form, Input, Select, Button, Card, Space } from 'antd';
import { MonacoEditor } from '@/components/common/MonacoEditor';
import styled from 'styled-components';

const { Option } = Select;
const { TextArea } = Input;

const EditorWrapper = styled.div`
  height: 500px;
  margin-bottom: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
`;

interface StrategyFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const StrategyForm: React.FC<StrategyFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="策略名称"
          rules={[{ required: true, message: '请输入策略名称' }]}
        >
          <Input placeholder="请输入策略名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="策略描述"
          rules={[{ required: true, message: '请输入策略描述' }]}
        >
          <TextArea rows={4} placeholder="请输入策略描述" />
        </Form.Item>

        <Form.Item
          name="type"
          label="策略类型"
          rules={[{ required: true, message: '请选择策略类型' }]}
        >
          <Select placeholder="请选择策略类型">
            <Option value="grid">网格交易</Option>
            <Option value="ma">均线策略</Option>
            <Option value="custom">自定义策略</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="code"
          label="策略代码"
          rules={[{ required: true, message: '请输入策略代码' }]}
        >
          <EditorWrapper>
            <MonacoEditor
              language="python"
              value={form.getFieldValue('code')}
              onChange={(value) => form.setFieldsValue({ code: value })}
              options={{
                minimap: { enabled: false },
              }}
            />
          </EditorWrapper>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StrategyForm; 
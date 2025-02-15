import React from 'react';
import { Form, Input, InputNumber, Select, Switch, Card, Button, Space } from 'antd';
import styled from 'styled-components';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface ParamField {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  required?: boolean;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

interface ParamConfigProps {
  fields: ParamField[];
  initialValues?: Record<string, any>;
  onChange?: (values: Record<string, any>) => void;
}

const ParamConfig: React.FC<ParamConfigProps> = ({
  fields,
  initialValues,
  onChange,
}) => {
  const [form] = Form.useForm();

  const handleValuesChange = (_: any, allValues: any) => {
    onChange?.(allValues);
  };

  const renderField = (field: ParamField) => {
    switch (field.type) {
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
      case 'string':
        return <Input />;
      case 'boolean':
        return <Switch />;
      case 'select':
        return (
          <Select>
            {field.options?.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <StyledCard title="策略参数">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={handleValuesChange}
      >
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[
              {
                required: field.required,
                message: `请输入${field.label}`,
              },
            ]}
          >
            {renderField(field)}
          </Form.Item>
        ))}
      </Form>
    </StyledCard>
  );
};

export default ParamConfig; 
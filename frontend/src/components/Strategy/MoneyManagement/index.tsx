import React from 'react';
import { Card, Form, InputNumber, Select, Switch, Row, Col, Alert } from 'antd';
import styled from 'styled-components';

const { Option } = Select;

const StyledCard = styled(Card)`
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

interface MoneyManagementProps {
  onSubmit: (values: any) => void;
  initialValues?: any;
}

const MoneyManagement: React.FC<MoneyManagementProps> = ({
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    onSubmit(allValues);
  };

  return (
    <StyledCard title="资金管理">
      <Alert
        message="风险提示"
        description="合理的资金管理可以有效控制风险，建议根据自身风险承受能力谨慎设置。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          enabled: true,
          positionType: 'fixed',
          maxPositions: 5,
          maxLeverage: 3,
          riskPerTrade: 2,
          stopLossRate: 5,
          takeProfitRate: 10,
          ...initialValues,
        }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="enabled"
          valuePropName="checked"
          label="启用资金管理"
        >
          <Switch />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="positionType"
              label="仓位类型"
              rules={[{ required: true, message: '请选择仓位类型' }]}
            >
              <Select>
                <Option value="fixed">固定仓位</Option>
                <Option value="percent">百分比仓位</Option>
                <Option value="kelly">凯利公式</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxPositions"
              label="最大持仓数"
              rules={[{ required: true, message: '请输入最大持仓数' }]}
            >
              <InputNumber
                min={1}
                max={10}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maxLeverage"
              label="最大杠杆"
              rules={[{ required: true, message: '请输入最大杠杆' }]}
            >
              <InputNumber
                min={1}
                max={20}
                style={{ width: '100%' }}
                addonAfter="x"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="riskPerTrade"
              label="单笔风险"
              rules={[{ required: true, message: '请输入单笔风险' }]}
            >
              <InputNumber
                min={0.1}
                max={10}
                step={0.1}
                style={{ width: '100%' }}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="stopLossRate"
              label="止损比例"
              rules={[{ required: true, message: '请输入止损比例' }]}
            >
              <InputNumber
                min={0.1}
                max={20}
                step={0.1}
                style={{ width: '100%' }}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="takeProfitRate"
              label="止盈比例"
              rules={[{ required: true, message: '请输入止盈比例' }]}
            >
              <InputNumber
                min={0.1}
                max={100}
                step={0.1}
                style={{ width: '100%' }}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </StyledCard>
  );
};

export default MoneyManagement; 
import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Space, Row, Col, InputNumber, Tabs } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import { useDispatch } from 'react-redux';
import { Strategy } from '../../store/slices/strategySlice';
import { strategyApi } from '../../services/api';

const { Option } = Select;
const { TabPane } = Tabs;

const defaultCode = `# 策略模板
def initialize(context):
    # 初始化函数，设置策略参数
    context.symbols = ['000001.SZ', '600000.SH']
    context.holding_period = 20
    context.position_size = 0.1

def handle_data(context, data):
    # 主要策略逻辑
    for symbol in context.symbols:
        price = data.current(symbol, 'close')
        ma20 = data.history(symbol, 'close', context.holding_period, '1d').mean()
        
        if price > ma20 and not context.portfolio.positions[symbol].amount:
            # 当价格上穿20日均线，且当前没有持仓，则买入
            order_target_percent(symbol, context.position_size)
        elif price < ma20 and context.portfolio.positions[symbol].amount:
            # 当价格下穿20日均线，且当前有持仓，则卖出
            order_target_percent(symbol, 0)`;

interface StrategyEditorProps {
  strategy?: Strategy;
  onSave?: (strategy: Strategy) => void;
}

const StrategyEditor: React.FC<StrategyEditorProps> = ({ strategy, onSave }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [code, setCode] = useState(strategy?.parameters?.code || defaultCode);
  const [loading, setLoading] = useState(false);

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      const strategyData = {
        ...values,
        parameters: {
          ...values.parameters,
          code,
        },
      };

      if (strategy?.id) {
        await strategyApi.updateStrategy(strategy.id, strategyData);
      } else {
        await strategyApi.createStrategy(strategyData);
      }

      onSave?.(strategyData as Strategy);
    } catch (error) {
      console.error('Failed to save strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      initialValues={strategy || {
        type: 'custom',
        parameters: {
          timeframe: '1d',
          maxPositions: 5,
          stopLoss: 5,
          takeProfit: 10,
        },
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Card title="基本信息">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="策略名称"
                  rules={[{ required: true, message: '请输入策略名称' }]}
                >
                  <Input placeholder="请输入策略名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="策略类型"
                  rules={[{ required: true, message: '请选择策略类型' }]}
                >
                  <Select placeholder="请选择策略类型">
                    <Option value="momentum">动量策略</Option>
                    <Option value="mean_reversion">均值回归</Option>
                    <Option value="arbitrage">套利策略</Option>
                    <Option value="custom">自定义策略</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="策略描述"
            >
              <Input.TextArea rows={4} placeholder="请输入策略描述" />
            </Form.Item>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="策略参数">
            <Tabs defaultActiveKey="code">
              <TabPane tab="代码编辑器" key="code">
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 2 }}>
                  <MonacoEditor
                    height="500px"
                    language="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                    }}
                  />
                </div>
              </TabPane>
              <TabPane tab="参数配置" key="params">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['parameters', 'timeframe']}
                      label="交易周期"
                      rules={[{ required: true, message: '请选择交易周期' }]}
                    >
                      <Select placeholder="请选择交易周期">
                        <Option value="1m">1分钟</Option>
                        <Option value="5m">5分钟</Option>
                        <Option value="15m">15分钟</Option>
                        <Option value="1h">1小时</Option>
                        <Option value="1d">1天</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['parameters', 'maxPositions']}
                      label="最大持仓数"
                      rules={[{ required: true, message: '请输入最大持仓数' }]}
                    >
                      <InputNumber
                        min={1}
                        max={100}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['parameters', 'stopLoss']}
                      label="止损比例 (%)"
                      rules={[{ required: true, message: '请输入止损比例' }]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['parameters', 'takeProfit']}
                      label="止盈比例 (%)"
                      rules={[{ required: true, message: '请输入止盈比例' }]}
                    >
                      <InputNumber
                        min={0}
                        max={1000}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存策略
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

export default StrategyEditor; 
import React from 'react';
import { Card, Steps, Button, Space } from 'antd';
import styled from 'styled-components';
import StrategyConfig from '../StrategyConfig';
import StrategyEditor from '../StrategyEditor';
import TemplateList from '../TemplateList';

const { Step } = Steps;

const StyledCard = styled(Card)`
  .ant-steps {
    margin-bottom: 24px;
  }
`;

const StepContent = styled.div`
  min-height: 400px;
`;

interface StrategyCreateProps {
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const StrategyCreate: React.FC<StrategyCreateProps> = ({ onSubmit, loading }) => {
  const [current, setCurrent] = React.useState(0);
  const [formData, setFormData] = React.useState<any>({});
  const [code, setCode] = React.useState('');

  const handleTemplateSelect = (template: any) => {
    setFormData({
      name: template.name,
      type: template.type,
      description: template.description,
      symbols: [],
      timeframe: '1h',
      enabled: false,
    });
    setCode(template.code);
    setCurrent(1);
  };

  const handleConfigSubmit = (values: any) => {
    setFormData({ ...formData, ...values });
    setCurrent(2);
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      code,
    });
  };

  const steps = [
    {
      title: '选择模板',
      content: <TemplateList onSelect={handleTemplateSelect} />,
    },
    {
      title: '基本配置',
      content: (
        <StrategyConfig
          initialValues={formData}
          onSubmit={handleConfigSubmit}
          loading={loading}
        />
      ),
    },
    {
      title: '编写代码',
      content: (
        <StrategyEditor
          code={code}
          onChange={setCode}
          onSave={handleSubmit}
          onRun={() => {}}
          onStop={() => {}}
          loading={loading}
        />
      ),
    },
  ];

  return (
    <StyledCard
      title="创建策略"
      extra={
        <Space>
          {current > 0 && (
            <Button onClick={() => setCurrent(current - 1)}>
              上一步
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => setCurrent(current + 1)}>
              下一步
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              完成
            </Button>
          )}
        </Space>
      }
    >
      <Steps current={current}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <StepContent>
        {steps[current].content}
      </StepContent>
    </StyledCard>
  );
};

export default StrategyCreate; 
import React from 'react';
import { Card, Form, Upload, Input, Button, Progress, Steps, Space, Alert, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { UploadOutlined, RobotOutlined, ExperimentOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { UploadFile } from 'antd/es/upload/interface';
import type { AIModel } from '@/types/ai';

const { Text } = Typography;
const { Step } = Steps;

const StyledCard = styled(Card)`
  .ant-steps {
    margin-bottom: 24px;
  }
  
  .ant-upload {
    width: 100%;
  }
`;

interface TrainingStatus {
  step: number;
  progress: number;
  message: string;
  error?: string;
}

interface ModelTrainerProps {
  model: AIModel;
  onTrain: (config: any) => Promise<void>;
  loading?: boolean;
}

const ModelTrainer: React.FC<ModelTrainerProps> = ({
  model,
  onTrain,
  loading,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [status, setStatus] = React.useState<TrainingStatus>({
    step: 0,
    progress: 0,
    message: '',
  });
  const [trainingFiles, setTrainingFiles] = React.useState<UploadFile[]>([]);

  const handleTrain = async (values: any) => {
    try {
      setStatus({
        step: 0,
        progress: 0,
        message: t('ai.training.preparing'),
      });

      // 数据预处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus({
        step: 1,
        progress: 20,
        message: t('ai.training.preprocessing'),
      });

      // 模型训练
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStatus({
        step: 2,
        progress: 60,
        message: t('ai.training.training'),
      });

      // 模型评估
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus({
        step: 3,
        progress: 80,
        message: t('ai.training.evaluating'),
      });

      // 模型保存
      await onTrain({
        ...values,
        files: trainingFiles,
      });

      setStatus({
        step: 4,
        progress: 100,
        message: t('ai.training.completed'),
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: t('ai.training.error'),
      }));
    }
  };

  return (
    <StyledCard title={t('ai.training.title')}>
      <Steps current={status.step}>
        <Step title={t('ai.training.steps.prepare')} />
        <Step title={t('ai.training.steps.preprocess')} />
        <Step title={t('ai.training.steps.train')} />
        <Step title={t('ai.training.steps.evaluate')} />
        <Step title={t('ai.training.steps.save')} />
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleTrain}
      >
        <Form.Item
          name="trainingData"
          label={t('ai.training.data')}
          rules={[{ required: true }]}
        >
          <Upload
            accept=".csv,.json,.txt"
            fileList={trainingFiles}
            onChange={({ fileList }) => setTrainingFiles(fileList)}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>
              {t('ai.training.upload')}
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="epochs"
          label={t('ai.training.epochs')}
          rules={[{ required: true }]}
        >
          <Input type="number" min={1} max={100} />
        </Form.Item>

        <Form.Item
          name="batchSize"
          label={t('ai.training.batchSize')}
          rules={[{ required: true }]}
        >
          <Input type="number" min={1} max={128} />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<ExperimentOutlined />}
              htmlType="submit"
              loading={loading}
              block
            >
              {t('ai.training.start')}
            </Button>

            {status.message && (
              <Alert
                message={status.message}
                type={status.error ? 'error' : 'info'}
                showIcon
              />
            )}

            {status.progress > 0 && (
              <Progress
                percent={status.progress}
                status={status.error ? 'exception' : 'active'}
              />
            )}
          </Space>
        </Form.Item>
      </Form>
    </StyledCard>
  );
};

export default ModelTrainer; 
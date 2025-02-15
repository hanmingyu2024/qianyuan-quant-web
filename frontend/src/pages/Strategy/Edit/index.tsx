import React from 'react';
import { Layout, message } from 'antd';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import StrategyConfig from '@/components/Strategy/StrategyConfig';
import StrategyEditor from '@/components/Strategy/StrategyEditor';
import request from '@/utils/request';

const { Content } = Layout;

const StyledContent = styled(Content)`
  padding: 16px;
`;

const Edit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [strategy, setStrategy] = React.useState<any>(null);
  const [code, setCode] = React.useState('');

  React.useEffect(() => {
    fetchStrategy();
  }, [id]);

  const fetchStrategy = async () => {
    try {
      const data = await request.get(`/api/strategy/${id}`);
      setStrategy(data);
      setCode(data.code);
    } catch (error) {
      message.error('获取策略信息失败');
    }
  };

  const handleConfigSubmit = async (values: any) => {
    try {
      setLoading(true);
      await request.put(`/api/strategy/${id}`, values);
      message.success('保存配置成功');
      fetchStrategy();
    } catch (error) {
      message.error('保存配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSave = async () => {
    try {
      setLoading(true);
      await request.put(`/api/strategy/${id}/code`, { code });
      message.success('保存代码成功');
    } catch (error) {
      message.error('保存代码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    try {
      setLoading(true);
      await request.post(`/api/strategy/${id}/run`);
      setRunning(true);
      message.success('策略启动成功');
    } catch (error) {
      message.error('策略启动失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      await request.post(`/api/strategy/${id}/stop`);
      setRunning(false);
      message.success('策略停止成功');
    } catch (error) {
      message.error('策略停止失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContent>
      <StrategyConfig
        initialValues={strategy}
        onSubmit={handleConfigSubmit}
        loading={loading}
      />
      <StrategyEditor
        code={code}
        onChange={setCode}
        onSave={handleCodeSave}
        onRun={handleRun}
        onStop={handleStop}
        running={running}
        loading={loading}
      />
    </StyledContent>
  );
};

export default Edit; 
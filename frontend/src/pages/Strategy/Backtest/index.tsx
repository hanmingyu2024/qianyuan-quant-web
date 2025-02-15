import React from 'react';
import { Layout, message } from 'antd';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import BacktestForm from '@/components/Strategy/BacktestForm';
import BacktestResult from '@/components/Strategy/BacktestResult';
import request from '@/utils/request';

const { Content } = Layout;

const StyledContent = styled(Content)`
  padding: 16px;
`;

const Backtest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const data = await request.post(`/api/strategy/${id}/backtest`, values);
      setResult(data);
      message.success('回测完成');
    } catch (error) {
      message.error('回测失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContent>
      <BacktestForm onSubmit={handleSubmit} loading={loading} />
      {result && <BacktestResult data={result} />}
    </StyledContent>
  );
};

export default Backtest; 
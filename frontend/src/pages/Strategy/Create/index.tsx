import React from 'react';
import { Layout, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StrategyCreate from '@/components/Strategy/StrategyCreate';
import request from '@/utils/request';

const { Content } = Layout;

const StyledContent = styled(Content)`
  padding: 16px;
`;

const Create: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const { id } = await request.post('/api/strategy', values);
      message.success('创建策略成功');
      navigate(`/strategy/${id}`);
    } catch (error) {
      message.error('创建策略失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContent>
      <StrategyCreate onSubmit={handleSubmit} loading={loading} />
    </StyledContent>
  );
};

export default Create; 
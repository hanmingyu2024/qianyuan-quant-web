import React from 'react';
import { Layout, Card, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StrategyList from '@/components/Strategy/StrategyList';
import request from '@/utils/request';

const { Content } = Layout;

const StyledContent = styled(Content)`
  padding: 16px;
`;

const List: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [strategies, setStrategies] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const data = await request.get('/api/strategies');
      setStrategies(data);
    } catch (error) {
      message.error('获取策略列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, enabled: boolean) => {
    try {
      await request.put(`/api/strategy/${id}`, { enabled });
      message.success('更新状态成功');
      fetchStrategies();
    } catch (error) {
      message.error('更新状态失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request.delete(`/api/strategy/${id}`);
      message.success('删除成功');
      fetchStrategies();
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <StyledContent>
      <Card
        title="策略列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/strategy/create')}
          >
            新建策略
          </Button>
        }
      >
        <StrategyList
          data={strategies}
          loading={loading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </Card>
    </StyledContent>
  );
};

export default List; 
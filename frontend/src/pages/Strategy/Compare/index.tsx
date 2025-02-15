import React from 'react';
import { Layout, Card, Select, Button, message } from 'antd';
import styled from 'styled-components';
import Comparison from '@/components/Strategy/Comparison';
import request from '@/utils/request';

const { Content } = Layout;
const { Option } = Select;

const StyledContent = styled(Content)`
  padding: 16px;
`;

const Compare: React.FC = () => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [strategies, setStrategies] = React.useState<any[]>([]);
  const [allStrategies, setAllStrategies] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchAllStrategies();
  }, []);

  const fetchAllStrategies = async () => {
    try {
      const data = await request.get('/api/strategies');
      setAllStrategies(data);
    } catch (error) {
      message.error('获取策略列表失败');
    }
  };

  const handleStrategySelect = async (ids: string[]) => {
    try {
      setSelectedIds(ids);
      const data = await request.post('/api/strategies/compare', { ids });
      setStrategies(data);
    } catch (error) {
      message.error('获取策略对比数据失败');
    }
  };

  return (
    <StyledContent>
      <Card style={{ marginBottom: 16 }}>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="请选择要对比的策略"
          value={selectedIds}
          onChange={handleStrategySelect}
        >
          {allStrategies.map((strategy) => (
            <Option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </Option>
          ))}
        </Select>
      </Card>
      <Comparison
        strategies={strategies}
        onStrategySelect={handleStrategySelect}
      />
    </StyledContent>
  );
};

export default Compare; 
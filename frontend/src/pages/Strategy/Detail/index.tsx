import React from 'react';
import { Layout, Card, Tabs, message } from 'antd';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Monitor from '@/components/Strategy/Monitor';
import BacktestForm from '@/components/Strategy/BacktestForm';
import BacktestResult from '@/components/Strategy/BacktestResult';
import StrategyForm from '@/components/Strategy/StrategyForm';
import request from '@/utils/request';
import LogViewer from '@/components/Strategy/LogViewer';
import ParamConfig from '@/components/Strategy/ParamConfig';
import Performance from '@/components/Strategy/Performance';

const { Content } = Layout;
const { TabPane } = Tabs;

const StyledContent = styled(Content)`
  padding: 16px;
`;

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(false);
  const [strategy, setStrategy] = React.useState<any>(null);
  const [monitorData, setMonitorData] = React.useState<any>(null);
  const [backtestResult, setBacktestResult] = React.useState<any>(null);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [logsLoading, setLogsLoading] = React.useState(false);

  React.useEffect(() => {
    fetchStrategy();
    fetchMonitorData();
  }, [id]);

  const fetchStrategy = async () => {
    try {
      const data = await request.get(`/api/strategy/${id}`);
      setStrategy(data);
    } catch (error) {
      message.error('获取策略信息失败');
    }
  };

  const fetchMonitorData = async () => {
    try {
      const data = await request.get(`/api/strategy/${id}/monitor`);
      setMonitorData(data);
    } catch (error) {
      message.error('获取监控数据失败');
    }
  };

  const handleBacktest = async (values: any) => {
    try {
      setLoading(true);
      const data = await request.post(`/api/strategy/${id}/backtest`, values);
      setBacktestResult(data);
      message.success('回测完成');
    } catch (error) {
      message.error('回测失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values: any) => {
    try {
      await request.put(`/api/strategy/${id}`, values);
      message.success('更新成功');
      fetchStrategy();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const fetchLogs = async (timeRange?: [number, number]) => {
    try {
      setLogsLoading(true);
      const params = timeRange ? { startTime: timeRange[0], endTime: timeRange[1] } : {};
      const data = await request.get(`/api/strategy/${id}/logs`, { params });
      setLogs(data);
    } catch (error) {
      message.error('获取日志失败');
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <StyledContent>
      <Card>
        <Tabs defaultActiveKey="monitor">
          <TabPane tab="策略监控" key="monitor">
            {monitorData && <Monitor data={monitorData} />}
          </TabPane>
          <TabPane tab="策略回测" key="backtest">
            <BacktestForm onSubmit={handleBacktest} loading={loading} />
            {backtestResult && <BacktestResult data={backtestResult} />}
          </TabPane>
          <TabPane tab="策略配置" key="config">
            {strategy && (
              <StrategyForm
                initialValues={strategy}
                onSubmit={handleUpdate}
                onCancel={() => {}}
              />
            )}
          </TabPane>
          <TabPane tab="运行日志" key="logs">
            <LogViewer
              loading={logsLoading}
              data={logs}
              onRefresh={fetchLogs}
              onTimeRangeChange={fetchLogs}
              onDownload={() => {/* 实现日志导出 */}}
            />
          </TabPane>
          <TabPane tab="性能分析" key="performance">
            {strategy && <Performance data={strategy.performance} />}
          </TabPane>
        </Tabs>
      </Card>
    </StyledContent>
  );
};

export default Detail; 
import * as React from 'react';
import { Card, Space, Button, Tooltip, Dropdown, Menu } from 'antd';
import * as echarts from 'echarts';
import styled from 'styled-components';
import {
  LineChartOutlined,
  BarChartOutlined,
  DotChartOutlined,
  AreaChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const ChartContainer = styled.div`
  height: 600px;
  .chart-main {
    height: 70%;
  }
  .chart-volume {
    height: 30%;
  }
`;

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid ${props => props.theme.colorBorder};
`;

interface ChartData {
  time: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  indicators: Record<string, number[]>;
}

interface AdvancedChartProps {
  data: ChartData;
  indicators: string[];
  onTimeRangeChange?: (range: [number, number]) => void;
  onIndicatorChange?: (indicators: string[]) => void;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  data,
  indicators,
  onTimeRangeChange,
  onIndicatorChange,
}) => {
  const mainChartRef = React.useRef<HTMLDivElement>(null);
  const volumeChartRef = React.useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = React.useState<'candlestick' | 'line' | 'area'>('candlestick');

  React.useEffect(() => {
    if (!mainChartRef.current || !volumeChartRef.current) return;

    const mainChart = echarts.init(mainChartRef.current);
    const volumeChart = echarts.init(volumeChartRef.current);

    const mainOption = {
      animation: false,
      legend: {
        data: ['K线', ...indicators],
        top: 0,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      axisPointer: {
        link: { xAxisIndex: 'all' },
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
        },
      ],
      grid: [
        {
          left: '10%',
          right: '10%',
          top: '10%',
          height: '60%',
        },
      ],
      xAxis: {
        type: 'category',
        data: data.time,
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      series: [
        {
          name: 'K线',
          type: chartType === 'candlestick' ? 'candlestick' : 'line',
          data: data.time.map((t, i) => [
            data.open[i],
            data.close[i],
            data.low[i],
            data.high[i],
          ]),
          areaStyle: chartType === 'area' ? {} : undefined,
        },
        ...indicators.map(ind => ({
          name: ind,
          type: 'line',
          data: data.indicators[ind],
        })),
      ],
    };

    const volumeOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '10%',
        height: '70%',
      },
      xAxis: {
        type: 'category',
        data: data.time,
      },
      yAxis: {
        scale: true,
      },
      series: [
        {
          name: '成交量',
          type: 'bar',
          data: data.volume,
          itemStyle: {
            color: (params: any) => {
              return data.close[params.dataIndex] > data.open[params.dataIndex]
                ? '#ef5350'
                : '#26a69a';
            },
          },
        },
      ],
    };

    mainChart.setOption(mainOption);
    volumeChart.setOption(volumeOption);

    const handleResize = () => {
      mainChart.resize();
      volumeChart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mainChart.dispose();
      volumeChart.dispose();
    };
  }, [data, indicators, chartType]);

  const indicatorMenu = (
    <Menu>
      <Menu.ItemGroup title="趋势指标">
        <Menu.Item key="MA">MA - 移动平均线</Menu.Item>
        <Menu.Item key="EMA">EMA - 指数移动平均线</Menu.Item>
        <Menu.Item key="MACD">MACD - 指数平滑异同移动平均线</Menu.Item>
      </Menu.ItemGroup>
      <Menu.ItemGroup title="动量指标">
        <Menu.Item key="RSI">RSI - 相对强弱指标</Menu.Item>
        <Menu.Item key="KDJ">KDJ - 随机指标</Menu.Item>
        <Menu.Item key="CCI">CCI - 顺势指标</Menu.Item>
      </Menu.ItemGroup>
      <Menu.ItemGroup title="波动指标">
        <Menu.Item key="BOLL">BOLL - 布林带</Menu.Item>
        <Menu.Item key="ATR">ATR - 真实波幅</Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  );

  return (
    <Card bodyStyle={{ padding: 0 }}>
      <ToolbarContainer>
        <Space>
          <Tooltip title="K线图">
            <Button
              type={chartType === 'candlestick' ? 'primary' : 'text'}
              icon={<LineChartOutlined />}
              onClick={() => setChartType('candlestick')}
            />
          </Tooltip>
          <Tooltip title="分时图">
            <Button
              type={chartType === 'line' ? 'primary' : 'text'}
              icon={<BarChartOutlined />}
              onClick={() => setChartType('line')}
            />
          </Tooltip>
          <Tooltip title="面积图">
            <Button
              type={chartType === 'area' ? 'primary' : 'text'}
              icon={<AreaChartOutlined />}
              onClick={() => setChartType('area')}
            />
          </Tooltip>
          <Dropdown overlay={indicatorMenu}>
            <Button icon={<DotChartOutlined />}>
              添加指标
            </Button>
          </Dropdown>
        </Space>
        <Button icon={<SettingOutlined />}>图表设置</Button>
      </ToolbarContainer>
      <ChartContainer>
        <div className="chart-main" ref={mainChartRef} />
        <div className="chart-volume" ref={volumeChartRef} />
      </ChartContainer>
    </Card>
  );
};

export default AdvancedChart; 
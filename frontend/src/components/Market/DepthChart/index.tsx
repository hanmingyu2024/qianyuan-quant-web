import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Card } from 'antd'
import { useMarketStore } from '@/store/useMarketStore'
import styles from './style.module.css'

interface DepthChartProps {
  symbol: string
}

const DepthChart: React.FC<DepthChartProps> = ({ symbol }) => {
  const { marketData } = useMarketStore()
  const depthData = marketData[symbol]?.depth || { bids: [], asks: [] }

  const option = {
    title: {
      text: '深度图',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: (params: any) => {
        const bid = params[0]
        const ask = params[1]
        return `
          价格: ${bid ? bid.data[0] : ask.data[0]}<br/>
          ${bid ? '买单: ' + bid.data[1] + '<br/>' : ''}
          ${ask ? '卖单: ' + ask.data[1] : ''}
        `
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '价格',
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: '数量',
    },
    series: [
      {
        name: '买单',
        type: 'line',
        step: 'start',
        data: depthData.bids,
        areaStyle: {
          color: 'rgba(82, 196, 26, 0.2)',
        },
        lineStyle: {
          color: '#52c41a',
        },
        itemStyle: {
          color: '#52c41a',
        },
      },
      {
        name: '卖单',
        type: 'line',
        step: 'start',
        data: depthData.asks,
        areaStyle: {
          color: 'rgba(255, 77, 79, 0.2)',
        },
        lineStyle: {
          color: '#ff4d4f',
        },
        itemStyle: {
          color: '#ff4d4f',
        },
      },
    ],
  }

  return (
    <Card className={styles.card}>
      <ReactECharts option={option} className={styles.chart} />
    </Card>
  )
}

export default DepthChart 
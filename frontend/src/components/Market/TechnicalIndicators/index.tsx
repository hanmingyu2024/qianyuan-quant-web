import React from 'react'
import { Card, Tabs, Select } from 'antd'
import ReactECharts from 'echarts-for-react'
import { calculateMA, calculateRSI, calculateMACD, calculateBollinger, calculateKDJ } from '@/utils/indicators'
import { useMarketStore } from '@/store/useMarketStore'
import styles from './style.module.css'

const { Option } = Select

interface TechnicalIndicatorsProps {
  symbol: string
  baseOption?: any
  timeframe?: string
}

const TechnicalIndicators = React.forwardRef<any, TechnicalIndicatorsProps>(
  ({ symbol, baseOption, timeframe }, ref) => {
    const { marketData } = useMarketStore()
    const klineData = marketData[symbol]?.kline || []
    const [maSettings, setMaSettings] = React.useState([5, 10, 20])
    const [rsiPeriod, setRsiPeriod] = React.useState(14)
    const [macdSettings, setMacdSettings] = React.useState({
      short: 12,
      long: 26,
      signal: 9,
    })
    const [bollingerSettings, setBollingerSettings] = React.useState({
      period: 20,
      multiplier: 2,
    })
    const [kdjPeriod, setKdjPeriod] = React.useState(9)

    const maOption = {
      ...baseOption,
      title: {
        text: '移动平均线',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: maSettings.map(period => `MA${period}`),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: klineData.map(item => item.time),
      },
      yAxis: {
        type: 'value',
        scale: true,
      },
      series: maSettings.map(period => ({
        name: `MA${period}`,
        type: 'line',
        data: calculateMA(klineData, period),
        smooth: true,
      })),
    }

    const rsiOption = {
      title: {
        text: 'RSI指标',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: klineData.map(item => item.time),
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: `RSI(${rsiPeriod})`,
          type: 'line',
          data: calculateRSI(klineData, rsiPeriod),
          markLine: {
            data: [
              { yAxis: 70, lineStyle: { color: '#ff4d4f' } },
              { yAxis: 30, lineStyle: { color: '#52c41a' } },
            ],
          },
        },
      ],
    }

    const macdData = calculateMACD(klineData, macdSettings)
    const macdOption = {
      title: {
        text: 'MACD指标',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['MACD', 'DIF', 'DEA'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: klineData.map(item => item.time),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'MACD',
          type: 'bar',
          data: macdData.macd,
          itemStyle: {
            color: (params: any) => {
              return params.data >= 0 ? '#52c41a' : '#ff4d4f'
            },
          },
        },
        {
          name: 'DIF',
          type: 'line',
          data: macdData.dif,
        },
        {
          name: 'DEA',
          type: 'line',
          data: macdData.dea,
        },
      ],
    }

    const bollingerData = calculateBollinger(klineData, bollingerSettings.period, bollingerSettings.multiplier)
    const bollingerOption = {
      title: {
        text: '布林带',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['MA', '上轨', '下轨', '收盘价'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: klineData.map(item => item.time),
      },
      yAxis: {
        type: 'value',
        scale: true,
      },
      series: [
        {
          name: 'MA',
          type: 'line',
          data: bollingerData.ma,
          smooth: true,
        },
        {
          name: '上轨',
          type: 'line',
          data: bollingerData.upperBand,
          lineStyle: { opacity: 0.5 },
          smooth: true,
        },
        {
          name: '下轨',
          type: 'line',
          data: bollingerData.lowerBand,
          lineStyle: { opacity: 0.5 },
          smooth: true,
        },
        {
          name: '收盘价',
          type: 'line',
          data: klineData.map(item => item.close),
          smooth: true,
        },
      ],
    }

    const kdjData = calculateKDJ(klineData, kdjPeriod)
    const kdjOption = {
      title: {
        text: 'KDJ指标',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['K', 'D', 'J'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: klineData.map(item => item.time),
      },
      yAxis: {
        type: 'value',
        scale: true,
      },
      series: [
        {
          name: 'K',
          type: 'line',
          data: kdjData.k,
          smooth: true,
        },
        {
          name: 'D',
          type: 'line',
          data: kdjData.d,
          smooth: true,
        },
        {
          name: 'J',
          type: 'line',
          data: kdjData.j,
          smooth: true,
        },
      ],
    }

    return (
      <Card className={styles.card}>
        <Tabs
          items={[
            {
              key: 'ma',
              label: '移动平均线',
              children: (
                <>
                  <div className={styles.settings}>
                    <Select
                      mode="multiple"
                      value={maSettings}
                      onChange={setMaSettings}
                      style={{ width: 200 }}
                    >
                      {[5, 10, 20, 30, 60].map(period => (
                        <Option key={period} value={period}>
                          MA{period}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <ReactECharts
                    ref={ref}
                    option={maOption}
                    className={styles.chart}
                  />
                </>
              ),
            },
            {
              key: 'rsi',
              label: 'RSI',
              children: (
                <>
                  <div className={styles.settings}>
                    <Select
                      value={rsiPeriod}
                      onChange={setRsiPeriod}
                      style={{ width: 120 }}
                    >
                      {[6, 12, 14, 24].map(period => (
                        <Option key={period} value={period}>
                          RSI{period}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <ReactECharts option={rsiOption} className={styles.chart} />
                </>
              ),
            },
            {
              key: 'macd',
              label: 'MACD',
              children: (
                <>
                  <div className={styles.settings}>
                    <Select
                      value={macdSettings.short}
                      onChange={value => setMacdSettings({ ...macdSettings, short: value })}
                      style={{ width: 80 }}
                    >
                      {[12, 10, 15].map(period => (
                        <Option key={period} value={period}>
                          {period}
                        </Option>
                      ))}
                    </Select>
                    <Select
                      value={macdSettings.long}
                      onChange={value => setMacdSettings({ ...macdSettings, long: value })}
                      style={{ width: 80 }}
                    >
                      {[26, 20, 30].map(period => (
                        <Option key={period} value={period}>
                          {period}
                        </Option>
                      ))}
                    </Select>
                    <Select
                      value={macdSettings.signal}
                      onChange={value => setMacdSettings({ ...macdSettings, signal: value })}
                      style={{ width: 80 }}
                    >
                      {[9, 7, 12].map(period => (
                        <Option key={period} value={period}>
                          {period}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <ReactECharts option={macdOption} className={styles.chart} />
                </>
              ),
            },
            {
              key: 'bollinger',
              label: '布林带',
              children: (
                <>
                  <div className={styles.settings}>
                    <Select
                      value={bollingerSettings.period}
                      onChange={period => setBollingerSettings({ ...bollingerSettings, period })}
                      style={{ width: 80 }}
                    >
                      {[10, 20, 30].map(period => (
                        <Option key={period} value={period}>
                          MA{period}
                        </Option>
                      ))}
                    </Select>
                    <Select
                      value={bollingerSettings.multiplier}
                      onChange={multiplier => setBollingerSettings({ ...bollingerSettings, multiplier })}
                      style={{ width: 80 }}
                    >
                      {[1.5, 2, 2.5, 3].map(value => (
                        <Option key={value} value={value}>
                          {value}σ
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <ReactECharts option={bollingerOption} className={styles.chart} />
                </>
              ),
            },
            {
              key: 'kdj',
              label: 'KDJ',
              children: (
                <>
                  <div className={styles.settings}>
                    <Select
                      value={kdjPeriod}
                      onChange={setKdjPeriod}
                      style={{ width: 120 }}
                    >
                      {[5, 9, 14, 19].map(period => (
                        <Option key={period} value={period}>
                          KDJ{period}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <ReactECharts option={kdjOption} className={styles.chart} />
                </>
              ),
            },
          ]}
        />
      </Card>
    )
  }
)

export default TechnicalIndicators 
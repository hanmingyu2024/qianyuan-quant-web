import React from 'react'
import { Layout, Card, Row, Col } from 'antd'
import styled from 'styled-components'
import KlineChart from '@/components/Market/KlineChart'
import OrderBook from '@/components/Market/OrderBook'
import TradeHistory from '@/components/Market/TradeHistory'
import MarketInfo from '@/components/Market/MarketInfo'

const { Content } = Layout

const StyledContent = styled(Content)`
  padding: 16px;
`

const Market: React.FC = () => {
  return (
    <StyledContent>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <MarketInfo />
        </Col>
        <Col span={18}>
          <Card>
            <KlineChart />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="深度图" style={{ marginBottom: 16 }}>
            <OrderBook />
          </Card>
          <Card title="成交历史">
            <TradeHistory />
          </Card>
        </Col>
      </Row>
    </StyledContent>
  )
}

export default Market 
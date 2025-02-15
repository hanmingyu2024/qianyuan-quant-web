import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const InfoCard = styled(Card)`
  .ant-statistic-title {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  .ant-statistic-content {
    font-size: 14px;
  }
`;

const MarketInfo: React.FC = () => {
  const marketInfo = useSelector((state: RootState) => state.market.currentMarket);

  return (
    <InfoCard>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title="最新价"
            value={marketInfo.lastPrice}
            precision={2}
            valueStyle={{ color: marketInfo.priceChange >= 0 ? '#52c41a' : '#f5222d' }}
            prefix={marketInfo.priceChange >= 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="24h涨跌"
            value={marketInfo.priceChangePercent}
            precision={2}
            suffix="%"
            valueStyle={{ color: marketInfo.priceChange >= 0 ? '#52c41a' : '#f5222d' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="24h最高"
            value={marketInfo.highPrice}
            precision={2}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="24h最低"
            value={marketInfo.lowPrice}
            precision={2}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="24h成交量"
            value={marketInfo.volume}
            precision={2}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="24h成交额"
            value={marketInfo.quoteVolume}
            precision={2}
          />
        </Col>
      </Row>
    </InfoCard>
  );
};

export default MarketInfo; 
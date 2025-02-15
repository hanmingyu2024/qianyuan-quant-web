import React from 'react';
import { Layout, Card, Row, Col } from 'antd';
import styled from 'styled-components';
import OrderForm from '@/components/Trading/OrderForm';
import PositionList from '@/components/Trading/PositionList';
import OrderList from '@/components/Trading/OrderList';

const { Content } = Layout;

const StyledContent = styled(Content)`
  padding: 16px;
`;

const Trading: React.FC = () => {
  return (
    <StyledContent>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="下单">
            <OrderForm />
          </Card>
        </Col>
        <Col span={16}>
          <Card title="持仓" style={{ marginBottom: 16 }}>
            <PositionList />
          </Card>
          <Card title="委托">
            <OrderList />
          </Card>
        </Col>
      </Row>
    </StyledContent>
  );
};

export default Trading; 
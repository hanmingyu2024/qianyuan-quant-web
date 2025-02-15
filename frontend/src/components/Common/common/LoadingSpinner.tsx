import React from 'react';
import { Spin } from 'antd';
import styled from 'styled-components';

interface LoadingSpinnerProps {
  spinning?: boolean;
  fullScreen?: boolean;
  children?: React.ReactNode;
}

const FullScreenWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  spinning = true,
  fullScreen = false,
  children,
}) => {
  if (fullScreen) {
    return (
      <Spin spinning={spinning}>
        {spinning && (
          <FullScreenWrapper>
            <Spin size="large" />
          </FullScreenWrapper>
        )}
        {children}
      </Spin>
    );
  }

  return <Spin spinning={spinning}>{children}</Spin>;
};

export default LoadingSpinner; 
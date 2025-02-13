import React from 'react'
import { Spin } from 'antd'

interface LoadingWrapperProps {
  loading: boolean
  children: React.ReactNode
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  children,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return <>{children}</>
}

export default LoadingWrapper 
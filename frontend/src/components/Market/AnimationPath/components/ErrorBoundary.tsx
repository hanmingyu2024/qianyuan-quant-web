import React from 'react'
import { Result, Button } from 'antd'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Animation Path Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="组件出错了"
          subTitle={this.state.error?.message}
          extra={[
            <Button
              type="primary"
              onClick={() => this.setState({ hasError: false })}
            >
              重试
            </Button>
          ]}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 
import { PathError } from '../errors'

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorListeners: ((error: Error) => void)[] = []

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  addListener(listener: (error: Error) => void) {
    this.errorListeners.push(listener)
  }

  removeListener(listener: (error: Error) => void) {
    this.errorListeners = this.errorListeners.filter(l => l !== listener)
  }

  handleError(error: Error | PathError) {
    console.error('AnimationPath Error:', error)
    this.errorListeners.forEach(listener => listener(error))
  }

  async wrapAsync<T>(
    operation: () => Promise<T>,
    errorMessage = '操作失败'
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof PathError) {
        this.handleError(error)
        throw error
      } else {
        const wrappedError = new PathError('OPERATION_FAILED', {
          message: errorMessage,
          originalError: error,
        })
        this.handleError(wrappedError)
        throw wrappedError
      }
    }
  }

  wrap<T>(
    operation: () => T,
    errorMessage = '操作失败'
  ): T {
    try {
      return operation()
    } catch (error) {
      if (error instanceof PathError) {
        this.handleError(error)
        throw error
      } else {
        const wrappedError = new PathError('OPERATION_FAILED', {
          message: errorMessage,
          originalError: error,
        })
        this.handleError(wrappedError)
        throw wrappedError
      }
    }
  }
}

export const errorHandler = ErrorHandler.getInstance()

// 错误边界的高阶组件
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
      return { hasError: true }
    }

    componentDidCatch(error: Error) {
      errorHandler.handleError(error)
    }

    render() {
      if (this.state.hasError) {
        return <div>组件出错了，请刷新页面重试</div>
      }

      return <WrappedComponent {...this.props} />
    }
  }
}

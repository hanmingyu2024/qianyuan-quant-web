import { notification } from 'antd';
import { useI18n } from '@/utils/i18n';
import { cacheService } from '@/services/cacheService';

interface ErrorLog {
  timestamp: string;
  error: string;
  stack?: string;
  context?: Record<string, any>;
}

class ErrorService {
  private maxLogSize = 100;
  private logKey = 'error_logs';

  constructor() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleError(error || new Error(message as string), {
        source,
        line: lineno,
        column: colno,
      });
    };

    window.onunhandledrejection = (event) => {
      this.handleError(event.reason, { type: 'unhandledRejection' });
    };
  }

  private getErrorLogs(): ErrorLog[] {
    return cacheService.get<ErrorLog[]>(this.logKey) || [];
  }

  private saveErrorLog(log: ErrorLog) {
    const logs = this.getErrorLogs();
    logs.unshift(log);
    
    // 保持日志数量在限制内
    if (logs.length > this.maxLogSize) {
      logs.length = this.maxLogSize;
    }
    
    cacheService.set(this.logKey, logs);
  }

  handleError(error: Error, context?: Record<string, any>) {
    console.error('Error occurred:', error);

    // 记录错误日志
    this.saveErrorLog({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context,
    });

    // 显示错误通知
    notification.error({
      message: 'Error',
      description: error.message,
    });
  }

  clearLogs() {
    cacheService.remove(this.logKey);
  }

  getLogs() {
    return this.getErrorLogs();
  }
}

export const errorService = new ErrorService();

// React Hook for error handling
export function useError() {
  const { t } = useI18n();

  const handleError = (error: Error, context?: Record<string, any>) => {
    errorService.handleError(error, context);
  };

  return {
    handleError,
    errorLogs: errorService.getLogs(),
    clearLogs: errorService.clearLogs,
  };
} 
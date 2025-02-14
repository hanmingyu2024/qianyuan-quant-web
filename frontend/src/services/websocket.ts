import { message } from 'antd';
import { WS_BASE_URL } from './config';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private subscribers: Map<string, Function[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  connect() {
    if (this.isConnecting || (this.ws?.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    try {
      console.log('Connecting to WebSocket server...');
      this.ws = new WebSocket(WS_BASE_URL);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully');
      this.reconnectAttempts = 0;
      message.success('实时数据连接成功');
      
      // 发送认证信息
      const token = localStorage.getItem('token');
      if (token) {
        this.send({ type: 'auth', token });
      }

      // 设置心跳检测
      this.setupHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') {
          return; // 忽略心跳响应
        }
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.clearHeartbeat();
      
      if (event.code === 1000) {
        // 正常关闭
        message.info('实时数据连接已关闭');
      } else {
        console.log('Abnormal closure, attempting to reconnect...');
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      message.error('实时数据连接出错，正在重试...');
    };
  }

  private setupHeartbeat() {
    this.clearHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // 每30秒发送一次心跳
  }

  private clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      message.error('实时数据连接失败，请刷新页面重试');
    }
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const subscribers = this.subscribers.get(type) || [];
    subscribers.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error in subscriber callback for type ${type}:`, error);
      }
    });
  }

  subscribe(type: string, callback: Function) {
    const subscribers = this.subscribers.get(type) || [];
    if (!subscribers.includes(callback)) {
      subscribers.push(callback);
      this.subscribers.set(type, subscribers);
    }
  }

  unsubscribe(type: string, callback: Function) {
    const subscribers = this.subscribers.get(type) || [];
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
      this.subscribers.set(type, subscribers);
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        message.error('发送数据失败');
      }
    } else {
      console.error('WebSocket is not connected');
      message.error('实时数据未连接');
    }
  }

  disconnect() {
    this.clearHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
  }

  getStatus() {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      connecting: this.ws?.readyState === WebSocket.CONNECTING,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

export const wsService = new WebSocketService(); 
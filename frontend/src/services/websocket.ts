import { message } from 'antd';
import { WS_BASE_URL } from './config';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscribers: Map<string, Function[]> = new Map();

  constructor(private url: string) {}

  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, 1000 * Math.pow(2, this.reconnectAttempts));
      }
    };
  }

  subscribe(channel: string, callback: Function) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)?.push(callback);
  }

  private handleMessage(data: any) {
    const { channel, payload } = data;
    this.subscribers.get(channel)?.forEach(callback => callback(payload));
  }
}

export const wsService = new WebSocketManager(WS_BASE_URL); 
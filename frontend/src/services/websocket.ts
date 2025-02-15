import { store } from '@/store';
import { updateMarketInfo, updateKlineData, updateOrderBook, addTrade } from '@/store/slices/marketSlice';
import { updatePositions, updateOrders, updateAssets } from '@/store/slices/tradingSlice';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string) {}

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.subscribe();
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

  private subscribe() {
    if (!this.ws) return;
    
    // 订阅市场数据
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      channels: ['market', 'kline', 'depth', 'trade'],
      symbol: 'BTC/USDT',
    }));
  }

  private handleMessage(data: any) {
    const { type, payload } = data;

    switch (type) {
      case 'market':
        store.dispatch(updateMarketInfo(payload));
        break;
      case 'kline':
        store.dispatch(updateKlineData(payload));
        break;
      case 'depth':
        store.dispatch(updateOrderBook(payload));
        break;
      case 'trade':
        store.dispatch(addTrade(payload));
        break;
      case 'positions':
        store.dispatch(updatePositions(payload));
        break;
      case 'orders':
        store.dispatch(updateOrders(payload));
        break;
      case 'assets':
        store.dispatch(updateAssets(payload));
        break;
    }
  }
}

export const wsService = new WebSocketService('ws://localhost:8001/ws'); 
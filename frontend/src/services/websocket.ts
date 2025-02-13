import { WebSocketClient } from '@/utils/websocket'
import { useMarketStore } from '@/store/useMarketStore'

class MarketWebSocket {
  private ws: WebSocketClient | null = null
  private reconnectTimer: NodeJS.Timeout | null = null

  connect() {
    if (this.ws) {
      this.ws.close()
    }

    this.ws = new WebSocketClient('ws://localhost:8000/ws/market')
    
    this.ws.onMessage((data) => {
      try {
        const marketData = JSON.parse(data)
        useMarketStore.getState().setMarketData(marketData.symbol, marketData)
      } catch (error) {
        console.error('Failed to parse market data:', error)
      }
    })

    this.ws.onClose(() => {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
      }
      this.reconnectTimer = setTimeout(() => {
        this.connect()
      }, 3000)
    })
  }

  subscribe(symbol: string) {
    if (this.ws) {
      this.ws.send({
        type: 'subscribe',
        symbol,
      })
    }
  }

  unsubscribe(symbol: string) {
    if (this.ws) {
      this.ws.send({
        type: 'unsubscribe',
        symbol,
      })
    }
  }
}

export const marketWS = new MarketWebSocket() 
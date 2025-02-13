import { WebSocketClient } from '@/utils/websocket'
import { useOrderStore } from '@/store/useOrderStore'

class OrderWebSocket {
  private ws: WebSocketClient | null = null
  private reconnectTimer: NodeJS.Timeout | null = null

  connect() {
    if (this.ws) {
      this.ws.close()
    }

    this.ws = new WebSocketClient('ws://localhost:8000/ws/orders')
    
    this.ws.onMessage((data) => {
      try {
        const orderUpdate = JSON.parse(data)
        useOrderStore.getState().updateOrder(orderUpdate)
      } catch (error) {
        console.error('Failed to parse order update:', error)
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
}

export const orderWS = new OrderWebSocket() 
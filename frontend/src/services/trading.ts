import request from '@/utils/request'

export interface OrderRequest {
  symbol: string
  type: 'limit' | 'market'
  side: 'buy' | 'sell'
  price?: number
  amount: number
}

export const createOrder = async (orderData: OrderRequest) => {
  return request.post('/orders', orderData)
}

export const getOrders = async () => {
  return request.get('/orders')
}

export const cancelOrder = async (orderId: string) => {
  return request.delete(`/orders/${orderId}`)
}

export interface AdvancedOrderRequest extends OrderRequest {
  stopPrice?: number
  takeProfit?: number
  stopLoss?: number
  timeInForce: 'GTC' | 'IOC' | 'FOK'
}

export const createAdvancedOrder = async (orderData: AdvancedOrderRequest) => {
  return request.post('/orders/advanced', orderData)
} 
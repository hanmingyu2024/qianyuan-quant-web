import { create } from 'zustand'
import { getOrders, cancelOrder } from '@/services/trading'
import { message } from 'antd'

export interface Order {
  id: string
  symbol: string
  type: 'limit' | 'market'
  side: 'buy' | 'sell'
  price: number
  amount: number
  status: 'pending' | 'filled' | 'cancelled'
  time: string
}

interface OrderState {
  orders: Order[]
  loading: boolean
  fetchOrders: () => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
  updateOrder: (order: Order) => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  fetchOrders: async () => {
    set({ loading: true })
    try {
      const orders = await getOrders()
      set({ orders })
    } catch (error) {
      message.error('获取订单列表失败')
    } finally {
      set({ loading: false })
    }
  },
  cancelOrder: async (orderId: string) => {
    try {
      await cancelOrder(orderId)
      await get().fetchOrders()
      message.success('订单取消成功')
    } catch (error) {
      message.error('订单取消失败')
    }
  },
  updateOrder: (order: Order) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === order.id ? order : o)),
    }))
  },
})) 
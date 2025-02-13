import { create } from 'zustand'

export interface MarketData {
  symbol: string
  price: number
  change: number
  volume: number
  high: number
  low: number
}

interface MarketState {
  marketData: Record<string, MarketData>
  setMarketData: (symbol: string, data: MarketData) => void
  selectedSymbol: string
  setSelectedSymbol: (symbol: string) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  marketData: {},
  setMarketData: (symbol, data) =>
    set((state) => ({
      marketData: {
        ...state.marketData,
        [symbol]: data,
      },
    })),
  selectedSymbol: 'BTC/USDT',
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
})) 
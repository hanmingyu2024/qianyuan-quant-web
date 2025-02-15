import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MarketState {
  currentMarket: {
    symbol: string;
    lastPrice: number;
    priceChange: number;
    priceChangePercent: number;
    highPrice: number;
    lowPrice: number;
    volume: number;
    quoteVolume: number;
  };
  klineData: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  orderBook: {
    asks: [number, number][];
    bids: [number, number][];
  };
  trades: {
    id: string;
    time: number;
    price: number;
    amount: number;
    direction: 'buy' | 'sell';
  }[];
}

const initialState: MarketState = {
  currentMarket: {
    symbol: 'BTC/USDT',
    lastPrice: 0,
    priceChange: 0,
    priceChangePercent: 0,
    highPrice: 0,
    lowPrice: 0,
    volume: 0,
    quoteVolume: 0,
  },
  klineData: [],
  orderBook: {
    asks: [],
    bids: [],
  },
  trades: [],
};

export const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    updateMarketInfo: (state, action: PayloadAction<typeof state.currentMarket>) => {
      state.currentMarket = action.payload;
    },
    updateKlineData: (state, action: PayloadAction<typeof state.klineData>) => {
      state.klineData = action.payload;
    },
    updateOrderBook: (state, action: PayloadAction<typeof state.orderBook>) => {
      state.orderBook = action.payload;
    },
    addTrade: (state, action: PayloadAction<typeof state.trades[0]>) => {
      state.trades = [action.payload, ...state.trades.slice(0, 99)];
    },
  },
});

export const { updateMarketInfo, updateKlineData, updateOrderBook, addTrade } = marketSlice.actions;

export default marketSlice.reducer; 
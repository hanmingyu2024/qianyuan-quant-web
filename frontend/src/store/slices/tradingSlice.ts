import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TradingState {
  positions: {
    symbol: string;
    direction: 'long' | 'short';
    amount: number;
    avgPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
  }[];
  orders: {
    id: string;
    symbol: string;
    type: 'limit' | 'market';
    direction: 'buy' | 'sell';
    price: number;
    amount: number;
    filled: number;
    status: 'pending' | 'partial' | 'completed' | 'canceled';
    time: string;
  }[];
  assets: {
    totalValue: number;
    availableValue: number;
    frozenValue: number;
    pnl: number;
    list: {
      currency: string;
      available: number;
      frozen: number;
      total: number;
    }[];
  };
}

const initialState: TradingState = {
  positions: [],
  orders: [],
  assets: {
    totalValue: 0,
    availableValue: 0,
    frozenValue: 0,
    pnl: 0,
    list: [],
  },
};

export const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    updatePositions: (state, action: PayloadAction<typeof state.positions>) => {
      state.positions = action.payload;
    },
    updateOrders: (state, action: PayloadAction<typeof state.orders>) => {
      state.orders = action.payload;
    },
    updateAssets: (state, action: PayloadAction<typeof state.assets>) => {
      state.assets = action.payload;
    },
  },
});

export const { updatePositions, updateOrders, updateAssets } = tradingSlice.actions;

export default tradingSlice.reducer; 
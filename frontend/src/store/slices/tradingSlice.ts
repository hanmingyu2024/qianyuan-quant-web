import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
  createTime: number;
  updateTime: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  profit: number;
  profitPercent: number;
}

interface TradingState {
  orders: Order[];
  positions: Position[];
  balance: number;
  loading: boolean;
  error: string | null;
}

const initialState: TradingState = {
  orders: [],
  positions: [],
  balance: 0,
  loading: false,
  error: null,
};

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Partial<Order> & { id: string }>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          ...action.payload,
          updateTime: Date.now(),
        };
      }
    },
    updatePositions: (state, action: PayloadAction<Position[]>) => {
      state.positions = action.payload;
    },
    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addOrder,
  updateOrder,
  updatePositions,
  updateBalance,
  setLoading,
  setError,
} = tradingSlice.actions;

export default tradingSlice.reducer; 
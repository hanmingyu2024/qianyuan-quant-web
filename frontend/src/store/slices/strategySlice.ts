import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'momentum' | 'mean_reversion' | 'arbitrage' | 'custom';
  status: 'active' | 'inactive' | 'backtest';
  parameters: Record<string, any>;
  createTime: number;
  updateTime: number;
}

export interface BacktestResult {
  strategyId: string;
  startTime: number;
  endTime: number;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: Array<{
    time: number;
    type: 'buy' | 'sell';
    symbol: string;
    price: number;
    quantity: number;
    profit: number;
  }>;
}

interface StrategyState {
  strategies: Strategy[];
  backtestResults: Record<string, BacktestResult>;
  selectedStrategy: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: StrategyState = {
  strategies: [],
  backtestResults: {},
  selectedStrategy: null,
  loading: false,
  error: null,
};

const strategySlice = createSlice({
  name: 'strategy',
  initialState,
  reducers: {
    addStrategy: (state, action: PayloadAction<Strategy>) => {
      state.strategies.push(action.payload);
    },
    updateStrategy: (state, action: PayloadAction<Partial<Strategy> & { id: string }>) => {
      const index = state.strategies.findIndex(strategy => strategy.id === action.payload.id);
      if (index !== -1) {
        state.strategies[index] = {
          ...state.strategies[index],
          ...action.payload,
          updateTime: Date.now(),
        };
      }
    },
    deleteStrategy: (state, action: PayloadAction<string>) => {
      state.strategies = state.strategies.filter(strategy => strategy.id !== action.payload);
      if (state.selectedStrategy === action.payload) {
        state.selectedStrategy = null;
      }
    },
    setSelectedStrategy: (state, action: PayloadAction<string | null>) => {
      state.selectedStrategy = action.payload;
    },
    addBacktestResult: (state, action: PayloadAction<BacktestResult>) => {
      state.backtestResults[action.payload.strategyId] = action.payload;
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
  addStrategy,
  updateStrategy,
  deleteStrategy,
  setSelectedStrategy,
  addBacktestResult,
  setLoading,
  setError,
} = strategySlice.actions;

export default strategySlice.reducer; 
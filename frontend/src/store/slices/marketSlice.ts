import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MarketState {
  realTimeData: {
    [symbol: string]: {
      price: number;
      change: number;
      changePercent: number;
      volume: number;
      turnover: number;
      timestamp: number;
    };
  };
  klineData: {
    [symbol: string]: Array<{
      time: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  };
  selectedSymbol: string;
  loading: boolean;
  error: string | null;
}

const initialState: MarketState = {
  realTimeData: {},
  klineData: {},
  selectedSymbol: '',
  loading: false,
  error: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    updateRealTimeData: (state, action: PayloadAction<{ symbol: string; data: any }>) => {
      const { symbol, data } = action.payload;
      state.realTimeData[symbol] = {
        ...data,
        timestamp: Date.now(),
      };
    },
    updateKlineData: (state, action: PayloadAction<{ symbol: string; data: any[] }>) => {
      const { symbol, data } = action.payload;
      state.klineData[symbol] = data;
    },
    setSelectedSymbol: (state, action: PayloadAction<string>) => {
      state.selectedSymbol = action.payload;
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
  updateRealTimeData,
  updateKlineData,
  setSelectedSymbol,
  setLoading,
  setError,
} = marketSlice.actions;

export default marketSlice.reducer; 
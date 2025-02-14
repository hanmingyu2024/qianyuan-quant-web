import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MarketState {
  currentSymbol: string;
  klineData: any[];
  depth: {
    asks: [number, number][];
    bids: [number, number][];
  };
}

const initialState: MarketState = {
  currentSymbol: 'BTC/USDT',
  klineData: [],
  depth: {
    asks: [],
    bids: []
  }
};

export const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setCurrentSymbol: (state, action: PayloadAction<string>) => {
      state.currentSymbol = action.payload;
    },
    updateKlineData: (state, action: PayloadAction<any[]>) => {
      state.klineData = action.payload;
    },
    updateDepth: (state, action: PayloadAction<any>) => {
      state.depth = action.payload;
    }
  }
}); 
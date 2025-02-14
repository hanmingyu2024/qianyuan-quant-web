import { configureStore } from '@reduxjs/toolkit';
import marketReducer from './slices/marketSlice';
import tradingReducer from './slices/tradingSlice';
import userReducer from './slices/userSlice';
import strategyReducer from './slices/strategySlice';

export const store = configureStore({
  reducer: {
    market: marketReducer,
    trading: tradingReducer,
    user: userReducer,
    strategy: strategyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

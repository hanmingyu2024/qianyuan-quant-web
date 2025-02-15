import { configureStore } from '@reduxjs/toolkit';
import marketReducer from './slices/marketSlice';
import tradingReducer from './slices/tradingSlice';
import { wsService } from '@/services/websocket';
import { useDispatch, useSelector } from 'react-redux';
import { TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    market: marketReducer,
    trading: tradingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 WebSocket 实例的序列化检查
        ignoredActions: ['websocket/connect'],
        ignoredPaths: ['websocket.instance'],
      },
    }),
});

// 连接 WebSocket
wsService.connect();

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

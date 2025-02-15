// 交易对配置
export const TRADING_PAIRS = [
  { symbol: 'BTC/USDT', baseAsset: 'BTC', quoteAsset: 'USDT', pricePrecision: 2, amountPrecision: 6 },
  { symbol: 'ETH/USDT', baseAsset: 'ETH', quoteAsset: 'USDT', pricePrecision: 2, amountPrecision: 4 },
  { symbol: 'BNB/USDT', baseAsset: 'BNB', quoteAsset: 'USDT', pricePrecision: 2, amountPrecision: 2 },
];

// K线周期配置
export const KLINE_PERIODS = [
  { label: '1分钟', value: '1m' },
  { label: '5分钟', value: '5m' },
  { label: '15分钟', value: '15m' },
  { label: '1小时', value: '1h' },
  { label: '4小时', value: '4h' },
  { label: '日线', value: '1d' },
];

// WebSocket 配置
export const WS_CONFIG = {
  url: 'ws://localhost:8001/ws',
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
}; 
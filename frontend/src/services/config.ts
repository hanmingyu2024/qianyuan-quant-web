export const API_BASE_URL = 'http://localhost:8000/api';
export const WS_BASE_URL = 'ws://localhost:8000/ws';

export const API_ENDPOINTS = {
  // 行情数据
  MARKET: {
    QUOTES: '/market/quotes',
    KLINES: '/market/klines',
  },
  // 交易相关
  TRADING: {
    PLACE_ORDER: '/trading/orders',
    CANCEL_ORDER: '/trading/orders/:orderId',
    POSITIONS: '/trading/positions',
    ORDERS: '/trading/orders',
  },
  // 策略相关
  STRATEGY: {
    LIST: '/strategy/list',
    CREATE: '/strategy/create',
    UPDATE: '/strategy/:strategyId',
    DELETE: '/strategy/:strategyId',
    START: '/strategy/:strategyId/start',
    STOP: '/strategy/:strategyId/stop',
  },
  // 账户相关
  ACCOUNT: {
    INFO: '/account/info',
    ASSETS: '/account/assets',
    PERFORMANCE: '/account/performance',
  },
}; 
export const PERFORMANCE_CONFIG = {
  // 防抖时间
  DEBOUNCE_DELAY: {
    POINT_UPDATE: 16,
    PATH_CHANGE: 32,
    SAVE: 1000,
    RESIZE: 150,
    SEARCH: 300,
  },
  
  // 节流时间
  THROTTLE_DELAY: {
    MOUSE_MOVE: 16,
    PREVIEW_UPDATE: 32,
    GUIDE_UPDATE: 32,
    STATS_UPDATE: 1000,
    SAVE: 1000,
  },
  
  // 缓存配置
  CACHE: {
    MAX_SIZE: 100,
    TTL: 5 * 60 * 1000, // 5 minutes
  },
  
  // 批量处理
  BATCH_SIZE: 10,
  
  // 虚拟化配置
  VIRTUALIZATION: {
    OVERSCAN: 5,
    ITEM_SIZE: 40,
  },
} 
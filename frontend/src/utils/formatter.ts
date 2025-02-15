import dayjs from 'dayjs';

// 格式化数字
export const formatNumber = (value: number, precision: number = 2): string => {
  return value.toFixed(precision);
};

// 格式化价格
export const formatPrice = (price: number, precision: number = 2) => {
  return `$${formatNumber(price, precision)}`;
};

// 格式化百分比
export const formatPercent = (value: number, precision: number = 2): string => {
  return `${(value * 100).toFixed(precision)}%`;
};

// 格式化时间
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

// 格式化交易量
export const formatVolume = (volume: number) => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toFixed(2);
};

export const formatSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}; 
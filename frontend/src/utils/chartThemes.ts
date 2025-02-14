export const lightTheme = {
  backgroundColor: '#ffffff',
  textColor: '#333333',
  splitLine: {
    lineStyle: {
      color: '#eeeeee',
    },
  },
  axisLine: {
    lineStyle: {
      color: '#cccccc',
    },
  },
  axisTick: {
    lineStyle: {
      color: '#cccccc',
    },
  },
  axisLabel: {
    color: '#666666',
  },
}

export const darkTheme = {
  backgroundColor: '#1f1f1f',
  textColor: '#eeeeee',
  splitLine: {
    lineStyle: {
      color: '#333333',
    },
  },
  axisLine: {
    lineStyle: {
      color: '#555555',
    },
  },
  axisTick: {
    lineStyle: {
      color: '#555555',
    },
  },
  axisLabel: {
    color: '#999999',
  },
}

export const applyTheme = (option: any, theme: 'light' | 'dark') => {
  const themeConfig = theme === 'light' ? lightTheme : darkTheme
  
  return {
    ...option,
    backgroundColor: themeConfig.backgroundColor,
    textStyle: {
      color: themeConfig.textColor,
    },
    xAxis: {
      ...option.xAxis,
      splitLine: themeConfig.splitLine,
      axisLine: themeConfig.axisLine,
      axisTick: themeConfig.axisTick,
      axisLabel: themeConfig.axisLabel,
    },
    yAxis: {
      ...option.yAxis,
      splitLine: themeConfig.splitLine,
      axisLine: themeConfig.axisLine,
      axisTick: themeConfig.axisTick,
      axisLabel: themeConfig.axisLabel,
    },
  }
} 
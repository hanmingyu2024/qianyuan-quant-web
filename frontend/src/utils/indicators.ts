export const calculateMA = (data: any[], period: number) => {
  const result = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push(+(sum / period).toFixed(8))
  }
  return result
}

export const calculateRSI = (data: any[], period: number) => {
  const result = []
  let gains = 0
  let losses = 0

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      if (i > 0) {
        const change = data[i].close - data[i - 1].close
        if (change >= 0) gains += change
        else losses -= change
      }
      if (i < period - 1) {
        result.push(null)
        continue
      }
    } else {
      const change = data[i].close - data[i - 1].close
      if (change >= 0) {
        gains = (gains * (period - 1) + change) / period
        losses = (losses * (period - 1)) / period
      } else {
        gains = (gains * (period - 1)) / period
        losses = (losses * (period - 1) - change) / period
      }
    }

    const rs = gains / losses
    result.push(100 - 100 / (1 + rs))
  }
  return result
}

export const calculateMACD = (data: any[], { short, long, signal }: { short: number; long: number; signal: number }) => {
  const shortEMA = calculateEMA(data.map(d => d.close), short)
  const longEMA = calculateEMA(data.map(d => d.close), long)
  const dif = shortEMA.map((value, i) => value - longEMA[i])
  const dea = calculateEMA(dif, signal)
  const macd = dif.map((value, i) => 2 * (value - dea[i]))

  return { dif, dea, macd }
}

const calculateEMA = (data: number[], period: number) => {
  const k = 2 / (period + 1)
  const result = []
  let ema = data[0]

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }
    ema = data[i] * k + ema * (1 - k)
    result.push(ema)
  }
  return result
}

export const calculateBollinger = (data: any[], period: number = 20, multiplier: number = 2) => {
  const ma = calculateMA(data, period)
  const upperBand = []
  const lowerBand = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upperBand.push(null)
      lowerBand.push(null)
      continue
    }

    let sum = 0
    for (let j = 0; j < period; j++) {
      const diff = data[i - j].close - ma[i]
      sum += diff * diff
    }
    const stdDev = Math.sqrt(sum / period)
    upperBand.push(ma[i] + multiplier * stdDev)
    lowerBand.push(ma[i] - multiplier * stdDev)
  }

  return { ma, upperBand, lowerBand }
}

export const calculateKDJ = (data: any[], period: number = 9) => {
  const rsv = []
  const k = []
  const d = []
  const j = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      rsv.push(null)
      k.push(50)
      d.push(50)
      j.push(50)
      continue
    }

    let high = -Infinity
    let low = Infinity
    for (let j = 0; j < period; j++) {
      const item = data[i - j]
      high = Math.max(high, item.high)
      low = Math.min(low, item.low)
    }

    const close = data[i].close
    const rsvValue = ((close - low) / (high - low)) * 100
    rsv.push(rsvValue)

    k[i] = (2 / 3) * (k[i - 1] || 50) + (1 / 3) * rsvValue
    d[i] = (2 / 3) * (d[i - 1] || 50) + (1 / 3) * k[i]
    j[i] = 3 * k[i] - 2 * d[i]
  }

  return { k, d, j }
} 
export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  parameters: {
    temperature: number;
    topP: number;
    maxTokens: number;
    presencePenalty: number;
    frequencyPenalty: number;
  };
}

export interface MarketAnalysis {
  trend: {
    direction: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    description: string;
  };
  levels: {
    support: number[];
    resistance: number[];
  };
  signals: Array<{
    indicator: string;
    signal: 'buy' | 'sell' | 'hold';
    strength: number;
    description: string;
  }>;
  volatility: {
    value: number;
    trend: string;
    risk: 'low' | 'medium' | 'high';
  };
  volume: {
    value: number;
    change: number;
    trend: string;
  };
  sentiment: {
    value: number;
    trend: string;
    factors: string[];
  };
  chartData: {
    price: Array<[number, number]>;
    volume: Array<[number, number]>;
    ma5: Array<[number, number]>;
    ma10: Array<[number, number]>;
    ma20: Array<[number, number]>;
  };
} 
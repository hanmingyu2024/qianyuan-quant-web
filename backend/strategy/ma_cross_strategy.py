from .base_strategy import BaseStrategy
import pandas as pd
import numpy as np

class MACrossStrategy(BaseStrategy):
    def __init__(self, symbol: str, timeframe: str, fast_period: int = 10, slow_period: int = 20):
        super().__init__(symbol, timeframe)
        self.fast_period = fast_period
        self.slow_period = slow_period

    def generate_signals(self, data: pd.DataFrame) -> List[Dict]:
        df = data.copy()
        
        # 计算快速和慢速移动平均线
        df['fast_ma'] = df['close'].rolling(window=self.fast_period).mean()
        df['slow_ma'] = df['close'].rolling(window=self.slow_period).mean()
        
        # 生成交叉信号
        df['cross_over'] = (df['fast_ma'] > df['slow_ma']) & (df['fast_ma'].shift(1) <= df['slow_ma'].shift(1))
        df['cross_under'] = (df['fast_ma'] < df['slow_ma']) & (df['fast_ma'].shift(1) >= df['slow_ma'].shift(1))
        
        signals = []
        for index, row in df.iterrows():
            if row['cross_over']:
                signals.append({
                    'timestamp': index,
                    'type': 'BUY',
                    'price': row['close'],
                    'reason': 'MA Cross Over'
                })
            elif row['cross_under']:
                signals.append({
                    'timestamp': index,
                    'type': 'SELL',
                    'price': row['close'],
                    'reason': 'MA Cross Under'
                })
                
        return signals

    def calculate_position_size(self, signal: Dict) -> float:
        # 简单的固定仓位大小策略
        return 1.0 if signal['type'] == 'BUY' else -1.0 
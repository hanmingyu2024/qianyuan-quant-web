import pandas as pd
import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta
import talib
from sqlalchemy import create_engine
from config import Config

class DataProcessor:
    def __init__(self):
        self.engine = create_engine(Config.DATABASE_URL)
        
    def fetch_market_data(self, symbol: str, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """获取市场数据"""
        query = f"""
        SELECT timestamp, open, high, low, close, volume 
        FROM market_data 
        WHERE symbol = '{symbol}' 
        AND timestamp BETWEEN '{start_date}' AND '{end_date}'
        ORDER BY timestamp
        """
        return pd.read_sql(query, self.engine)

    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """计算技术指标"""
        # 移动平均线
        df['MA5'] = talib.MA(df['close'], timeperiod=5)
        df['MA10'] = talib.MA(df['close'], timeperiod=10)
        df['MA20'] = talib.MA(df['close'], timeperiod=20)
        
        # RSI
        df['RSI'] = talib.RSI(df['close'], timeperiod=14)
        
        # MACD
        df['MACD'], df['MACD_signal'], df['MACD_hist'] = talib.MACD(
            df['close'], 
            fastperiod=12, 
            slowperiod=26, 
            signalperiod=9
        )
        
        # 布林带
        df['BB_upper'], df['BB_middle'], df['BB_lower'] = talib.BBANDS(
            df['close'],
            timeperiod=20,
            nbdevup=2,
            nbdevdn=2
        )
        
        return df

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """数据清洗"""
        # 删除重复数据
        df = df.drop_duplicates()
        
        # 处理缺失值
        df = df.fillna(method='ffill')
        
        # 删除异常值
        df = df[df['close'] > 0]
        
        return df

    def resample_data(self, df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
        """重采样数据"""
        resampled = df.resample(timeframe).agg({
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum'
        })
        return resampled.dropna()

    def prepare_training_data(self, df: pd.DataFrame, lookback: int = 20) -> tuple:
        """准备模型训练数据"""
        df = self.calculate_technical_indicators(df)
        
        features = ['MA5', 'MA10', 'MA20', 'RSI', 'MACD', 'BB_upper', 'BB_lower']
        X = df[features].values
        y = (df['close'].shift(-1) > df['close']).values[:-1]  # 预测下一个时间点的涨跌
        
        # 创建时间序列特征
        X_sequences = []
        y_sequences = []
        
        for i in range(len(X) - lookback - 1):
            X_sequences.append(X[i:(i + lookback)])
            y_sequences.append(y[i + lookback])
            
        return np.array(X_sequences), np.array(y_sequences) 
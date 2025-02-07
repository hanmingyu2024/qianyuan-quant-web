from abc import ABC, abstractmethod
from typing import Dict, List
import pandas as pd
import numpy as np

class BaseStrategy(ABC):
    def __init__(self, symbol: str, timeframe: str):
        self.symbol = symbol
        self.timeframe = timeframe
        self.position = 0
        self.signals = []

    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> List[Dict]:
        """生成交易信号"""
        pass

    @abstractmethod
    def calculate_position_size(self, signal: Dict) -> float:
        """计算仓位大小"""
        pass

    def run(self, data: pd.DataFrame):
        """运行策略"""
        self.signals = self.generate_signals(data)
        return self.signals 
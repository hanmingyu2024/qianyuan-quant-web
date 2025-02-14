from abc import ABC, abstractmethod
from typing import Dict, List
from datetime import datetime

class BaseStrategy(ABC):
    def __init__(self, parameters: Dict):
        self.parameters = parameters
        self.positions = {}
        self.trades = []
        
    @abstractmethod
    async def on_tick(self, tick_data: Dict):
        """处理每个价格tick"""
        pass
        
    @abstractmethod
    async def on_bar(self, bar_data: Dict):
        """处理K线数据"""
        pass
        
    @abstractmethod
    def calculate_signals(self) -> Dict:
        """计算交易信号"""
        pass 
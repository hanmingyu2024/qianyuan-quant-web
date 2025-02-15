from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Kline(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    amount: Optional[float] = None

class MarketData(BaseModel):
    symbol: str
    exchange: str
    timeframe: str
    start_time: datetime
    end_time: datetime
    data_type: str  # 'kline', 'tick', etc.
    klines: List[Kline]

class DataSubscription(BaseModel):
    id: str
    symbol: str
    exchange: str
    timeframe: str
    callback_url: str
    status: str  # 'active', 'paused', 'stopped'
    created_at: datetime 
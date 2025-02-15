from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class BacktestConfig(BaseModel):
    strategy_id: str
    start_time: datetime
    end_time: datetime
    symbol: str
    timeframe: str
    initial_capital: float
    leverage: float = 1.0
    commission: float = 0.001
    slippage: float = 0.0

class Trade(BaseModel):
    timestamp: datetime
    symbol: str
    direction: str  # 'long' or 'short'
    price: float
    quantity: float
    commission: float
    pnl: float

class BacktestResult(BaseModel):
    id: str
    strategy_id: str
    config: BacktestConfig
    status: str  # 'running', 'completed', 'failed'
    start_time: datetime
    end_time: Optional[datetime]
    metrics: Optional[Dict] = None
    trades: Optional[List[Trade]] = None
    equity_curve: Optional[List[Dict[str, float]]] = None
    error_message: Optional[str] = None

    class Config:
        orm_mode = True 
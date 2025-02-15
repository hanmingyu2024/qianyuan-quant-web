from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"

class RiskRule(BaseModel):
    id: str
    name: str
    description: str
    type: str  # 'position', 'drawdown', 'exposure', etc.
    threshold: float
    action: str  # 'alert', 'close_position', 'stop_strategy'
    enabled: bool = True
    created_at: datetime
    updated_at: datetime

class RiskAlert(BaseModel):
    id: str
    rule_id: str
    strategy_id: Optional[str]
    level: RiskLevel
    message: str
    created_at: datetime
    acknowledged: bool = False
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None

class PositionRisk(BaseModel):
    symbol: str
    position_size: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
    risk_level: RiskLevel
    margin_ratio: float = Field(..., ge=0, le=1)
    liquidation_price: Optional[float] = None
    max_drawdown: float 
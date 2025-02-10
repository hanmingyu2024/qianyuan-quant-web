from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Order(BaseModel):
    symbol: str
    direction: str  # BUY or SELL
    price: float
    volume: int
    order_type: str = "LIMIT"  # LIMIT or MARKET
    time_in_force: str = "GTC"  # GTC, IOC, FOK
    status: str = "PENDING"
    create_time: datetime = datetime.now()
    update_time: Optional[datetime] = None 
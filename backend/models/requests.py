from pydantic import BaseModel
from typing import List

class SubscribeRequest(BaseModel):
    """市场数据订阅请求"""
    symbols: List[str]
    market_type: str 
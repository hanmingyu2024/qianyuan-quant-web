from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import numpy as np

app = FastAPI()

class Position(BaseModel):
    symbol: str
    size: float
    entry_price: float
    current_price: float

class RiskManager:
    def __init__(self):
        self.max_position_size = 100000  # 最大仓位
        self.max_drawdown = 0.1  # 最大回撤
        self.position_limit = 0.2  # 单个持仓限制
        
    def check_position_limit(self, positions: List[Position]) -> bool:
        """检查持仓限制"""
        total_exposure = sum(abs(p.size * p.current_price) for p in positions)
        return total_exposure <= self.max_position_size
    
    def calculate_var(self, positions: List[Position], confidence: float = 0.95) -> float:
        """计算风险价值(VaR)"""
        position_values = [p.size * p.current_price for p in positions]
        return np.percentile(position_values, (1 - confidence) * 100)
    
    def check_drawdown(self, equity_curve: List[float]) -> bool:
        """检查回撤"""
        if not equity_curve:
            return True
        peak = max(equity_curve)
        current = equity_curve[-1]
        drawdown = (peak - current) / peak
        return drawdown <= self.max_drawdown

risk_manager = RiskManager()

@app.post("/check_risk")
async def check_risk(positions: List[Position]):
    if not risk_manager.check_position_limit(positions):
        raise HTTPException(status_code=400, detail="Position limit exceeded")
    
    var = risk_manager.calculate_var(positions)
    return {"status": "ok", "var": var} 
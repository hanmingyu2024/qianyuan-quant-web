from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class StrategyBase(BaseModel):
    name: str
    description: str
    code: str
    language: str = "python"
    tags: List[str] = []

class StrategyCreate(StrategyBase):
    pass

class Strategy(StrategyBase):
    id: str
    author_id: str
    created_at: datetime
    updated_at: datetime
    version: int
    
    class Config:
        orm_mode = True

@router.get("/strategies/", response_model=List[Strategy])
async def get_strategies(
    skip: int = 0,
    limit: int = 10,
    tag: Optional[str] = None,
):
    """获取策略列表"""
    return await strategy_service.get_strategies(skip, limit, tag)

@router.post("/strategies/", response_model=Strategy)
async def create_strategy(strategy: StrategyCreate):
    """创建新策略"""
    return await strategy_service.create_strategy(strategy)

@router.get("/strategies/{strategy_id}", response_model=Strategy)
async def get_strategy(strategy_id: str):
    """获取策略详情"""
    strategy = await strategy_service.get_strategy(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy

@router.put("/strategies/{strategy_id}", response_model=Strategy)
async def update_strategy(strategy_id: str, strategy: StrategyBase):
    """更新策略"""
    updated = await strategy_service.update_strategy(strategy_id, strategy)
    if not updated:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return updated

@router.delete("/strategies/{strategy_id}")
async def delete_strategy(strategy_id: str):
    """删除策略"""
    deleted = await strategy_service.delete_strategy(strategy_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return {"status": "success"}

@router.post("/strategies/{strategy_id}/run")
async def run_strategy(strategy_id: str):
    """运行策略"""
    try:
        await strategy_service.run_strategy(strategy_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/strategies/{strategy_id}/stop")
async def stop_strategy(strategy_id: str):
    """停止策略"""
    try:
        await strategy_service.stop_strategy(strategy_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
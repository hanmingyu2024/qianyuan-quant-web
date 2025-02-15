from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List, Optional
from app.models.backtest import BacktestConfig, BacktestResult
from app.services.backtest_service import backtest_service
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.post("/backtest/", response_model=BacktestResult)
async def create_backtest(
    config: BacktestConfig,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user)
):
    """创建新的回测任务"""
    try:
        result = await backtest_service.create_backtest(config)
        # 在后台运行回测
        background_tasks.add_task(backtest_service.run_backtest, result.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/backtest/{backtest_id}", response_model=BacktestResult)
async def get_backtest(backtest_id: str):
    """获取回测结果"""
    result = await backtest_service.get_backtest(backtest_id)
    if not result:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return result

@router.get("/backtest/strategy/{strategy_id}", response_model=List[BacktestResult])
async def get_strategy_backtests(
    strategy_id: str,
    skip: int = 0,
    limit: int = 10
):
    """获取策略的所有回测记录"""
    return await backtest_service.get_strategy_backtests(strategy_id, skip, limit)

@router.delete("/backtest/{backtest_id}")
async def delete_backtest(backtest_id: str):
    """删除回测记录"""
    deleted = await backtest_service.delete_backtest(backtest_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return {"status": "success"} 
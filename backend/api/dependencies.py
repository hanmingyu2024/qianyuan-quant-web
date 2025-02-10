from fastapi import Depends
from backend.services.market_data_service import MarketDataService
from backend.services.strategy_service import StrategyService
from backend.core.config import get_settings

def get_market_service() -> MarketDataService:
    """获取市场数据服务实例"""
    config = get_settings()
    return MarketDataService(config)

def get_strategy_service(
    market_service: MarketDataService = Depends(get_market_service)
) -> StrategyService:
    """获取策略服务实例"""
    config = get_settings()
    return StrategyService(config, market_service) 
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.models.market_data import MarketData, DataSubscription
from app.services.data_service import data_service

router = APIRouter()

@router.get("/data/history", response_model=MarketData)
async def get_historical_data(
    symbol: str,
    exchange: str = "binance",
    timeframe: str = "1m",
    start_time: datetime = Query(...),
    end_time: datetime = Query(...),
):
    """获取历史K线数据"""
    try:
        data = await data_service.get_historical_data(
            symbol=symbol,
            exchange=exchange,
            timeframe=timeframe,
            start_time=start_time,
            end_time=end_time
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/data/subscribe", response_model=DataSubscription)
async def subscribe_data(
    symbol: str,
    exchange: str = "binance",
    timeframe: str = "1m",
    callback_url: str = None,
):
    """订阅实时数据"""
    try:
        subscription = await data_service.subscribe_data(
            symbol=symbol,
            exchange=exchange,
            timeframe=timeframe,
            callback_url=callback_url
        )
        return subscription
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/data/unsubscribe/{subscription_id}")
async def unsubscribe_data(subscription_id: str):
    """取消数据订阅"""
    try:
        await data_service.unsubscribe_data(subscription_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/data/exchanges")
async def get_supported_exchanges():
    """获取支持的交易所列表"""
    return await data_service.get_supported_exchanges()

@router.get("/data/symbols/{exchange}")
async def get_supported_symbols(exchange: str):
    """获取交易所支持的交易对列表"""
    return await data_service.get_supported_symbols(exchange) 
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import ccxt
import ccxt.async_support as ccxt_async
import pandas as pd
import numpy as np
import aiohttp
from app.db.mongodb import db
from app.models.market_data import MarketData, Kline, DataSubscription
from app.core.config import settings
import asyncio
from bson import ObjectId

class DataService:
    def __init__(self):
        self.exchanges: Dict[str, ccxt_async.Exchange] = {}
        self.subscriptions = {}
        self.collection = db.db.market_data

    async def init_exchanges(self):
        """初始化交易所连接"""
        for exchange_id in settings.SUPPORTED_EXCHANGES:
            exchange_class = getattr(ccxt_async, exchange_id)
            self.exchanges[exchange_id] = exchange_class({
                'enableRateLimit': True,
                'timeout': 30000,
                'asyncio_loop': asyncio.get_event_loop(),
            })

    async def get_historical_data(
        self,
        symbol: str,
        exchange: str = "binance",
        timeframe: str = "1m",
        start_time: datetime = None,
        end_time: datetime = None
    ) -> MarketData:
        """获取历史K线数据"""
        try:
            # 首先检查数据库中是否有缓存
            cached_data = await self._get_cached_data(
                symbol, exchange, timeframe, start_time, end_time
            )
            if cached_data:
                return cached_data

            # 如果没有缓存，从交易所获取数据
            if exchange not in self.exchanges:
                await self.init_exchanges()

            exchange_instance = self.exchanges[exchange]
            
            # 获取K线数据
            since = int(start_time.timestamp() * 1000) if start_time else None
            klines = await exchange_instance.fetch_ohlcv(
                symbol,
                timeframe=timeframe,
                since=since,
                limit=1000  # 每次请求的数量
            )

            # 转换数据格式
            df = pd.DataFrame(
                klines,
                columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
            )
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')

            # 创建MarketData对象
            market_data = MarketData(
                symbol=symbol,
                exchange=exchange,
                timeframe=timeframe,
                start_time=df['timestamp'].min(),
                end_time=df['timestamp'].max(),
                data_type='kline',
                klines=[
                    Kline(
                        timestamp=row['timestamp'],
                        open=row['open'],
                        high=row['high'],
                        low=row['low'],
                        close=row['close'],
                        volume=row['volume']
                    )
                    for _, row in df.iterrows()
                ]
            )

            # 缓存数据
            await self._cache_data(market_data)

            return market_data

        except Exception as e:
            raise ValueError(f"Failed to fetch historical data: {str(e)}")

    async def subscribe_data(
        self,
        symbol: str,
        exchange: str = "binance",
        timeframe: str = "1m",
        callback_url: str = None
    ) -> DataSubscription:
        """订阅实时数据"""
        subscription = DataSubscription(
            id=str(ObjectId()),
            symbol=symbol,
            exchange=exchange,
            timeframe=timeframe,
            callback_url=callback_url,
            status="active",
            created_at=datetime.utcnow()
        )

        # 存储订阅信息
        await self.collection.insert_one(subscription.dict())

        # 启动websocket连接
        asyncio.create_task(self._start_websocket(subscription))

        return subscription

    async def _start_websocket(self, subscription: DataSubscription):
        """启动websocket连接并处理实时数据"""
        try:
            if subscription.exchange not in self.exchanges:
                await self.init_exchanges()

            exchange = self.exchanges[subscription.exchange]
            
            while True:
                try:
                    # 建立websocket连接
                    await exchange.watch_ohlcv(
                        subscription.symbol,
                        timeframe=subscription.timeframe
                    )

                    # 处理接收到的数据
                    while True:
                        ohlcv = await exchange.watch_ohlcv(
                            subscription.symbol,
                            timeframe=subscription.timeframe
                        )
                        
                        # 如果有回调URL，发送数据
                        if subscription.callback_url:
                            await self._send_callback(subscription.callback_url, ohlcv)

                except Exception as e:
                    print(f"Websocket error: {str(e)}")
                    await asyncio.sleep(5)  # 重连延迟

        except Exception as e:
            print(f"Failed to start websocket: {str(e)}")

    async def _get_cached_data(
        self,
        symbol: str,
        exchange: str,
        timeframe: str,
        start_time: datetime,
        end_time: datetime
    ) -> Optional[MarketData]:
        """从缓存中获取数据"""
        try:
            # 查询缓存的数据
            cached = await self.collection.find_one({
                "symbol": symbol,
                "exchange": exchange,
                "timeframe": timeframe,
                "start_time": {"$lte": start_time},
                "end_time": {"$gte": end_time},
                "data_type": "kline"
            })

            if cached:
                # 检查数据是否需要更新
                if (datetime.utcnow() - cached["updated_at"]).total_seconds() > settings.CACHE_UPDATE_INTERVAL:
                    # 如果数据过期，在后台更新缓存
                    asyncio.create_task(self._update_cache(cached["_id"]))
                
                return MarketData(**cached)
            
            return None

        except Exception as e:
            print(f"Error getting cached data: {str(e)}")
            return None

    async def _cache_data(self, market_data: MarketData):
        """缓存市场数据"""
        try:
            # 转换为字典并添加更新时间
            data_dict = market_data.dict()
            data_dict["updated_at"] = datetime.utcnow()

            # 使用 upsert 操作更新或插入数据
            await self.collection.update_one(
                {
                    "symbol": market_data.symbol,
                    "exchange": market_data.exchange,
                    "timeframe": market_data.timeframe,
                    "data_type": market_data.data_type,
                    "start_time": market_data.start_time,
                    "end_time": market_data.end_time,
                },
                {"$set": data_dict},
                upsert=True
            )

        except Exception as e:
            print(f"Error caching data: {str(e)}")

    async def _update_cache(self, cache_id: str):
        """更新缓存的数据"""
        try:
            cached = await self.collection.find_one({"_id": cache_id})
            if not cached:
                return

            # 获取新数据
            new_data = await self.get_historical_data(
                symbol=cached["symbol"],
                exchange=cached["exchange"],
                timeframe=cached["timeframe"],
                start_time=cached["start_time"],
                end_time=cached["end_time"]
            )

            # 更新缓存
            await self._cache_data(new_data)

        except Exception as e:
            print(f"Error updating cache: {str(e)}")

    async def clean_old_cache(self):
        """清理过期的缓存数据"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=settings.DATA_CACHE_DAYS)
            result = await self.collection.delete_many({
                "updated_at": {"$lt": cutoff_date}
            })
            print(f"Cleaned {result.deleted_count} old cache entries")
        except Exception as e:
            print(f"Error cleaning cache: {str(e)}")

    async def _send_callback(self, callback_url: str, data: dict):
        """发送回调数据"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(callback_url, json=data) as response:
                    if response.status >= 400:
                        print(f"Callback failed: {await response.text()}")
        except Exception as e:
            print(f"Error sending callback: {str(e)}")

    async def unsubscribe_data(self, subscription_id: str):
        """取消数据订阅"""
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(subscription_id)},
                {"$set": {"status": "stopped"}}
            )
            if result.modified_count == 0:
                raise ValueError("Subscription not found")

            # 停止websocket连接
            if subscription_id in self.subscriptions:
                self.subscriptions[subscription_id].cancel()
                del self.subscriptions[subscription_id]

        except Exception as e:
            raise ValueError(f"Failed to unsubscribe: {str(e)}")

    async def get_supported_exchanges(self) -> List[str]:
        """获取支持的交易所列表"""
        return settings.SUPPORTED_EXCHANGES

    async def get_supported_symbols(self, exchange: str) -> List[str]:
        """获取交易所支持的交易对列表"""
        if exchange not in self.exchanges:
            await self.init_exchanges()
        
        exchange_instance = self.exchanges[exchange]
        markets = await exchange_instance.load_markets()
        return list(markets.keys())

data_service = DataService()
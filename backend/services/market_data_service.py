import asyncio
import websockets
import json
import redis
import pandas as pd
import numpy as np
from typing import Dict, List, Set, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import logging
from models.database import MarketData
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from config.config_manager import ConfigManager

class MarketDataService:
    def __init__(self, config: ConfigManager):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # 数据库连接
        self.engine = create_engine(config.get('database.url'))
        self.db_session = Session(self.engine)
        
        # Redis连接
        self.redis_client = redis.Redis(
            host=config.get('redis.host'),
            port=config.get('redis.port'),
            db=config.get('redis.db')
        )
        
        # 内存缓存
        self.price_cache: Dict[str, float] = {}
        self.kline_cache: Dict[str, List[Dict]] = defaultdict(list)
        self.orderbook_cache: Dict[str, Dict] = {}
        
        # WebSocket连接管理
        self.ws_connections: Dict[str, Set[websockets.WebSocketServerProtocol]] = defaultdict(set)
        self.running = False
        
        # 行情更新回调函数
        self.price_callbacks: List[callable] = []
        self.kline_callbacks: List[callable] = []
        self.orderbook_callbacks: List[callable] = []

    async def start(self):
        """启动市场数据服务"""
        try:
            self.running = True
            
            # 启动WebSocket服务器
            ws_server = await websockets.serve(
                self.handle_ws_connection,
                self.config.get('websocket.host'),
                self.config.get('websocket.port')
            )
            
            # 启动数据处理循环
            await asyncio.gather(
                self.process_market_data(),
                self.clean_old_data(),
                ws_server.wait_closed()
            )
            
        except Exception as e:
            self.logger.error(f"Error starting market data service: {str(e)}")
            raise

    async def stop(self):
        """停止服务"""
        self.running = False
        
        # 关闭所有WebSocket连接
        for connections in self.ws_connections.values():
            for ws in connections:
                await ws.close()
        
        # 清理资源
        self.redis_client.close()
        self.db_session.close()

    async def handle_ws_connection(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """处理WebSocket连接"""
        try:
            # 等待订阅消息
            subscription = await websocket.recv()
            subscription_data = json.loads(subscription)
            symbol = subscription_data.get('symbol')
            
            if not symbol:
                await websocket.close(1008, "Symbol not specified")
                return
                
            # 注册连接
            self.ws_connections[symbol].add(websocket)
            
            # 发送当前缓存数据
            if symbol in self.price_cache:
                await websocket.send(json.dumps({
                    'type': 'price',
                    'symbol': symbol,
                    'price': self.price_cache[symbol]
                }))
            
            try:
                async for message in websocket:
                    # 处理客户端消息（如心跳检测）
                    data = json.loads(message)
                    if data.get('type') == 'ping':
                        await websocket.send(json.dumps({'type': 'pong'}))
            except websockets.ConnectionClosed:
                pass
            finally:
                self.ws_connections[symbol].remove(websocket)
                
        except Exception as e:
            self.logger.error(f"Error handling WebSocket connection: {str(e)}")
            await websocket.close(1011, "Internal server error")

    async def process_market_data(self):
        """处理市场数据"""
        while self.running:
            try:
                # 从Redis获取最新数据
                latest_data = self.redis_client.xread(
                    {self.config.get('redis.market_data_stream'): '0-0'},
                    count=100,
                    block=1000
                )
                
                for stream, messages in latest_data:
                    for message_id, data in messages:
                        await self._process_market_data_message(data)
                        
            except Exception as e:
                self.logger.error(f"Error processing market data: {str(e)}")
                await asyncio.sleep(1)

    async def _process_market_data_message(self, data: Dict):
        """处理单条市场数据"""
        try:
            message_type = data.get('type')
            symbol = data.get('symbol')
            
            if message_type == 'price':
                price = float(data.get('price'))
                self.price_cache[symbol] = price
                
                # 触发回调
                for callback in self.price_callbacks:
                    await callback(symbol, price)
                    
                # 广播给订阅者
                await self._broadcast_to_subscribers(symbol, data)
                
            elif message_type == 'kline':
                kline_data = {
                    'timestamp': data.get('timestamp'),
                    'open': float(data.get('open')),
                    'high': float(data.get('high')),
                    'low': float(data.get('low')),
                    'close': float(data.get('close')),
                    'volume': float(data.get('volume'))
                }
                
                self.kline_cache[symbol].append(kline_data)
                
                # 保持缓存大小
                max_cache_size = self.config.get('market_data.max_kline_cache_size', 1000)
                if len(self.kline_cache[symbol]) > max_cache_size:
                    self.kline_cache[symbol].pop(0)
                
                # 触发回调
                for callback in self.kline_callbacks:
                    await callback(symbol, kline_data)
                    
                # 保存到数据库
                self._save_kline_to_db(symbol, kline_data)
                
            elif message_type == 'orderbook':
                self.orderbook_cache[symbol] = {
                    'bids': data.get('bids', []),
                    'asks': data.get('asks', []),
                    'timestamp': data.get('timestamp')
                }
                
                # 触发回调
                for callback in self.orderbook_callbacks:
                    await callback(symbol, self.orderbook_cache[symbol])
                    
        except Exception as e:
            self.logger.error(f"Error processing market data message: {str(e)}")

    async def _broadcast_to_subscribers(self, symbol: str, data: Dict):
        """广播数据给订阅者"""
        if symbol not in self.ws_connections:
            return
            
        message = json.dumps(data)
        disconnected = set()
        
        for websocket in self.ws_connections[symbol]:
            try:
                await websocket.send(message)
            except websockets.ConnectionClosed:
                disconnected.add(websocket)
            except Exception as e:
                self.logger.error(f"Error broadcasting message: {str(e)}")
                disconnected.add(websocket)
                
        # 清理断开的连接
        for websocket in disconnected:
            self.ws_connections[symbol].remove(websocket)

    def _save_kline_to_db(self, symbol: str, kline_data: Dict):
        """保存K线数据到数据库"""
        try:
            market_data = MarketData(
                symbol=symbol,
                timestamp=datetime.fromtimestamp(kline_data['timestamp']),
                open=kline_data['open'],
                high=kline_data['high'],
                low=kline_data['low'],
                close=kline_data['close'],
                volume=kline_data['volume']
            )
            
            self.db_session.add(market_data)
            self.db_session.commit()
            
        except Exception as e:
            self.logger.error(f"Error saving kline data to database: {str(e)}")
            self.db_session.rollback()

    async def clean_old_data(self):
        """清理旧数据"""
        while self.running:
            try:
                # 清理Redis中的旧数据
                retention_days = self.config.get('market_data.retention_days', 7)
                cutoff_time = datetime.now() - timedelta(days=retention_days)
                
                # 清理数据库中的旧数据
                self.db_session.query(MarketData).filter(
                    MarketData.timestamp < cutoff_time
                ).delete()
                
                self.db_session.commit()
                
                # 每天执行一次清理
                await asyncio.sleep(24 * 60 * 60)
                
            except Exception as e:
                self.logger.error(f"Error cleaning old data: {str(e)}")
                await asyncio.sleep(60)  # 发生错误时等待1分钟后重试

    def register_price_callback(self, callback: callable):
        """注册价格更新回调"""
        self.price_callbacks.append(callback)

    def register_kline_callback(self, callback: callable):
        """注册K线更新回调"""
        self.kline_callbacks.append(callback)

    def register_orderbook_callback(self, callback: callable):
        """注册订单簿更新回调"""
        self.orderbook_callbacks.append(callback) 
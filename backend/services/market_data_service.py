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
from backend.models.database import MarketData, Base, engine, SQLALCHEMY_DATABASE_URL
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from config.config_manager import ConfigManager
from fastapi import WebSocket
import websocket
import requests
import threading
import time

class MarketDataService:
    def __init__(self, config: ConfigManager):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # 数据库连接
        self.database_url = config.get('database.url', SQLALCHEMY_DATABASE_URL)
        self.engine = create_engine(self.database_url)
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
        self.ws_connections: Dict[str, Set[WebSocket]] = {}
        self.running = True
        
        # 行情更新回调函数
        self.price_callbacks: List[callable] = []
        self.kline_callbacks: List[callable] = []
        self.orderbook_callbacks: List[callable] = []

        self.ws = None
        self.subscribers = []
        self.market_data = {}
        self.historical_data = pd.DataFrame()
        
        # 确保数据库表已创建
        Base.metadata.create_all(bind=engine)

        self.api_key = config.get('market_data.api_key', 'your_api_key')
        self.ws_url = config.get('market_data.ws_url', 'ws://api.vvtr.com/v1/connect')
        self.api_url = config.get('market_data.api_url', 'http://api.vvtr.com/v1')

    async def start(self):
        """启动市场数据服务"""
        try:
            # 建立 WebSocket 连接
            ws_url = f"{self.ws_url}?apiKey={self.api_key}"
            self.ws = await websockets.connect(ws_url)
            
            # 启动心跳检测
            asyncio.create_task(self._heartbeat())
            # 启动数据监听
            asyncio.create_task(self._listen())
            
            self.logger.info("市场数据服务启动成功")
        except Exception as e:
            self.logger.error(f"连接WebSocket失败: {str(e)}")
            raise

    async def _heartbeat(self):
        """发送心跳包"""
        while self.running:
            try:
                if self.ws:
                    await self.ws.send("ping")
                    self.logger.debug("Sent heartbeat ping")
                await asyncio.sleep(60)  # 每分钟发送一次
            except Exception as e:
                self.logger.error(f"发送心跳包失败: {str(e)}")
                await asyncio.sleep(5)

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

    async def subscribe(self, symbols: list, market_type: str = 'cn_stocks'):
        """订阅市场数据"""
        try:
            if len(symbols) > 30:
                raise ValueError("最多同时订阅30个合约")
                
            # 构建订阅URL
            symbols_str = ','.join(symbols)
            subscribe_url = f"{self.api_url}/subscribe?{market_type}={symbols_str}&apiKey={self.api_key}"
            
            # 发送订阅请求
            async with websockets.connect(subscribe_url) as ws:
                response = await ws.recv()
                data = json.loads(response)
                
                if data.get('code') != 200:
                    raise Exception(f"订阅失败: {data.get('msg')}")
                    
                self.logger.info(f"成功订阅: {symbols}")
                return True
                
        except Exception as e:
            self.logger.error(f"订阅失败: {str(e)}")
            raise

    async def unsubscribe(self, callback):
        """取消订阅"""
        self.price_callbacks.remove(callback)
        self.kline_callbacks.remove(callback)
        self.orderbook_callbacks.remove(callback)

    def get_latest_price(self, symbol: str) -> float:
        """获取最新价格"""
        if symbol in self.price_cache:
            return self.price_cache[symbol]
        return None

    async def _listen(self):
        """监听市场数据"""
        while True:
            try:
                if self.ws:
                    data = await self.ws.recv()
                    market_data = json.loads(data)
                    await self._process_market_data(market_data)
            except Exception as e:
                self.logger.error(f"处理市场数据时出错: {str(e)}")
                await asyncio.sleep(5)

    async def _process_market_data(self, data: Dict):
        """处理市场数据"""
        try:
            symbol = data.get('symbol')
            if not symbol:
                return
                
            # 更新缓存
            self.price_cache[symbol] = {
                'latest_price': data.get('latest_price'),
                'last_volume': data.get('last_volume'),
                'last_amount': data.get('last_amount'),
                'quotes': data.get('quotes', []),
                'update_time': data.get('update_time')
            }
            
            # 广播给订阅者
            await self._broadcast_to_subscribers(symbol, data)
            
        except Exception as e:
            self.logger.error(f"处理市场数据时出错: {str(e)}")

    def get_historical_data(self, symbol: str, start_time: datetime = None, end_time: datetime = None) -> pd.DataFrame:
        """获取历史数据"""
        df = self.historical_data[self.historical_data['symbol'] == symbol].copy()
        if start_time:
            df = df[df['timestamp'] >= pd.Timestamp(start_time)]
        if end_time:
            df = df[df['timestamp'] <= pd.Timestamp(end_time)]
        return df

    def calculate_indicators(self, symbol: str, window: int = 20) -> Dict:
        """计算基本技术指标"""
        df = self.get_historical_data(symbol)
        if len(df) < window:
            return {}
            
        # 计算简单指标
        prices = df['price'].values
        sma = np.mean(prices[-window:])
        std = np.std(prices[-window:])
        rsi = self._calculate_rsi(prices, window)
        
        return {
            'sma': float(sma),
            'upper_band': float(sma + (2 * std)),
            'lower_band': float(sma - (2 * std)),
            'rsi': float(rsi)
        }
        
    def _calculate_rsi(self, prices: np.array, window: int = 14) -> float:
        """计算RSI指标"""
        deltas = np.diff(prices)
        seed = deltas[:window+1]
        up = seed[seed >= 0].sum()/window
        down = -seed[seed < 0].sum()/window
        if down == 0:
            return 100
        rs = up/down
        return 100 - (100/(1+rs))

    def on_message(self, ws, message):
        """处理接收到的消息"""
        try:
            data = json.loads(message)
            self.logger.info(f"收到数据: {message}")
            # 更新缓存
            if 'symbol' in data:
                self.price_cache[data['symbol']] = data
            # 触发回调
            for callback in self.price_callbacks:
                callback(data)
        except Exception as e:
            self.logger.error(f"处理消息时出错: {str(e)}")

    def on_error(self, ws, error):
        """处理错误"""
        self.logger.error(f"WebSocket错误: {str(error)}")

    def on_close(self, ws, close_status_code, close_msg):
        """处理连接关闭"""
        self.logger.info("WebSocket连接关闭")
        if self.running:
            self.logger.info("尝试重新连接...")
            self.start()

    def on_open(self, ws):
        """处理连接打开"""
        self.logger.info("WebSocket连接已建立")
        
        # 启动心跳线程
        def send_ping():
            while self.running:
                try:
                    ws.send("ping")
                    self.logger.debug("发送心跳包")
                    time.sleep(60)  # 每分钟发送一次
                except Exception as e:
                    self.logger.error(f"发送心跳包失败: {str(e)}")
                    break

        ping_thread = threading.Thread(target=send_ping)
        ping_thread.daemon = True
        ping_thread.start()

    def start(self):
        """启动 WebSocket 服务"""
        try:
            websocket.enableTrace(True)
            self.ws = websocket.WebSocketApp(
                self.ws_url,
                on_message=self.on_message,
                on_error=self.on_error,
                on_close=self.on_close,
                on_open=self.on_open
            )
            
            # 在新线程中运行 WebSocket
            ws_thread = threading.Thread(target=self.ws.run_forever)
            ws_thread.daemon = True
            ws_thread.start()
            
            self.logger.info("市场数据服务启动成功")
            return True
        except Exception as e:
            self.logger.error(f"启动服务失败: {str(e)}")
            return False

    def stop(self):
        """停止服务"""
        self.running = False
        if self.ws:
            self.ws.close()

    def subscribe(self, symbols: list, market_type: str = 'cn_stocks'):
        """订阅市场数据"""
        try:
            if len(symbols) > 30:
                raise ValueError("最多同时订阅30个合约")
            
            # 构建订阅URL
            symbols_str = ','.join(symbols)
            subscribe_url = f"{self.api_url}/subscribe?{market_type}={symbols_str}&apiKey={self.api_key}"
            
            # 发送订阅请求
            response = requests.get(subscribe_url)
            if response.status_code == 200:
                data = response.json()
                if data.get('code') == 200:
                    self.logger.info(f"订阅成功: {symbols}")
                    return True
                else:
                    raise Exception(f"订阅失败: {data.get('msg')}")
            else:
                raise Exception(f"订阅请求失败: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"订阅失败: {str(e)}")
            raise

    def add_callback(self, callback):
        """添加数据回调函数"""
        self.price_callbacks.append(callback)

    def remove_callback(self, callback):
        """移除数据回调函数"""
        if callback in self.price_callbacks:
            self.price_callbacks.remove(callback) 
import asyncio
import websockets
import json
import logging
from typing import Dict, Set
from datetime import datetime
from models.database import MarketData
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class WebSocketService:
    def __init__(self):
        self.connections: Dict[str, Set[websockets.WebSocketServerProtocol]] = {}
        self.market_data_cache = {}
        self.db_session = Session()

    async def register(self, websocket: websockets.WebSocketServerProtocol, symbol: str):
        """注册新的WebSocket连接"""
        if symbol not in self.connections:
            self.connections[symbol] = set()
        self.connections[symbol].add(websocket)
        logger.info(f"New connection registered for {symbol}")

    async def unregister(self, websocket: websockets.WebSocketServerProtocol, symbol: str):
        """注销WebSocket连接"""
        self.connections[symbol].remove(websocket)
        if not self.connections[symbol]:
            del self.connections[symbol]
        logger.info(f"Connection unregistered for {symbol}")

    async def broadcast(self, symbol: str, message: dict):
        """广播消息给所有订阅者"""
        if symbol not in self.connections:
            return

        disconnected = set()
        for websocket in self.connections[symbol]:
            try:
                await websocket.send(json.dumps(message))
            except websockets.ConnectionClosed:
                disconnected.add(websocket)
            except Exception as e:
                logger.error(f"Error broadcasting message: {str(e)}")
                disconnected.add(websocket)

        # 清理断开的连接
        for websocket in disconnected:
            await self.unregister(websocket, symbol)

    async def handle_connection(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """处理WebSocket连接"""
        try:
            # 等待订阅消息
            subscription = await websocket.recv()
            subscription_data = json.loads(subscription)
            symbol = subscription_data.get('symbol')

            if not symbol:
                await websocket.close(1008, "Symbol not specified")
                return

            await self.register(websocket, symbol)

            # 发送最新的缓存数据
            if symbol in self.market_data_cache:
                await websocket.send(json.dumps(self.market_data_cache[symbol]))

            # 保持连接并处理消息
            try:
                async for message in websocket:
                    # 处理客户端消息（如心跳检测）
                    data = json.loads(message)
                    if data.get('type') == 'ping':
                        await websocket.send(json.dumps({'type': 'pong'}))
            except websockets.ConnectionClosed:
                pass
            finally:
                await self.unregister(websocket, symbol)

        except Exception as e:
            logger.error(f"Error handling connection: {str(e)}")
            await websocket.close(1011, "Internal server error")

    async def start_server(self, host: str = 'localhost', port: int = 8765):
        """启动WebSocket服务器"""
        async with websockets.serve(self.handle_connection, host, port):
            logger.info(f"WebSocket server started on ws://{host}:{port}")
            await asyncio.Future()  # 运行永久

    def update_market_data(self, market_data: MarketData):
        """更新市场数据并广播"""
        symbol = market_data.symbol
        data = {
            'type': 'market_data',
            'symbol': symbol,
            'timestamp': market_data.timestamp.isoformat(),
            'data': {
                'open': market_data.open,
                'high': market_data.high,
                'low': market_data.low,
                'close': market_data.close,
                'volume': market_data.volume
            }
        }
        
        # 更新缓存
        self.market_data_cache[symbol] = data
        
        # 保存到数据库
        try:
            self.db_session.add(market_data)
            self.db_session.commit()
        except Exception as e:
            logger.error(f"Error saving market data: {str(e)}")
            self.db_session.rollback()
        
        # 广播更新
        asyncio.create_task(self.broadcast(symbol, data)) 
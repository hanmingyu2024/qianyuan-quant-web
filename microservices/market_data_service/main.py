from fastapi import FastAPI
import asyncio
import websockets
import json
from typing import Dict

app = FastAPI()

class MarketDataService:
    def __init__(self):
        self.connections: Dict[str, websockets.WebSocketServerProtocol] = {}
        self.market_data = {}

    async def connect_exchange(self):
        # 连接交易所WebSocket
        async with websockets.connect('wss://exchange.example.com/ws') as ws:
            while True:
                data = await ws.recv()
                await self.broadcast(data)

    async def broadcast(self, message):
        # 广播市场数据给所有订阅的客户端
        for connection in self.connections.values():
            try:
                await connection.send(json.dumps(message))
            except:
                continue

market_service = MarketDataService()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(market_service.connect_exchange())

@app.websocket("/ws/market")
async def websocket_endpoint(websocket: websockets.WebSocketServerProtocol):
    client_id = id(websocket)
    market_service.connections[client_id] = websocket
    try:
        while True:
            await websocket.recv()
    except:
        del market_service.connections[client_id] 
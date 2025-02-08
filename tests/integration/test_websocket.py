import pytest
import websockets
import json
import asyncio

async def test_websocket_connection():
    """测试WebSocket连接和数据订阅"""
    uri = "ws://localhost:8000/ws/market"
    async with websockets.connect(uri) as websocket:
        # 发送订阅请求
        await websocket.send(json.dumps({
            "type": "subscribe",
            "symbol": "rb9999"
        }))
        
        # 等待响应
        response = await websocket.recv()
        data = json.loads(response)
        assert "type" in data
        assert data["symbol"] == "rb9999"
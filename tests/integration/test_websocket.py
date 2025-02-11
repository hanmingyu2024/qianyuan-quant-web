import pytest
import websockets
import json
import asyncio
from unittest.mock import patch, AsyncMock

class TestWebSocket:
    @pytest.mark.asyncio
    async def test_websocket_connection(self, mocker):
        """测试WebSocket连接建立"""
        uri = "wss://api.vvtr.com/v1/connect"
        api_key = "test_api_key"
        
        mock_ws = AsyncMock()
        mock_ws.open = True
        mocker.patch('websockets.connect', return_value=mock_ws)
        
        async with websockets.connect(f"{uri}?apiKey={api_key}") as websocket:
            assert websocket.open is True
            
            # 测试心跳
            await websocket.send("ping")
            response = await websocket.recv()
            assert response == "pong"

    @pytest.mark.asyncio
    async def test_market_data_subscription(self, mocker):
        """测试市场数据订阅"""
        uri = "wss://api.vvtr.com/v1/connect"
        api_key = "test_api_key"
        
        mock_ws = AsyncMock()
        mock_ws.open = True
        mock_ws.recv.return_value = json.dumps({
            "code": 200,
            "message": "订阅成功"
        })
        mocker.patch('websockets.connect', return_value=mock_ws)
        
        async with websockets.connect(f"{uri}?apiKey={api_key}") as websocket:
            # 发送订阅请求
            subscribe_data = {
                "symbol": "rb9999",
                "market_type": "cn_futures"
            }
            await websocket.send(json.dumps(subscribe_data))
            
            # 等待订阅响应
            response = await websocket.recv()
            data = json.loads(response)
            assert data.get("code") == 200
            assert data.get("message") == "订阅成功"

    @pytest.mark.asyncio
    async def test_market_data_receiving(self):
        """测试接收市场数据"""
        uri = "wss://api.vvtr.com/v1/connect"
        api_key = "test_api_key"
        
        async with websockets.connect(f"{uri}?apiKey={api_key}") as websocket:
            # 订阅数据
            await websocket.send(json.dumps({
                "symbol": "rb9999",
                "market_type": "cn_futures"
            }))
            
            # 等待订阅确认
            response = await websocket.recv()
            
            # 等待并验证市场数据
            try:
                async with asyncio.timeout(5):  # 设置5秒超时
                    market_data = await websocket.recv()
                    data = json.loads(market_data)
                    
                    # 验证数据结构
                    assert "symbol" in data
                    assert "latest_price" in data
                    assert "quotes" in data
                    assert data["symbol"] == "rb9999"
            except asyncio.TimeoutError:
                pytest.fail("未在预期时间内收到市场数据")

    @pytest.mark.asyncio
    async def test_multiple_symbols_subscription(self):
        """测试多合约订阅"""
        uri = "wss://api.vvtr.com/v1/connect"
        api_key = "test_api_key"
        
        async with websockets.connect(f"{uri}?apiKey={api_key}") as websocket:
            # 订阅多个合约
            symbols = ["rb9999", "hc9999", "i9999"]
            await websocket.send(json.dumps({
                "symbols": symbols,
                "market_type": "cn_futures"
            }))
            
            # 验证订阅响应
            response = await websocket.recv()
            data = json.loads(response)
            assert data.get("code") == 200
            
            # 验证是否收到所有合约的数据
            received_symbols = set()
            try:
                async with asyncio.timeout(10):  # 设置10秒超时
                    while len(received_symbols) < len(symbols):
                        market_data = await websocket.recv()
                        data = json.loads(market_data)
                        received_symbols.add(data["symbol"])
            except asyncio.TimeoutError:
                pytest.fail("未收到所有订阅合约的数据")
            
            assert received_symbols == set(symbols)

    @pytest.mark.asyncio
    async def test_connection_error_handling(self):
        """测试连接错误处理"""
        uri = "wss://api.vvtr.com/v1/connect"
        api_key = "invalid_key"
        
        with pytest.raises(websockets.exceptions.WebSocketException):
            async with websockets.connect(f"{uri}?apiKey={api_key}"):
                pass

    @pytest.mark.asyncio
    async def test_reconnection(self):
        """测试断线重连"""
        uri = "wss://api.vvtr.com/v1/connect"
        api_key = "test_api_key"
        
        async with websockets.connect(f"{uri}?apiKey={api_key}") as websocket:
            # 模拟断线
            await websocket.close()
            
            # 等待重连
            await asyncio.sleep(1)
            
            # 验证重连后能否正常订阅
            async with websockets.connect(f"{uri}?apiKey={api_key}") as new_websocket:
                await new_websocket.send(json.dumps({
                    "symbol": "rb9999",
                    "market_type": "cn_futures"
                }))
                
                response = await new_websocket.recv()
                data = json.loads(response)
                assert data.get("code") == 200
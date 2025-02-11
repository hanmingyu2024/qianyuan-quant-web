import pytest
from unittest.mock import Mock, patch
from backend.services.market_data_service import MarketDataService
import json
from unittest.mock import AsyncMock
import asyncio
from config.config_manager import ConfigManager
import websocket
import requests
import threading
import time
import ssl
import logging
from typing import Dict, Any, List

@pytest.fixture
async def market_service(mocker):
    """创建市场数据服务的测试夹具"""
    config = {
        'market_data': {
            'api_key': 'test_key',
            'ws_url': 'wss://api.vvtr.com/v1/connect',
            'api_url': 'https://api.vvtr.com/v1'
        }
    }
    service = MarketDataService(config)
    # 模拟websocket连接
    mock_ws = AsyncMock()
    mocker.patch('websockets.connect', return_value=mock_ws)
    await service.start()
    return service

class TestMarketDataService:
    @pytest.mark.asyncio
    async def test_subscribe_success(self, market_service):
        """测试成功订阅市场数据"""
        with patch('websockets.connect') as mock_connect:
            mock_ws = AsyncMock()
            mock_ws.recv.return_value = json.dumps({
                'code': 0,
                'msg': 'success'
            })
            mock_connect.return_value = mock_ws
            
            result = await market_service.subscribe(['rb9999'], 'cn_futures')
            assert result is True

    async def test_subscribe_limit(self, market_service):
        """测试订阅数量限制"""
        symbols = ['rb9999'] * 31
        market_type = 'cn_futures'
        
        with pytest.raises(ValueError) as exc_info:
            await market_service.subscribe(symbols, market_type)
        assert "最多同时订阅30个合约" in str(exc_info.value)

    async def test_get_latest_price(self, market_service):
        """测试获取最新价格"""
        symbol = 'rb9999'
        mock_price = 4500.0
        market_service.price_cache[symbol] = {'latest_price': mock_price}
        
        price = market_service.get_latest_price(symbol)
        assert price == mock_price

    async def test_process_market_data(self, market_service):
        """测试处理市场数据"""
        test_data = {
            'symbol': 'rb9999',
            'latest_price': 4500.0,
            'last_volume': 100,
            'quotes': [
                {'bid_p': 4499, 'bid_v': 10, 'ask_p': 4501, 'ask_v': 20}
            ]
        }
        
        await market_service._process_market_data(test_data)
        assert 'rb9999' in market_service.price_cache
        assert market_service.price_cache['rb9999']['latest_price'] == 4500.0

class MarketDataTester:
    def __init__(self):
        self.api_key = "8KpF9LapxaB48dc5b9e708843d0e2a3"
        self.host = "api.vvtr.com"
        self.ws_url = f"ws://{self.host}/v1/connect?apiKey={self.api_key}"
        self.subscribe_url = f"http://{self.host}/v1/subscribe?cn_futures=rb9999&apiKey={self.api_key}"
        self.ws = None
        self.is_connected = False
        self.logger = logging.getLogger(__name__)

    def process_tick_data(self, data: Dict[str, Any]):
        """处理Tick数据"""
        symbol = data.get("symbol")
        latest_price = data.get("latest_price")
        quotes = data.get("quotes", [])
        self.logger.info(f"Tick数据 - {symbol}: 最新价={latest_price}")
        if quotes:
            bid = quotes[0].get("bid_p", 0)
            ask = quotes[0].get("ask_p", 0)
            bid_vol = quotes[0].get("bid_v", 0)
            ask_vol = quotes[0].get("ask_v", 0)
            self.logger.info(f"盘口数据 - 买一:{bid}({bid_vol}) 卖一:{ask}({ask_vol})")

    def process_kline_data(self, data: Dict[str, Any]):
        """处理K线数据"""
        symbol = data.get("symbol")
        interval = data.get("interval")
        open_price = data.get("open")
        high = data.get("high")
        low = data.get("low")
        close = data.get("close")
        volume = data.get("volume")
        self.logger.info(f"K线数据 - {symbol} {interval}: OHLC={open_price},{high},{low},{close} 成交量={volume}")

    def on_message(self, ws, message):
        """处理接收到的消息"""
        try:
            # 解析JSON数据
            data_list = json.loads(message)
            
            # 确保数据是列表类型
            if not isinstance(data_list, list):
                data_list = [data_list]
            
            # 处理列表中的每个数据项
            for data in data_list:
                if data.get("interval") == "tick":
                    self.process_tick_data(data)
                elif data.get("interval") == "1m":
                    self.process_kline_data(data)
                
        except json.JSONDecodeError:
            self.logger.error("数据解析错误")
        except Exception as e:
            self.logger.error(f"处理数据错误: {e}")

    def on_error(self, ws, error):
        """处理错误"""
        self.logger.error(f"WebSocket错误: {error}")
        self.is_connected = False
        self.reconnect()

    def on_close(self, ws, close_status_code, close_msg):
        """处理连接关闭"""
        self.logger.info(f"连接关闭: {close_status_code}")
        self.is_connected = False
        self.reconnect()

    def on_open(self, ws):
        """处理连接打开"""
        self.logger.info("连接成功")
        self.is_connected = True
        
        # 发送订阅请求
        response = requests.get(self.subscribe_url)
        if response.status_code == 200:
            self.logger.info(f"订阅成功: {response.json()}")
        else:
            self.logger.error(f"订阅失败: {response.status_code}")

        # 启动心跳
        self.start_heartbeat()

    def start_heartbeat(self):
        """启动心跳"""
        def send_ping():
            while self.is_connected:
                try:
                    self.ws.send("ping")
                    self.logger.debug("发送ping")
                    time.sleep(20)
                except:
                    break
        
        threading.Thread(target=send_ping, daemon=True).start()

    def reconnect(self):
        """重新连接"""
        if not self.is_connected:
            self.logger.info("尝试重新连接...")
            time.sleep(5)
            self.connect()

    def connect(self):
        """建立连接"""
        self.ws = websocket.WebSocketApp(
            self.ws_url,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
            on_open=self.on_open
        )
        
        websocket.enableTrace(True)
        self.ws.run_forever()

    def run(self):
        """运行测试"""
        try:
            self.connect()
        except KeyboardInterrupt:
            self.logger.info("程序终止")
        except Exception as e:
            self.logger.error(f"运行错误: {e}")

def main():
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # 运行测试
    tester = MarketDataTester()
    tester.run()

if __name__ == "__main__":
    main()
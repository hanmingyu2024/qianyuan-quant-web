import pytest
from unittest.mock import Mock, patch
from backend.services.market_data_service import MarketDataService
import json
from unittest.mock import AsyncMock

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
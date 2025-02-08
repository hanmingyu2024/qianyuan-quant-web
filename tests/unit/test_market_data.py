import pytest
from unittest.mock import Mock, patch
from backend.services.market_data_service import MarketDataService

@pytest.fixture
def market_service():
    config = {
        'market_data.api_key': 'test_key',
        'market_data.ws_url': 'ws://test.com/ws',
        'market_data.api_url': 'http://test.com/api'
    }
    return MarketDataService(config)

async def test_subscribe_market_data(market_service):
    """测试订阅市场数据"""
    symbols = ['rb9999']
    market_type = 'cn_futures'
    
    with patch('websockets.connect') as mock_connect:
        mock_ws = Mock()
        mock_ws.recv.return_value = '{"code": 200, "msg": "success"}'
        mock_connect.return_value.__aenter__.return_value = mock_ws
        
        result = await market_service.subscribe(symbols, market_type)
        assert result is True

async def test_subscribe_limit_exceeded(market_service):
    """测试超过订阅限制"""
    symbols = ['rb9999'] * 31  # 超过30个合约
    market_type = 'cn_futures'
    
    with pytest.raises(ValueError) as exc_info:
        await market_service.subscribe(symbols, market_type)
    assert "最多同时订阅30个合约" in str(exc_info.value)
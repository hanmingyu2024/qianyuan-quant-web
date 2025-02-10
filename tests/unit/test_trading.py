import pytest
from unittest.mock import Mock, patch
from backend.services.execution_engine import ExecutionEngine
from backend.models.database import Order, Trade
from backend.services.market_data_service import MarketDataService
from backend.services.risk_control_service import RiskControlService
from unittest.mock import AsyncMock

@pytest.fixture
async def market_service(mocker):
    """创建市场数据服务"""
    config = {
        'market_data': {
            'api_key': 'test_key',
            'ws_url': 'wss://api.vvtr.com/v1/connect',
            'api_url': 'https://api.vvtr.com/v1'
        }
    }
    
    mock_ws = AsyncMock()
    mock_ws.open = True
    mocker.patch('websockets.connect', return_value=mock_ws)
    
    service = MarketDataService(config)
    await service.start()
    return service

@pytest.fixture
async def risk_service():
    """创建风控服务"""
    config = {
        'risk_control': {
            'max_position': 100,
            'max_order_value': 1000000
        }
    }
    return RiskControlService(config)

@pytest.fixture
async def trading_service(market_service, risk_service):
    """创建交易服务"""
    config = {}
    return ExecutionEngine(market_service, risk_service, config)

class TestTradingService:
    async def test_execute_order_success(self, trading_service):
        """测试成功执行订单"""
        order = Order(
            symbol='rb9999',
            direction='BUY',
            price=4500.0,
            volume=10
        )
        
        with patch.object(trading_service.risk_service, 'check_order', return_value=True):
            with patch.object(trading_service.market_data_service, 'get_latest_price', return_value=4500.0):
                result = await trading_service.execute_order(order)
                assert result is True
                assert order.status == "FILLED"

    async def test_execute_order_risk_check_fail(self, trading_service):
        """测试风控检查失败"""
        order = Order(
            symbol='rb9999',
            direction='BUY',
            price=4500.0,
            volume=10
        )
        
        with patch.object(trading_service.risk_service, 'check_order', return_value=False):
            result = await trading_service.execute_order(order)
            assert result is False
            assert order.status == "REJECTED"

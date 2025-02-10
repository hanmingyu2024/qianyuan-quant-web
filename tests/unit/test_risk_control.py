import pytest
from unittest.mock import Mock, patch
from backend.services.risk_control_service import RiskControlService
from backend.models.database import Order
from backend.services.market_data_service import MarketDataService

@pytest.fixture
async def market_service():
    """创建市场数据服务"""
    config = {
        'market_data': {
            'api_key': 'test_key',
            'ws_url': 'ws://api.vvtr.com/v1/connect',
            'api_url': 'http://api.vvtr.com/v1'
        }
    }
    service = MarketDataService(config)
    await service.start()
    yield service
    await service.stop()

@pytest.fixture
def risk_service(market_service):
    """创建风控服务"""
    config = {
        'risk_control': {
            'max_position': 100,
            'max_order_value': 1000000
        }
    }
    return RiskControlService(config, market_service)

class TestRiskControlService:
    async def test_check_position_limit(self, risk_service):
        """测试持仓限制"""
        order = Order(
            symbol='rb9999',
            direction='BUY',
            volume=50
        )
        
        result = await risk_service._check_position_limit(order)
        assert result is True

    async def test_check_price_deviation(self, risk_service):
        """测试价格偏离度检查"""
        order = Order(
            symbol='rb9999',
            direction='BUY',
            price=4500.0
        )
        
        with patch.object(risk_service.market_data_service, 'get_latest_price', return_value=4400.0):
            result = await risk_service._check_price_deviation(order)
            assert result is False  # 价格偏离超过5%

    async def test_check_order_amount(self, risk_service):
        """测试订单金额限制"""
        order = Order(
            symbol='rb9999',
            direction='BUY',
            price=4500.0,
            volume=200
        )
        
        result = await risk_service._check_order_amount_limit(order)
        assert result is False  # 订单金额超过限制

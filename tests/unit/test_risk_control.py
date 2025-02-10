import pytest
from unittest.mock import Mock, patch
from backend.services.risk_control_service import RiskControlService
from backend.models.database import Order

@pytest.fixture
def risk_service(market_service):
    """创建风控服务实例"""
    config = {
        'risk': {
            'max_position': 100,
            'max_order_amount': 1000000,
            'max_price_deviation': 0.05
        }
    }
    return RiskControlService(market_service, config)

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

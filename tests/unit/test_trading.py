import pytest
from unittest.mock import Mock, patch
from backend.services.execution_engine import ExecutionEngine
from backend.models.database import Order, Trade

@pytest.fixture
def trading_service(market_service, risk_service):
    """创建交易服务实例"""
    config = {'trading': {'max_order_size': 100}}
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

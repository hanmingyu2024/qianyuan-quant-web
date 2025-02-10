import pytest
from datetime import datetime
from backend.models.order import Order
from backend.services.market_data_service import MarketDataService
from backend.services.execution_engine import ExecutionEngine
from backend.services.risk_control_service import RiskControlService

class TestTradingFlow:
    @pytest.fixture
    async def setup_services(self):
        """初始化所有服务"""
        config = {
            'market_data': {
                'api_key': 'test_key',
                'ws_url': 'ws://api.vvtr.com/v1/connect',
                'api_url': 'http://api.vvtr.com/v1'
            },
            'risk_control': {
                'max_position': 100,
                'max_order_value': 1000000
            }
        }
        
        market_service = MarketDataService(config)
        risk_service = RiskControlService(config)
        execution_service = ExecutionEngine(market_service, risk_service, config)
        
        await market_service.start()
        
        return {
            'market': market_service,
            'risk': risk_service,
            'execution': execution_service
        }

    async def test_market_data_flow(self, setup_services):
        """测试行情数据流程"""
        market_service = setup_services['market']
        
        # 订阅期货行情
        symbols = ['rb9999']
        result = await market_service.subscribe(symbols, 'cn_futures')
        assert result is True
        
        # 验证数据接收
        data = await market_service.get_latest_data('rb9999')
        assert data is not None
        assert 'latest_price' in data
        assert 'quotes' in data

    async def test_trading_flow(self, setup_services):
        """测试交易流程"""
        execution_service = setup_services['execution']
        market_service = setup_services['market']
        
        # 创建订单
        order = Order(
            symbol='rb9999',
            direction='BUY',
            price=4500.0,
            volume=2,
            order_type='LIMIT'
        )
        
        # 提交订单
        order_id = await execution_service.submit_order(order)
        assert order_id is not None
        
        # 查询订单状态
        order_status = await execution_service.get_order_status(order_id)
        assert order_status in ['PENDING', 'FILLED', 'REJECTED']

    async def test_risk_control(self, setup_services):
        """测试风控流程"""
        risk_service = setup_services['risk']
        execution_service = setup_services['execution']
        
        # 测试超限订单
        large_order = Order(
            symbol='rb9999',
            direction='BUY',
            price=4500.0,
            volume=200  # 超过持仓限制
        )
        
        # 验证风控拦截
        with pytest.raises(ValueError) as exc_info:
            await execution_service.submit_order(large_order)
        assert "超过持仓限制" in str(exc_info.value)

    async def test_websocket_connection(self, setup_services):
        """测试WebSocket连接"""
        market_service = setup_services['market']
        
        # 验证连接状态
        assert market_service.ws is not None
        assert market_service.ws.open is True
        
        # 测试心跳
        await market_service.ws.send("ping")
        response = await market_service.ws.recv()
        assert response == "pong"

    async def test_market_data_processing(self, setup_services):
        """测试行情数据处理"""
        market_service = setup_services['market']
        
        # 模拟接收行情数据
        test_data = {
            'symbol': 'rb9999',
            'latest_price': 4500.0,
            'last_volume': 100,
            'quotes': [
                {'bid_p': 4499, 'bid_v': 10, 'ask_p': 4501, 'ask_v': 20}
            ]
        }
        
        await market_service._process_market_data(test_data)
        
        # 验证数据缓存
        cached_data = market_service.price_cache.get('rb9999')
        assert cached_data is not None
        assert cached_data['latest_price'] == 4500.0

    async def test_error_handling(self, setup_services):
        """测试错误处理"""
        market_service = setup_services['market']
        execution_service = setup_services['execution']
        
        # 测试无效订阅
        with pytest.raises(ValueError):
            await market_service.subscribe(['invalid_symbol'], 'cn_futures')
        
        # 测试无效订单
        invalid_order = Order(
            symbol='rb9999',
            direction='INVALID',
            price=4500.0,
            volume=1
        )
        with pytest.raises(ValueError):
            await execution_service.submit_order(invalid_order)

    def teardown_method(self):
        """测试清理"""
        # 关闭连接等清理工作
        pass

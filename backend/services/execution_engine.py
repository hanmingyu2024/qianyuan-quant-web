import asyncio
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import uuid
import logging
from decimal import Decimal
from enum import Enum
from dataclasses import dataclass
from sqlalchemy.orm import Session
from models.database import Order, Trade, Position
from services.market_data_service import MarketDataService
from services.risk_service import RiskService
from config.config_manager import ConfigManager

class OrderStatus(Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class OrderType(Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOP = "STOP"
    STOP_LIMIT = "STOP_LIMIT"

class OrderSide(Enum):
    BUY = "BUY"
    SELL = "SELL"

@dataclass
class OrderRequest:
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: Decimal
    price: Optional[Decimal] = None
    stop_price: Optional[Decimal] = None
    time_in_force: str = "GTC"  # GTC, IOC, FOK
    client_order_id: Optional[str] = None
    user_id: int = None

class ExecutionEngine:
    def __init__(
        self,
        market_data_service: MarketDataService,
        risk_service: RiskService,
        config: ConfigManager,
        db_session: Session
    ):
        self.market_data_service = market_data_service
        self.risk_service = risk_service
        self.config = config
        self.db_session = db_session
        self.logger = logging.getLogger(__name__)
        
        # 订单管理
        self.active_orders: Dict[str, Order] = {}
        self.order_queue: asyncio.Queue = asyncio.Queue()
        
        # 性能监控
        self.execution_latency: List[float] = []
        self.order_count: int = 0
        self.rejection_count: int = 0
        
        # 订单执行配置
        self.max_slippage = Decimal(config.get('trading.max_slippage', '0.001'))
        self.min_order_size = Decimal(config.get('trading.min_order_size', '0.001'))
        self.max_order_size = Decimal(config.get('trading.max_order_size', '10.0'))

    async def start(self):
        """启动执行引擎"""
        try:
            # 注册市场数据回调
            self.market_data_service.register_price_callback(self._handle_price_update)
            
            # 启动订单处理循环
            asyncio.create_task(self._process_order_queue())
            
            self.logger.info("Execution engine started successfully")
            
        except Exception as e:
            self.logger.error(f"Error starting execution engine: {str(e)}")
            raise

    async def submit_order(self, order_request: OrderRequest) -> Tuple[bool, str, Optional[str]]:
        """提交订单"""
        try:
            # 验证订单
            if not self._validate_order(order_request):
                return False, "Order validation failed", None
            
            # 检查风险限制
            if not await self._check_risk_limits(order_request):
                return False, "Risk limits exceeded", None
            
            # 生成订单ID
            order_id = str(uuid.uuid4())
            
            # 创建订单对象
            order = Order(
                order_id=order_id,
                client_order_id=order_request.client_order_id,
                user_id=order_request.user_id,
                symbol=order_request.symbol,
                side=order_request.side.value,
                order_type=order_request.order_type.value,
                quantity=order_request.quantity,
                price=order_request.price,
                stop_price=order_request.stop_price,
                time_in_force=order_request.time_in_force,
                status=OrderStatus.PENDING.value,
                created_at=datetime.utcnow()
            )
            
            # 保存订单到数据库
            self.db_session.add(order)
            self.db_session.commit()
            
            # 添加到活动订单
            self.active_orders[order_id] = order
            
            # 放入订单队列
            await self.order_queue.put(order)
            
            return True, "Order submitted successfully", order_id
            
        except Exception as e:
            self.logger.error(f"Error submitting order: {str(e)}")
            self.db_session.rollback()
            return False, f"Error submitting order: {str(e)}", None

    async def cancel_order(self, order_id: str) -> Tuple[bool, str]:
        """取消订单"""
        try:
            if order_id not in self.active_orders:
                return False, "Order not found"
                
            order = self.active_orders[order_id]
            
            if order.status not in [OrderStatus.PENDING.value, OrderStatus.PARTIAL.value]:
                return False, f"Order cannot be cancelled in status: {order.status}"
                
            order.status = OrderStatus.CANCELLED.value
            order.updated_at = datetime.utcnow()
            
            # 更新数据库
            self.db_session.commit()
            
            # 从活动订单中移除
            del self.active_orders[order_id]
            
            return True, "Order cancelled successfully"
            
        except Exception as e:
            self.logger.error(f"Error cancelling order: {str(e)}")
            self.db_session.rollback()
            return False, f"Error cancelling order: {str(e)}"

    async def _process_order_queue(self):
        """处理订单队列"""
        while True:
            try:
                order = await self.order_queue.get()
                
                # 检查订单是否仍然有效
                if order.status not in [OrderStatus.PENDING.value, OrderStatus.PARTIAL.value]:
                    continue
                
                # 获取当前市场价格
                current_price = self.market_data_service.price_cache.get(order.symbol)
                if not current_price:
                    continue
                
                # 执行订单
                start_time = datetime.utcnow()
                
                if order.order_type == OrderType.MARKET.value:
                    await self._execute_market_order(order, Decimal(str(current_price)))
                elif order.order_type == OrderType.LIMIT.value:
                    await self._execute_limit_order(order, Decimal(str(current_price)))
                elif order.order_type == OrderType.STOP.value:
                    await self._execute_stop_order(order, Decimal(str(current_price)))
                
                # 记录执行延迟
                execution_time = (datetime.utcnow() - start_time).total_seconds()
                self.execution_latency.append(execution_time)
                
            except Exception as e:
                self.logger.error(f"Error processing order: {str(e)}")
                await asyncio.sleep(0.1)

    async def _execute_market_order(self, order: Order, current_price: Decimal):
        """执行市价单"""
        try:
            # 检查滑点
            execution_price = self._calculate_execution_price(order, current_price)
            
            # 创建成交记录
            trade = Trade(
                order_id=order.order_id,
                symbol=order.symbol,
                side=order.side,
                quantity=order.quantity,
                price=execution_price,
                commission=self._calculate_commission(order.quantity, execution_price),
                executed_at=datetime.utcnow()
            )
            
            # 更新订单状态
            order.status = OrderStatus.FILLED.value
            order.executed_quantity = order.quantity
            order.average_price = execution_price
            order.updated_at = datetime.utcnow()
            
            # 更新持仓
            await self._update_position(order, trade)
            
            # 保存到数据库
            self.db_session.add(trade)
            self.db_session.commit()
            
            # 从活动订单中移除
            del self.active_orders[order.order_id]
            
        except Exception as e:
            self.logger.error(f"Error executing market order: {str(e)}")
            self.db_session.rollback()
            order.status = OrderStatus.REJECTED.value
            self.db_session.commit()

    async def _execute_limit_order(self, order: Order, current_price: Decimal):
        """执行限价单"""
        try:
            if order.side == OrderSide.BUY.value and current_price <= order.price:
                await self._execute_market_order(order, current_price)
            elif order.side == OrderSide.SELL.value and current_price >= order.price:
                await self._execute_market_order(order, current_price)
                
        except Exception as e:
            self.logger.error(f"Error executing limit order: {str(e)}")

    async def _execute_stop_order(self, order: Order, current_price: Decimal):
        """执行止损单"""
        try:
            if order.side == OrderSide.BUY.value and current_price >= order.stop_price:
                await self._execute_market_order(order, current_price)
            elif order.side == OrderSide.SELL.value and current_price <= order.stop_price:
                await self._execute_market_order(order, current_price)
                
        except Exception as e:
            self.logger.error(f"Error executing stop order: {str(e)}")

    async def _update_position(self, order: Order, trade: Trade):
        """更新持仓"""
        try:
            position = self.db_session.query(Position).filter(
                Position.user_id == order.user_id,
                Position.symbol == order.symbol
            ).first()
            
            if not position:
                position = Position(
                    user_id=order.user_id,
                    symbol=order.symbol,
                    quantity=Decimal('0'),
                    average_price=Decimal('0')
                )
                self.db_session.add(position)
            
            if order.side == OrderSide.BUY.value:
                new_quantity = position.quantity + trade.quantity
                new_cost = (position.quantity * position.average_price +
                           trade.quantity * trade.price)
                position.average_price = new_cost / new_quantity
                position.quantity = new_quantity
            else:
                position.quantity -= trade.quantity
                
            if position.quantity == 0:
                self.db_session.delete(position)
                
            self.db_session.commit()
            
        except Exception as e:
            self.logger.error(f"Error updating position: {str(e)}")
            raise

    def _validate_order(self, order_request: OrderRequest) -> bool:
        """验证订单"""
        try:
            # 检查数量
            if order_request.quantity < self.min_order_size:
                self.logger.warning(f"Order quantity {order_request.quantity} below minimum {self.min_order_size}")
                return False
                
            if order_request.quantity > self.max_order_size:
                self.logger.warning(f"Order quantity {order_request.quantity} above maximum {self.max_order_size}")
                return False
                
            # 检查价格
            if order_request.order_type in [OrderType.LIMIT, OrderType.STOP_LIMIT]:
                if not order_request.price or order_request.price <= 0:
                    self.logger.warning("Invalid price for limit order")
                    return False
                    
            # 检查止损价
            if order_request.order_type in [OrderType.STOP, OrderType.STOP_LIMIT]:
                if not order_request.stop_price or order_request.stop_price <= 0:
                    self.logger.warning("Invalid stop price for stop order")
                    return False
                    
            return True
            
        except Exception as e:
            self.logger.error(f"Error validating order: {str(e)}")
            return False

    async def _check_risk_limits(self, order_request: OrderRequest) -> bool:
        """检查风险限制"""
        try:
            # 获取当前持仓
            position = self.db_session.query(Position).filter(
                Position.user_id == order_request.user_id,
                Position.symbol == order_request.symbol
            ).first()
            
            # 检查风险限制
            risk_check = await self.risk_service.check_order_risk(
                order_request, position
            )
            
            if not risk_check['passed']:
                self.logger.warning(f"Risk check failed: {risk_check['reason']}")
                return False
                
            return True
            
        except Exception as e:
            self.logger.error(f"Error checking risk limits: {str(e)}")
            return False

    def _calculate_execution_price(self, order: Order, current_price: Decimal) -> Decimal:
        """计算执行价格（考虑滑点）"""
        if order.side == OrderSide.BUY.value:
            return current_price * (1 + self.max_slippage)
        else:
            return current_price * (1 - self.max_slippage)

    def _calculate_commission(self, quantity: Decimal, price: Decimal) -> Decimal:
        """计算手续费"""
        commission_rate = Decimal(self.config.get('trading.commission_rate', '0.001'))
        return quantity * price * commission_rate

    async def _handle_price_update(self, symbol: str, price: float):
        """处理价格更新"""
        # 检查限价单和止损单
        for order in list(self.active_orders.values()):
            if order.symbol != symbol:
                continue
                
            current_price = Decimal(str(price))
            
            if order.order_type == OrderType.LIMIT.value:
                await self._execute_limit_order(order, current_price)
            elif order.order_type == OrderType.STOP.value:
                await self._execute_stop_order(order, current_price) 
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from sqlalchemy.orm import Session
from models.database import Position, Order, Trade, RiskLimit, RiskAlert
from services.market_data_service import MarketDataService
from config.config_manager import ConfigManager

@dataclass
class RiskMetrics:
    position_value: Decimal
    leverage: Decimal
    margin_ratio: Decimal
    unrealized_pnl: Decimal
    daily_pnl: Decimal
    var_95: Decimal
    max_drawdown: Decimal
    concentration_ratio: Decimal
    volatility: Decimal

class RiskControlService:
    def __init__(
        self,
        market_data_service: MarketDataService,
        config: ConfigManager,
        db_session: Session
    ):
        self.market_data_service = market_data_service
        self.config = config
        self.db_session = db_session
        self.logger = logging.getLogger(__name__)
        
        # 风险限制配置
        self.max_position_value = Decimal(config.get('risk.max_position_value', '1000000'))
        self.max_leverage = Decimal(config.get('risk.max_leverage', '3'))
        self.min_margin_ratio = Decimal(config.get('risk.min_margin_ratio', '0.1'))
        self.max_concentration = Decimal(config.get('risk.max_concentration', '0.3'))
        self.max_daily_loss = Decimal(config.get('risk.max_daily_loss', '50000'))
        
        # 风险监控状态
        self.risk_alerts: List[RiskAlert] = []
        self.position_cache: Dict[str, Position] = {}
        self.last_check_time: datetime = datetime.now()

    async def start_monitoring(self):
        """启动风险监控"""
        try:
            # 注册市场数据回调
            self.market_data_service.register_price_callback(self._handle_price_update)
            
            # 加载风险限制
            self._load_risk_limits()
            
            # 初始化持仓缓存
            self._init_position_cache()
            
            self.logger.info("Risk monitoring started successfully")
            
        except Exception as e:
            self.logger.error(f"Error starting risk monitoring: {str(e)}")
            raise

    async def check_order_risk(
        self,
        order: Order,
        position: Optional[Position]
    ) -> Dict:
        """检查订单风险"""
        try:
            current_price = Decimal(str(
                self.market_data_service.price_cache.get(order.symbol, 0)
            ))
            
            if current_price == 0:
                return {
                    'passed': False,
                    'reason': 'No price data available'
                }
            
            # 计算订单价值
            order_value = order.quantity * current_price
            
            # 检查持仓限制
            if position:
                new_position_value = (
                    position.quantity + 
                    (order.quantity if order.side == 'BUY' else -order.quantity)
                ) * current_price
                
                if abs(new_position_value) > self.max_position_value:
                    return {
                        'passed': False,
                        'reason': 'Position value limit exceeded'
                    }
            
            # 检查杠杆率
            account_equity = self._calculate_account_equity(order.user_id)
            if order_value / account_equity > self.max_leverage:
                return {
                    'passed': False,
                    'reason': 'Leverage limit exceeded'
                }
            
            # 检查集中度
            total_position_value = self._calculate_total_position_value(order.user_id)
            if order_value / (total_position_value + order_value) > self.max_concentration:
                return {
                    'passed': False,
                    'reason': 'Concentration limit exceeded'
                }
            
            return {'passed': True}
            
        except Exception as e:
            self.logger.error(f"Error checking order risk: {str(e)}")
            return {
                'passed': False,
                'reason': f'Risk check error: {str(e)}'
            }

    async def calculate_risk_metrics(self, user_id: int) -> RiskMetrics:
        """计算风险指标"""
        try:
            # 获取用户持仓
            positions = self.db_session.query(Position).filter(
                Position.user_id == user_id
            ).all()
            
            # 计算持仓价值
            position_value = Decimal('0')
            unrealized_pnl = Decimal('0')
            
            for position in positions:
                current_price = Decimal(str(
                    self.market_data_service.price_cache.get(position.symbol, 0)
                ))
                if current_price > 0:
                    position_value += abs(position.quantity * current_price)
                    unrealized_pnl += (
                        current_price - position.average_price
                    ) * position.quantity
            
            # 计算账户权益
            account_equity = self._calculate_account_equity(user_id)
            
            # 计算杠杆率
            leverage = position_value / account_equity if account_equity > 0 else Decimal('0')
            
            # 计算保证金率
            margin_ratio = account_equity / position_value if position_value > 0 else Decimal('1')
            
            # 计算日内盈亏
            daily_pnl = self._calculate_daily_pnl(user_id)
            
            # 计算VaR
            var_95 = self._calculate_var(user_id)
            
            # 计算最大回撤
            max_drawdown = self._calculate_max_drawdown(user_id)
            
            # 计算集中度
            concentration_ratio = (
                max(p.quantity * Decimal(str(
                    self.market_data_service.price_cache.get(p.symbol, 0)
                )) for p in positions) / position_value
                if position_value > 0 else Decimal('0')
            )
            
            # 计算波动率
            volatility = self._calculate_volatility(user_id)
            
            return RiskMetrics(
                position_value=position_value,
                leverage=leverage,
                margin_ratio=margin_ratio,
                unrealized_pnl=unrealized_pnl,
                daily_pnl=daily_pnl,
                var_95=var_95,
                max_drawdown=max_drawdown,
                concentration_ratio=concentration_ratio,
                volatility=volatility
            )
            
        except Exception as e:
            self.logger.error(f"Error calculating risk metrics: {str(e)}")
            raise

    def _calculate_account_equity(self, user_id: int) -> Decimal:
        """计算账户权益"""
        try:
            # 获取初始资金
            initial_capital = Decimal(self.config.get(f'user.{user_id}.initial_capital', '0'))
            
            # 获取已实现盈亏
            realized_pnl = self._calculate_realized_pnl(user_id)
            
            # 获取未实现盈亏
            unrealized_pnl = Decimal('0')
            positions = self.db_session.query(Position).filter(
                Position.user_id == user_id
            ).all()
            
            for position in positions:
                current_price = Decimal(str(
                    self.market_data_service.price_cache.get(position.symbol, 0)
                ))
                if current_price > 0:
                    unrealized_pnl += (
                        current_price - position.average_price
                    ) * position.quantity
            
            return initial_capital + realized_pnl + unrealized_pnl
            
        except Exception as e:
            self.logger.error(f"Error calculating account equity: {str(e)}")
            raise

    def _calculate_realized_pnl(self, user_id: int) -> Decimal:
        """计算已实现盈亏"""
        try:
            trades = self.db_session.query(Trade).join(
                Order, Trade.order_id == Order.order_id
            ).filter(
                Order.user_id == user_id
            ).all()
            
            realized_pnl = Decimal('0')
            for trade in trades:
                if trade.side == 'SELL':
                    realized_pnl += trade.quantity * (
                        trade.price - trade.average_cost
                    ) - trade.commission
                
            return realized_pnl
            
        except Exception as e:
            self.logger.error(f"Error calculating realized PnL: {str(e)}")
            raise

    def _calculate_var(self, user_id: int, confidence: float = 0.95) -> Decimal:
        """计算风险价值(VaR)"""
        try:
            # 获取历史收益率数据
            returns = self._get_historical_returns(user_id)
            
            if len(returns) < 2:
                return Decimal('0')
            
            # 计算参数VaR
            var = np.percentile(returns, (1 - confidence) * 100)
            
            return Decimal(str(abs(var)))
            
        except Exception as e:
            self.logger.error(f"Error calculating VaR: {str(e)}")
            return Decimal('0')

    def _calculate_max_drawdown(self, user_id: int) -> Decimal:
        """计算最大回撤"""
        try:
            # 获取权益曲线
            equity_curve = self._get_equity_curve(user_id)
            
            if len(equity_curve) < 2:
                return Decimal('0')
            
            # 计算回撤
            rolling_max = pd.Series(equity_curve).expanding().max()
            drawdowns = pd.Series(equity_curve) / rolling_max - 1
            
            return Decimal(str(abs(drawdowns.min())))
            
        except Exception as e:
            self.logger.error(f"Error calculating max drawdown: {str(e)}")
            return Decimal('0')

    def _calculate_volatility(self, user_id: int, window: int = 20) -> Decimal:
        """计算波动率"""
        try:
            # 获取历史收益率数据
            returns = self._get_historical_returns(user_id)
            
            if len(returns) < window:
                return Decimal('0')
            
            # 计算波动率
            volatility = np.std(returns[-window:]) * np.sqrt(252)
            
            return Decimal(str(volatility))
            
        except Exception as e:
            self.logger.error(f"Error calculating volatility: {str(e)}")
            return Decimal('0')

    async def _handle_price_update(self, symbol: str, price: float):
        """处理价格更新"""
        try:
            # 检查是否需要进行风险检查
            current_time = datetime.now()
            if (current_time - self.last_check_time).seconds < self.config.get(
                'risk.check_interval', 60
            ):
                return
            
            self.last_check_time = current_time
            
            # 更新持仓缓存
            self._update_position_cache()
            
            # 检查风险限制
            await self._check_risk_limits()
            
        except Exception as e:
            self.logger.error(f"Error handling price update: {str(e)}")

    def _generate_risk_alert(
        self,
        alert_type: str,
        severity: str,
        message: str,
        user_id: int
    ):
        """生成风险警报"""
        try:
            alert = RiskAlert(
                user_id=user_id,
                alert_type=alert_type,
                severity=severity,
                message=message,
                created_at=datetime.now()
            )
            
            self.db_session.add(alert)
            self.db_session.commit()
            
            self.risk_alerts.append(alert)
            
            # 触发警报通知
            self._trigger_alert_notification(alert)
            
        except Exception as e:
            self.logger.error(f"Error generating risk alert: {str(e)}")
            self.db_session.rollback()

    def _trigger_alert_notification(self, alert: RiskAlert):
        """触发警报通知"""
        # 这里可以集成通知服务
        self.logger.warning(
            f"Risk Alert: {alert.alert_type} - {alert.severity} - {alert.message}"
        ) 
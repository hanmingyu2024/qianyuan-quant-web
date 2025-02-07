from abc import ABC, abstractmethod
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime
import logging
from dataclasses import dataclass

@dataclass
class Position:
    symbol: str
    quantity: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
    realized_pnl: float
    timestamp: datetime

@dataclass
class Trade:
    symbol: str
    side: str  # 'BUY' or 'SELL'
    quantity: float
    price: float
    timestamp: datetime
    trade_id: str
    commission: float
    pnl: Optional[float] = None

class BacktestResult:
    def __init__(self):
        self.trades: List[Trade] = []
        self.positions: List[Position] = []
        self.equity_curve: List[float] = []
        self.drawdown_curve: List[float] = []
        self.returns: List[float] = []
        self.metrics: Dict = {}

class BaseStrategy(ABC):
    def __init__(self, 
                 initial_capital: float = 100000.0,
                 commission_rate: float = 0.001):
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.commission_rate = commission_rate
        self.positions: Dict[str, Position] = {}
        self.trades: List[Trade] = []
        self.equity_curve: List[float] = []
        self.logger = logging.getLogger(self.__class__.__name__)

    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """生成交易信号"""
        pass

    def run_backtest(self, data: pd.DataFrame) -> BacktestResult:
        """运行回测"""
        try:
            # 生成交易信号
            signals = self.generate_signals(data)
            result = BacktestResult()
            
            # 遍历每个时间点
            for timestamp, row in signals.iterrows():
                # 更新持仓价格
                self._update_positions(row)
                
                # 处理交易信号
                if row.get('signal') == 'BUY':
                    self._execute_buy(row, timestamp)
                elif row.get('signal') == 'SELL':
                    self._execute_sell(row, timestamp)
                
                # 记录权益
                equity = self._calculate_equity()
                self.equity_curve.append(equity)
                
                # 计算回撤
                result.drawdown_curve.append(
                    self._calculate_drawdown(self.equity_curve)
                )
                
                # 计算收益率
                if len(self.equity_curve) > 1:
                    returns = (equity - self.equity_curve[-2]) / self.equity_curve[-2]
                    result.returns.append(returns)

            # 计算回测指标
            result.metrics = self._calculate_metrics()
            result.trades = self.trades
            result.equity_curve = self.equity_curve
            
            return result

        except Exception as e:
            self.logger.error(f"Backtest error: {str(e)}")
            raise

    def _execute_buy(self, data: pd.Series, timestamp: datetime):
        """执行买入操作"""
        symbol = data.name
        price = data['close']
        
        # 计算可买数量
        available_capital = self.current_capital * 0.95  # 保留5%作为缓冲
        quantity = available_capital / price
        
        # 计算手续费
        commission = price * quantity * self.commission_rate
        
        # 更新资金
        total_cost = price * quantity + commission
        if total_cost <= self.current_capital:
            self.current_capital -= total_cost
            
            # 记录交易
            trade = Trade(
                symbol=symbol,
                side='BUY',
                quantity=quantity,
                price=price,
                timestamp=timestamp,
                trade_id=f"T{len(self.trades)+1}",
                commission=commission
            )
            self.trades.append(trade)
            
            # 更新持仓
            if symbol in self.positions:
                pos = self.positions[symbol]
                new_quantity = pos.quantity + quantity
                new_entry_price = (pos.entry_price * pos.quantity + price * quantity) / new_quantity
                pos.quantity = new_quantity
                pos.entry_price = new_entry_price
            else:
                self.positions[symbol] = Position(
                    symbol=symbol,
                    quantity=quantity,
                    entry_price=price,
                    current_price=price,
                    unrealized_pnl=0.0,
                    realized_pnl=0.0,
                    timestamp=timestamp
                )

    def _execute_sell(self, data: pd.Series, timestamp: datetime):
        """执行卖出操作"""
        symbol = data.name
        if symbol not in self.positions:
            return
            
        position = self.positions[symbol]
        price = data['close']
        quantity = position.quantity
        
        # 计算手续费
        commission = price * quantity * self.commission_rate
        
        # 计算收益
        pnl = (price - position.entry_price) * quantity - commission
        
        # 更新资金
        self.current_capital += price * quantity - commission
        
        # 记录交易
        trade = Trade(
            symbol=symbol,
            side='SELL',
            quantity=quantity,
            price=price,
            timestamp=timestamp,
            trade_id=f"T{len(self.trades)+1}",
            commission=commission,
            pnl=pnl
        )
        self.trades.append(trade)
        
        # 清除持仓
        del self.positions[symbol]

    def _update_positions(self, data: pd.Series):
        """更新持仓状态"""
        symbol = data.name
        if symbol in self.positions:
            position = self.positions[symbol]
            position.current_price = data['close']
            position.unrealized_pnl = (
                position.current_price - position.entry_price
            ) * position.quantity

    def _calculate_equity(self) -> float:
        """计算当前权益"""
        position_value = sum(
            pos.quantity * pos.current_price 
            for pos in self.positions.values()
        )
        return self.current_capital + position_value

    def _calculate_drawdown(self, equity_curve: List[float]) -> float:
        """计算回撤"""
        peak = max(equity_curve)
        return (peak - equity_curve[-1]) / peak

    def _calculate_metrics(self) -> Dict:
        """计算回测指标"""
        returns = pd.Series(self.equity_curve).pct_change().dropna()
        
        winning_trades = [t for t in self.trades if t.pnl and t.pnl > 0]
        losing_trades = [t for t in self.trades if t.pnl and t.pnl < 0]
        
        return {
            'total_trades': len(self.trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': len(winning_trades) / len(self.trades) if self.trades else 0,
            'total_return': (self.equity_curve[-1] / self.initial_capital - 1),
            'sharpe_ratio': self._calculate_sharpe_ratio(returns),
            'max_drawdown': max(self.drawdown_curve) if self.drawdown_curve else 0,
            'profit_factor': self._calculate_profit_factor(winning_trades, losing_trades)
        }

    def _calculate_sharpe_ratio(self, returns: pd.Series) -> float:
        """计算夏普比率"""
        if returns.empty:
            return 0.0
        return np.sqrt(252) * returns.mean() / returns.std()

    def _calculate_profit_factor(
        self,
        winning_trades: List[Trade],
        losing_trades: List[Trade]
    ) -> float:
        """计算盈亏比"""
        total_profit = sum(t.pnl for t in winning_trades)
        total_loss = abs(sum(t.pnl for t in losing_trades))
        
        return total_profit / total_loss if total_loss != 0 else float('inf') 
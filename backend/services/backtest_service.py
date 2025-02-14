import pandas as pd
import numpy as np
from typing import Dict, List
from models.database import Strategy, MarketData
from strategy.base_strategy import BaseStrategy
from datetime import datetime

class BacktestResult:
    def __init__(self):
        self.trades: List[Dict] = []
        self.equity_curve: List[float] = []
        self.returns: List[float] = []
        self.positions: List[Dict] = []
        
    def calculate_metrics(self):
        """计算回测指标"""
        returns = pd.Series(self.returns)
        
        return {
            'total_return': float(returns.sum()),
            'annual_return': float(returns.mean() * 252),
            'sharpe_ratio': float(returns.mean() / returns.std() * np.sqrt(252)),
            'max_drawdown': float(self._calculate_max_drawdown()),
            'win_rate': self._calculate_win_rate(),
            'profit_factor': self._calculate_profit_factor()
        }
        
    def _calculate_max_drawdown(self) -> float:
        """计算最大回撤"""
        equity = pd.Series(self.equity_curve)
        rolling_max = equity.expanding().max()
        drawdowns = equity / rolling_max - 1.0
        return abs(float(drawdowns.min()))
        
    def _calculate_win_rate(self) -> float:
        """计算胜率"""
        if not self.trades:
            return 0.0
        winning_trades = sum(1 for trade in self.trades if trade['pnl'] > 0)
        return winning_trades / len(self.trades)
        
    def _calculate_profit_factor(self) -> float:
        """计算盈亏比"""
        gross_profit = sum(trade['pnl'] for trade in self.trades if trade['pnl'] > 0)
        gross_loss = abs(sum(trade['pnl'] for trade in self.trades if trade['pnl'] < 0))
        return gross_profit / gross_loss if gross_loss != 0 else float('inf')

class BacktestService:
    def __init__(self):
        self.result = BacktestResult()
        
    def run_backtest(
        self,
        strategy: BaseStrategy,
        start_date: datetime,
        end_date: datetime,
        initial_capital: float = 100000.0
    ) -> Dict:
        """运行回测"""
        # 获取历史数据
        historical_data = self._get_historical_data(
            strategy.symbol,
            start_date,
            end_date
        )
        
        # 初始化回测环境
        capital = initial_capital
        position = 0
        
        # 遍历历史数据
        for i in range(len(historical_data)):
            # 生成交易信号
            signals = strategy.generate_signals(historical_data.iloc[:i+1])
            
            if signals:
                latest_signal = signals[-1]
                # 计算仓位
                target_position = strategy.calculate_position_size(latest_signal)
                
                if target_position != position:
                    # 记录交易
                    trade = {
                        'timestamp': historical_data.index[i],
                        'type': 'BUY' if target_position > position else 'SELL',
                        'price': historical_data['close'].iloc[i],
                        'quantity': abs(target_position - position),
                        'pnl': 0.0  # 将在交易结束时计算
                    }
                    
                    # 更新仓位和资金
                    position = target_position
                    trade_value = trade['price'] * trade['quantity']
                    capital -= trade_value
                    
                    self.result.trades.append(trade)
            
            # 更新权益曲线
            market_value = position * historical_data['close'].iloc[i]
            equity = capital + market_value
            self.result.equity_curve.append(equity)
            
            # 计算收益率
            if i > 0:
                returns = (equity - self.result.equity_curve[-2]) / self.result.equity_curve[-2]
                self.result.returns.append(returns)
        
        # 计算回测指标
        metrics = self.result.calculate_metrics()
        
        return {
            'metrics': metrics,
            'equity_curve': self.result.equity_curve,
            'trades': self.result.trades
        }
    
    def _get_historical_data(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """获取历史数据"""
        # 从数据库获取历史数据
        data = MarketData.query.filter(
            MarketData.symbol == symbol,
            MarketData.timestamp.between(start_date, end_date)
        ).all()
        
        # 转换为DataFrame
        df = pd.DataFrame([{
            'timestamp': d.timestamp,
            'open': d.open,
            'high': d.high,
            'low': d.low,
            'close': d.close,
            'volume': d.volume
        } for d in data])
        
        return df.set_index('timestamp') 
from typing import List, Dict
import numpy as np
from datetime import datetime, timedelta
from models.database import Order, Position
from scipy import stats

class RiskService:
    def __init__(self):
        self.position_limits = {
            'BTC': 10.0,  # 比特币最大持仓限制
            'ETH': 100.0  # 以太坊最大持仓限制
        }
        self.max_drawdown_limit = 0.2  # 最大回撤限制
        self.var_confidence_level = 0.95  # VaR置信水平
        self.position_concentration_limit = 0.3  # 单一品种集中度限制

    def check_position_limits(self, positions: List[Position]) -> Dict:
        """检查持仓限制"""
        violations = []
        for position in positions:
            symbol = position.symbol.split('/')[0]  # 获取基础货币
            if symbol in self.position_limits:
                if abs(position.quantity) > self.position_limits[symbol]:
                    violations.append({
                        'symbol': position.symbol,
                        'current': abs(position.quantity),
                        'limit': self.position_limits[symbol],
                        'type': 'position_limit'
                    })
        
        return {
            'passed': len(violations) == 0,
            'violations': violations
        }

    def calculate_var(self, positions: List[Position], returns: List[float]) -> float:
        """计算风险价值(VaR)"""
        portfolio_value = sum(abs(p.quantity * p.current_price) for p in positions)
        if not portfolio_value or not returns:
            return 0.0

        # 使用历史模拟法计算VaR
        returns_array = np.array(returns)
        var = stats.norm.ppf(1 - self.var_confidence_level) * np.std(returns_array)
        return portfolio_value * abs(var)

    def check_drawdown(self, equity_curve: List[float]) -> Dict:
        """检查回撤"""
        if not equity_curve:
            return {'passed': True}

        peak = max(equity_curve)
        current = equity_curve[-1]
        drawdown = (peak - current) / peak

        return {
            'passed': drawdown <= self.max_drawdown_limit,
            'current_drawdown': drawdown,
            'limit': self.max_drawdown_limit
        }

    def check_concentration(self, positions: List[Position]) -> Dict:
        """检查持仓集中度"""
        total_value = sum(abs(p.quantity * p.current_price) for p in positions)
        if not total_value:
            return {'passed': True}

        violations = []
        for position in positions:
            position_value = abs(position.quantity * position.current_price)
            concentration = position_value / total_value
            if concentration > self.position_concentration_limit:
                violations.append({
                    'symbol': position.symbol,
                    'concentration': concentration,
                    'limit': self.position_concentration_limit
                })

        return {
            'passed': len(violations) == 0,
            'violations': violations
        }

    def check_correlation(self, positions: List[Position], returns_data: Dict[str, List[float]]) -> Dict:
        """检查持仓相关性"""
        if len(positions) < 2:
            return {'passed': True}

        correlations = {}
        symbols = [p.symbol for p in positions]
        
        for i in range(len(symbols)):
            for j in range(i + 1, len(symbols)):
                if symbols[i] in returns_data and symbols[j] in returns_data:
                    corr = np.corrcoef(
                        returns_data[symbols[i]],
                        returns_data[symbols[j]]
                    )[0, 1]
                    correlations[f"{symbols[i]}-{symbols[j]}"] = corr

        # 检查高相关性对
        high_correlations = {
            pair: corr for pair, corr in correlations.items()
            if abs(corr) > 0.8
        }

        return {
            'passed': len(high_correlations) == 0,
            'high_correlations': high_correlations
        }

    def perform_risk_check(
        self,
        positions: List[Position],
        equity_curve: List[float],
        returns_data: Dict[str, List[float]]
    ) -> Dict:
        """执行完整的风险检查"""
        position_check = self.check_position_limits(positions)
        drawdown_check = self.check_drawdown(equity_curve)
        concentration_check = self.check_concentration(positions)
        correlation_check = self.check_correlation(positions, returns_data)

        # 计算当前VaR
        portfolio_returns = []
        if returns_data:
            # 使用第一个品种的返回序列长度作为基准
            length = len(next(iter(returns_data.values())))
            for i in range(length):
                portfolio_return = sum(
                    returns_data[p.symbol][i] * p.quantity * p.current_price
                    for p in positions
                    if p.symbol in returns_data
                )
                portfolio_returns.append(portfolio_return)

        var = self.calculate_var(positions, portfolio_returns)

        return {
            'timestamp': datetime.now().isoformat(),
            'overall_status': all([
                position_check['passed'],
                drawdown_check['passed'],
                concentration_check['passed'],
                correlation_check['passed']
            ]),
            'position_check': position_check,
            'drawdown_check': drawdown_check,
            'concentration_check': concentration_check,
            'correlation_check': correlation_check,
            'var': var
        }

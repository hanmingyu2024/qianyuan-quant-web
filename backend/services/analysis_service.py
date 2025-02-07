import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple
import talib
from datetime import datetime, timedelta
import logging

class AnalysisService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def calculate_performance_metrics(
        self,
        trades: List[Dict],
        equity_curve: List[float]
    ) -> Dict:
        """计算性能指标"""
        try:
            df = pd.DataFrame(trades)
            equity_series = pd.Series(equity_curve)
            
            # 计算收益率
            returns = equity_series.pct_change().dropna()
            
            # 计算夏普比率
            risk_free_rate = 0.02  # 假设无风险利率为2%
            excess_returns = returns - risk_free_rate/252
            sharpe_ratio = np.sqrt(252) * excess_returns.mean() / excess_returns.std()
            
            # 计算最大回撤
            rolling_max = equity_series.expanding().max()
            drawdowns = equity_series / rolling_max - 1.0
            max_drawdown = drawdowns.min()
            
            # 计算其他指标
            metrics = {
                'total_trades': len(trades),
                'winning_trades': len(df[df['pnl'] > 0]),
                'losing_trades': len(df[df['pnl'] < 0]),
                'win_rate': len(df[df['pnl'] > 0]) / len(trades),
                'avg_profit': df[df['pnl'] > 0]['pnl'].mean(),
                'avg_loss': df[df['pnl'] < 0]['pnl'].mean(),
                'profit_factor': abs(df[df['pnl'] > 0]['pnl'].sum() / df[df['pnl'] < 0]['pnl'].sum()),
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': max_drawdown,
                'total_return': (equity_series.iloc[-1] / equity_series.iloc[0] - 1),
                'annual_return': (equity_series.iloc[-1] / equity_series.iloc[0]) ** (252/len(equity_series)) - 1
            }
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error calculating performance metrics: {str(e)}")
            raise

    def analyze_market_regime(
        self,
        price_data: pd.DataFrame,
        window: int = 20
    ) -> Dict:
        """分析市场状态"""
        try:
            df = price_data.copy()
            
            # 计算波动率
            df['returns'] = df['close'].pct_change()
            df['volatility'] = df['returns'].rolling(window).std() * np.sqrt(252)
            
            # 计算趋势强度
            df['ma20'] = df['close'].rolling(window).mean()
            df['ma50'] = df['close'].rolling(50).mean()
            df['trend_strength'] = abs(df['ma20'] - df['ma50']) / df['ma50']
            
            # 计算动量
            df['momentum'] = df['close'].pct_change(window)
            
            # 判断市场状态
            current_volatility = df['volatility'].iloc[-1]
            current_trend = df['trend_strength'].iloc[-1]
            current_momentum = df['momentum'].iloc[-1]
            
            regime = {
                'volatility': 'high' if current_volatility > df['volatility'].mean() else 'low',
                'trend': 'strong' if current_trend > df['trend_strength'].mean() else 'weak',
                'momentum': 'positive' if current_momentum > 0 else 'negative'
            }
            
            return {
                'regime': regime,
                'metrics': {
                    'volatility': current_volatility,
                    'trend_strength': current_trend,
                    'momentum': current_momentum
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing market regime: {str(e)}")
            raise

    def calculate_risk_metrics(
        self,
        positions: List[Dict],
        returns: pd.Series
    ) -> Dict:
        """计算风险指标"""
        try:
            # 计算投资组合价值
            portfolio_value = sum(p['quantity'] * p['current_price'] for p in positions)
            
            # 计算VaR
            var_95 = np.percentile(returns, 5) * portfolio_value
            var_99 = np.percentile(returns, 1) * portfolio_value
            
            # 计算ES (Expected Shortfall)
            es_95 = returns[returns <= np.percentile(returns, 5)].mean() * portfolio_value
            
            # 计算Beta (相对于市场)
            market_returns = pd.Series()  # 这里需要添加市场收益率数据
            beta = returns.cov(market_returns) / market_returns.var()
            
            return {
                'var_95': var_95,
                'var_99': var_99,
                'expected_shortfall_95': es_95,
                'beta': beta,
                'portfolio_value': portfolio_value
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating risk metrics: {str(e)}")
            raise

    def detect_anomalies(
        self,
        data: pd.DataFrame,
        window: int = 20,
        std_threshold: float = 3.0
    ) -> List[Dict]:
        """检测异常值"""
        try:
            anomalies = []
            
            # 计算移动平均和标准差
            rolling_mean = data['close'].rolling(window=window).mean()
            rolling_std = data['close'].rolling(window=window).std()
            
            # 计算z-score
            z_scores = (data['close'] - rolling_mean) / rolling_std
            
            # 检测异常值
            anomaly_dates = data.index[abs(z_scores) > std_threshold]
            
            for date in anomaly_dates:
                anomalies.append({
                    'timestamp': date,
                    'price': data.loc[date, 'close'],
                    'z_score': z_scores[date],
                    'type': 'spike' if z_scores[date] > 0 else 'drop'
                })
            
            return anomalies
            
        except Exception as e:
            self.logger.error(f"Error detecting anomalies: {str(e)}")
            raise

    def generate_signals(
        self,
        data: pd.DataFrame,
        strategy_type: str = 'momentum'
    ) -> List[Dict]:
        """生成交易信号"""
        try:
            signals = []
            df = data.copy()
            
            if strategy_type == 'momentum':
                # RSI信号
                df['rsi'] = talib.RSI(df['close'])
                df['rsi_signal'] = np.where(df['rsi'] < 30, 'BUY', 
                                          np.where(df['rsi'] > 70, 'SELL', 'HOLD'))
                
                # MACD信号
                macd, signal, hist = talib.MACD(df['close'])
                df['macd_signal'] = np.where(macd > signal, 'BUY', 
                                           np.where(macd < signal, 'SELL', 'HOLD'))
                
                # 合并信号
                for index, row in df.iterrows():
                    if row['rsi_signal'] == row['macd_signal'] and row['rsi_signal'] != 'HOLD':
                        signals.append({
                            'timestamp': index,
                            'price': row['close'],
                            'type': row['rsi_signal'],
                            'strength': 'strong'
                        })
            
            return signals
            
        except Exception as e:
            self.logger.error(f"Error generating signals: {str(e)}")
            raise 
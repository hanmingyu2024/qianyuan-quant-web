from typing import List, Optional
from datetime import datetime
import uuid
from app.db.mongodb import db
from app.models.backtest import BacktestConfig, BacktestResult
from app.services.strategy_service import strategy_service
from app.services.data_service import data_service
import pandas as pd
import numpy as np
from bson import ObjectId

class BacktestService:
    def __init__(self):
        self.collection = db.db.backtests

    async def create_backtest(self, config: BacktestConfig) -> BacktestResult:
        # 检查策略是否存在
        strategy = await strategy_service.get_strategy(config.strategy_id)
        if not strategy:
            raise ValueError("Strategy not found")

        backtest = BacktestResult(
            id=str(ObjectId()),
            strategy_id=config.strategy_id,
            config=config,
            status="pending",
            start_time=datetime.utcnow()
        )

        await self.collection.insert_one(backtest.dict())
        return backtest

    async def run_backtest(self, backtest_id: str):
        try:
            # 更新状态为运行中
            await self.collection.update_one(
                {"_id": ObjectId(backtest_id)},
                {"$set": {"status": "running"}}
            )

            # 获取回测配置
            backtest = await self.get_backtest(backtest_id)
            if not backtest:
                raise ValueError("Backtest not found")

            # 获取策略代码
            strategy = await strategy_service.get_strategy(backtest.strategy_id)
            if not strategy:
                raise ValueError("Strategy not found")

            # 获取历史数据
            data = await data_service.get_historical_data(
                symbol=backtest.config.symbol,
                start_time=backtest.config.start_time,
                end_time=backtest.config.end_time,
                timeframe=backtest.config.timeframe
            )

            # 创建回测环境
            backtest_env = {
                "data": data,
                "capital": backtest.config.initial_capital,
                "position": 0,
                "trades": [],
                "equity_curve": []
            }

            # 编译并执行策略代码
            strategy_code = compile(strategy.code, f"strategy_{strategy.id}", "exec")
            strategy_globals = {
                "__builtins__": __builtins__,
                "np": np,
                "pd": pd,
                "backtest_env": backtest_env
            }
            exec(strategy_code, strategy_globals)

            # 运行回测
            strategy_instance = strategy_globals.get("Strategy")()
            results = strategy_instance.run(backtest_env)

            # 计算回测指标
            metrics = self._calculate_metrics(results)

            # 更新回测结果
            await self.collection.update_one(
                {"_id": ObjectId(backtest_id)},
                {
                    "$set": {
                        "status": "completed",
                        "end_time": datetime.utcnow(),
                        "metrics": metrics,
                        "trades": results["trades"],
                        "equity_curve": results["equity_curve"]
                    }
                }
            )

        except Exception as e:
            # 更新失败状态
            await self.collection.update_one(
                {"_id": ObjectId(backtest_id)},
                {
                    "$set": {
                        "status": "failed",
                        "end_time": datetime.utcnow(),
                        "error_message": str(e)
                    }
                }
            )

    def _calculate_metrics(self, results: dict) -> dict:
        """计算回测指标"""
        trades = results["trades"]
        equity_curve = results["equity_curve"]

        if not trades:
            return {}

        # 计算基本指标
        total_trades = len(trades)
        profitable_trades = sum(1 for t in trades if t["pnl"] > 0)
        win_rate = profitable_trades / total_trades if total_trades > 0 else 0

        # 计算收益指标
        total_pnl = sum(t["pnl"] for t in trades)
        max_drawdown = self._calculate_max_drawdown(equity_curve)
        sharpe_ratio = self._calculate_sharpe_ratio(equity_curve)

        return {
            "total_trades": total_trades,
            "profitable_trades": profitable_trades,
            "win_rate": win_rate,
            "total_pnl": total_pnl,
            "max_drawdown": max_drawdown,
            "sharpe_ratio": sharpe_ratio
        }

    def _calculate_max_drawdown(self, equity_curve: List[dict]) -> float:
        """计算最大回撤"""
        if not equity_curve:
            return 0.0
        
        equity_values = [p["equity"] for p in equity_curve]
        peak = equity_values[0]
        max_dd = 0.0

        for value in equity_values:
            if value > peak:
                peak = value
            dd = (peak - value) / peak
            if dd > max_dd:
                max_dd = dd

        return max_dd

    def _calculate_sharpe_ratio(self, equity_curve: List[dict]) -> float:
        """计算夏普比率"""
        if len(equity_curve) < 2:
            return 0.0

        equity_values = [p["equity"] for p in equity_curve]
        returns = np.diff(equity_values) / equity_values[:-1]
        
        if len(returns) == 0:
            return 0.0

        return np.mean(returns) / np.std(returns) if np.std(returns) != 0 else 0.0

backtest_service = BacktestService() 
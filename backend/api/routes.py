import os
import sys

# 获取项目根目录的绝对路径（假设项目根目录为 routes.py 的上上级目录）
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import User, Strategy, Order, MarketData
from services.trading_service import TradingService
from services.strategy_service import StrategyService
import logging
from datetime import datetime, timedelta
from pydantic import BaseModel, ValidationError
from typing import Any, Dict, Optional, List
from fastapi import APIRouter, Depends, HTTPException
from services.auth_service import get_current_user

# 初始化蓝图和服务对象
api = Blueprint('api', __name__)
trading_service = TradingService()
strategy_service = StrategyService()

# 配置日志记录（这里假设全局已配置 logger）
logger = logging.getLogger(__name__)

# 定义标准化返回方法
def success_response(data=None, message="success", code=200):
    return jsonify({"code": code, "message": message, "data": data}), code

def error_response(message="error", code=400, data=None):
    return jsonify({"code": code, "message": message, "data": data}), code

# -----------------------------
# Pydantic 数据模型定义
# -----------------------------

class CreateStrategyInput(BaseModel):
    name: str
    symbol: str
    parameters: Dict[str, Any]

class CreateOrderInput(BaseModel):
    symbol: str
    side: str
    type: str  # 订单类型
    quantity: float
    price: Optional[float] = None

class RunBacktestInput(BaseModel):
    start_date: str
    end_date: str
    initial_capital: Optional[float] = 100000

# -----------------------------
# API 路由定义
# -----------------------------

@api.route('/market/klines', methods=['GET'])
@jwt_required()
def get_klines():
    """
    获取K线数据
    参数从query string中传入：
      - symbol：交易对（必填）
      - interval：时间间隔，默认为'1m'
      - start_time：开始时间
      - end_time：结束时间
    """
    symbol = request.args.get('symbol')
    if not symbol:
        return error_response("缺少必要参数: symbol", 400)
    interval = request.args.get('interval', '1m')
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    
    try:
        klines = trading_service.get_klines(
            symbol=symbol,
            interval=interval,
            start_time=start_time,
            end_time=end_time
        )
        return success_response(data=klines, message="K线数据获取成功")
    except Exception as e:
        logger.exception("获取K线数据时发生错误")
        return error_response(str(e), 400)

@api.route('/strategies', methods=['POST'])
@jwt_required()
def create_strategy():
    """
    创建新策略
    请求体 (JSON) 示例：
    {
        "name": "策略名称",
        "symbol": "交易对",
        "parameters": {
            "param1": "value1",
            "param2": "value2"
        }
    }
    """
    user_id = get_jwt_identity()
    try:
        json_data = request.get_json()
        input_data = CreateStrategyInput(**json_data)
    except ValidationError as ve:
        return error_response(f"参数错误: {ve.errors()}", 400)
    except Exception as e:
        logger.exception("解析请求数据时出错")
        return error_response("无效的请求数据", 400)
    
    try:
        strategy = strategy_service.create_strategy(
            user_id=user_id,
            name=input_data.name,
            symbol=input_data.symbol,
            parameters=input_data.parameters
        )
        return success_response(data={'strategy_id': strategy.id}, message="策略创建成功", code=201)
    except Exception as e:
        logger.exception("创建策略时发生错误")
        return error_response(str(e), 400)

@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """
    创建订单
    请求体 (JSON) 示例：
    {
        "symbol": "交易对",
        "side": "买/卖",
        "type": "订单类型",
        "quantity": 100,
        "price": 10.5  // 可选字段
    }
    """
    user_id = get_jwt_identity()
    try:
        json_data = request.get_json()
        input_data = CreateOrderInput(**json_data)
    except ValidationError as ve:
        return error_response(f"参数错误: {ve.errors()}", 400)
    except Exception as e:
        logger.exception("解析订单请求数据时出错")
        return error_response("无效的请求数据", 400)
    
    try:
        order = trading_service.create_order(
            user_id=user_id,
            symbol=input_data.symbol,
            side=input_data.side,
            order_type=input_data.type,
            quantity=input_data.quantity,
            price=input_data.price
        )
        return success_response(data=order.to_dict(), message="订单创建成功", code=201)
    except Exception as e:
        logger.exception("创建订单时发生错误")
        return error_response(str(e), 400)

@api.route('/portfolio/summary', methods=['GET'])
@jwt_required()
def get_portfolio_summary():
    """
    获取投资组合摘要
    """
    user_id = get_jwt_identity()
    try:
        summary = trading_service.get_portfolio_summary(user_id)
        return success_response(data=summary, message="投资组合摘要获取成功")
    except Exception as e:
        logger.exception("获取投资组合摘要时发生错误")
        return error_response(str(e), 400)

@api.route('/strategies/<int:strategy_id>/backtest', methods=['POST'])
@jwt_required()
def run_backtest(strategy_id):
    """
    运行回测
    请求体 (JSON) 示例：
    {
        "start_date": "2022-01-01",
        "end_date": "2022-06-01",
        "initial_capital": 100000  // 可选字段，默认为100000
    }
    """
    try:
        json_data = request.get_json()
        input_data = RunBacktestInput(**json_data)
    except ValidationError as ve:
        return error_response(f"参数错误: {ve.errors()}", 400)
    except Exception as e:
        logger.exception("解析回测请求数据时出错")
        return error_response("无效的请求数据", 400)
    
    try:
        results = strategy_service.run_backtest(
            strategy_id=strategy_id,
            start_date=input_data.start_date,
            end_date=input_data.end_date,
            initial_capital=input_data.initial_capital
        )
        return success_response(data=results, message="回测成功")
    except Exception as e:
        logger.exception("运行回测时发生错误")
        return error_response(str(e), 400)

router = APIRouter()

@router.post("/strategies/")
async def create_strategy(
    strategy_data: dict,
    current_user: User = Depends(get_current_user)
):
    """创建新策略"""
    pass

@router.get("/strategies/")
async def list_strategies(
    current_user: User = Depends(get_current_user)
):
    """获取用户的所有策略"""
    pass

@router.post("/trades/execute")
async def execute_trade(
    trade_data: dict,
    current_user: User = Depends(get_current_user)
):
    """执行交易"""
    pass

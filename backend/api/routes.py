import os
import sys
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError, Field
from typing import Any, Dict, Optional, List
from backend.services.trading_service import TradingService
from backend.services.strategy_service import StrategyService
from backend.api.auth import get_current_user
from backend.models.database import User, Strategy, Order, MarketData
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.services.market_data_service import MarketDataService
from backend.config.config_manager import ConfigManager  # 导入配置管理器

# 获取项目根目录的绝对路径并添加到 sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 初始化蓝图和服务对象
api = Blueprint('api', __name__)
trading_service = TradingService()
strategy_service = StrategyService()

# 创建配置实例
config = ConfigManager()

# 创建服务实例时传入配置
market_data_service = MarketDataService(config)

# 配置日志记录
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

class LoginRequest(BaseModel):
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")
    
    class Config:
        schema_extra = {
            "example": {
                "username": "test_user",
                "password": "test_password"
            }
        }

class StrategyCreate(BaseModel):
    name: str = Field(..., description="策略名称")
    symbol: str = Field(..., description="交易品种代码")
    parameters: dict = Field(..., description="策略参数")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "双均线策略",
                "symbol": "rb9999",
                "parameters": {
                    "fast_period": 5,
                    "slow_period": 20
                }
            }
        }

# -----------------------------
# API 路由定义
# -----------------------------

@api.route('/market/klines', methods=['GET'])
def get_klines():
    """ 获取K线数据 """
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
def create_strategy():
    """ 创建新策略 """
    user_id = get_current_user().id
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
def create_order():
    """ 创建订单 """
    user_id = get_current_user().id
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
def get_portfolio_summary():
    """ 获取投资组合摘要 """
    user_id = get_current_user().id
    try:
        summary = trading_service.get_portfolio_summary(user_id)
        return success_response(data=summary, message="投资组合摘要获取成功")
    except Exception as e:
        logger.exception("获取投资组合摘要时发生错误")
        return error_response(str(e), 400)

@api.route('/strategies/<int:strategy_id>/backtest', methods=['POST'])
def run_backtest(strategy_id):
    """ 运行回测 """
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

router = APIRouter(
    prefix="/api",
    tags=["交易接口"]
)

@router.post("/auth/token",
    summary="用户登录",
    description="获取访问令牌",
    tags=["认证接口"]
)
async def login(request: LoginRequest):
    """
    用户登录接口
    
    返回:
    - access_token: 访问令牌
    - token_type: 令牌类型
    """
    return {"access_token": "示例token", "token_type": "bearer"}

@router.post("/market/subscribe",
    summary="订阅行情",
    description="订阅指定合约的实时行情数据",
    tags=["行情接口"]
)
async def subscribe_market_data(
    symbols: List[str] = Query(..., description="合约代码列表，例如：['rb9999']"),
    market_type: str = Query("cn_stocks", description="市场类型：cn_stocks(股票)、cn_futures(期货)")
):
    """订阅市场数据"""
    try:
        await market_data_service.subscribe(symbols, market_type)
        return {
            "code": 200,
            "message": "订阅成功",
            "data": {
                "symbols": symbols,
                "market_type": market_type
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/strategies",
    summary="获取策略列表",
    description="获取当前用户的所有交易策略",
    tags=["策略接口"]
)
async def list_strategies():
    """获取策略列表"""
    return {
        "code": 200,
        "message": "获取成功",
        "data": [
            {
                "id": 1,
                "name": "双均线策略",
                "symbol": "rb9999",
                "status": "running"
            }
        ]
    }

@router.post("/strategies",
    summary="创建策略",
    description="创建新的交易策略",
    tags=["策略接口"]
)
async def create_strategy(strategy: StrategyCreate):
    """创建新策略"""
    return {
        "code": 200,
        "message": "创建成功",
        "data": {
            "strategy_id": 1
        }
    }

@router.post("/trades/execute",
    summary="执行交易",
    description="执行交易操作",
    tags=["交易接口"]
)
async def execute_trade(
    symbol: str = Query(..., description="交易品种代码"),
    direction: str = Query(..., description="交易方向：buy/sell"),
    volume: float = Query(..., description="交易数量"),
    price: Optional[float] = Query(None, description="交易价格，市价单可不填")
):
    """执行交易"""
    return {
        "code": 200,
        "message": "下单成功",
        "data": {
            "order_id": "123456"
        }
    }


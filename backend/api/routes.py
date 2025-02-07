from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import User, Strategy, Order, MarketData
from services.trading_service import TradingService
from services.strategy_service import StrategyService
from datetime import datetime, timedelta

api = Blueprint('api', __name__)
trading_service = TradingService()
strategy_service = StrategyService()

@api.route('/market/klines', methods=['GET'])
@jwt_required()
def get_klines():
    """获取K线数据"""
    symbol = request.args.get('symbol')
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
        return jsonify({'data': klines})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api.route('/strategies', methods=['POST'])
@jwt_required()
def create_strategy():
    """创建新策略"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        strategy = strategy_service.create_strategy(
            user_id=user_id,
            name=data['name'],
            symbol=data['symbol'],
            parameters=data['parameters']
        )
        return jsonify({'strategy_id': strategy.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """创建订单"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        order = trading_service.create_order(
            user_id=user_id,
            symbol=data['symbol'],
            side=data['side'],
            order_type=data['type'],
            quantity=data['quantity'],
            price=data.get('price')
        )
        return jsonify(order.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api.route('/portfolio/summary', methods=['GET'])
@jwt_required()
def get_portfolio_summary():
    """获取投资组合摘要"""
    user_id = get_jwt_identity()
    
    try:
        summary = trading_service.get_portfolio_summary(user_id)
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api.route('/strategies/<int:strategy_id>/backtest', methods=['POST'])
@jwt_required()
def run_backtest(strategy_id):
    """运行回测"""
    data = request.get_json()
    
    try:
        results = strategy_service.run_backtest(
            strategy_id=strategy_id,
            start_date=data['start_date'],
            end_date=data['end_date'],
            initial_capital=data.get('initial_capital', 100000)
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 400 
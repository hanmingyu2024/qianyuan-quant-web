# backend/api/strategies.py

from flask import Blueprint, request, jsonify

strategy_blueprint = Blueprint('strategies', __name__)

# 示例策略创建
@strategy_blueprint.route('/create', methods=['POST'])
def create_strategy():
    strategy_data = request.json
    # 在此处理策略创建的业务逻辑
    return jsonify({"message": "Strategy created successfully!"}), 201

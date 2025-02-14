# backend/api/users.py

from flask import Blueprint, jsonify

user_blueprint = Blueprint('users', __name__)

@user_blueprint.route('/list', methods=['GET'])
def get_users():
    users = [{"id": 1, "username": "admin"}]  # 示例数据
    return jsonify(users)

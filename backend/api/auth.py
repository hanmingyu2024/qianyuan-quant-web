# backend/api/auth.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/login', methods=['POST'])
def login():
    """用户登录"""
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    
    if username == 'admin' and password == 'admin':
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    else:
        return jsonify({"msg": "Bad username or password"}), 401

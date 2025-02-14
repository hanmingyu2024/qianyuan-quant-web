from flask import Blueprint, request, jsonify
from jwt import encode, decode
from datetime import datetime, timedelta

auth_blueprint = Blueprint('auth', __name__)

class AuthManager:
    @staticmethod
    def generate_token(user_id):
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }
        return encode(payload, 'secret_key', algorithm='HS256')

    @staticmethod
    def verify_token(token):
        try:
            payload = decode(token, 'secret_key', algorithms=['HS256'])
            return payload['user_id']
        except:
            return None

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # 验证用户凭据
    # 生成令牌
    token = AuthManager.generate_token(data['user_id'])
    return jsonify({'token': token}) 
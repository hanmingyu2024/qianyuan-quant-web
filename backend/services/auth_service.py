from datetime import datetime, timedelta
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import User
from sqlalchemy.orm import Session
from typing import Optional, Dict
import logging

class AuthService:
    def __init__(self, db_session: Session, secret_key: str):
        self.db_session = db_session
        self.secret_key = secret_key
        self.logger = logging.getLogger(__name__)
        self.token_expiry = timedelta(days=1)

    def register_user(self, username: str, email: str, password: str) -> Dict:
        """注册新用户"""
        try:
            # 检查用户是否已存在
            if self.db_session.query(User).filter(
                (User.username == username) | (User.email == email)
            ).first():
                raise ValueError("Username or email already exists")

            # 创建新用户
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
                api_key=self._generate_api_key()
            )
            
            self.db_session.add(user)
            self.db_session.commit()

            # 生成访问令牌
            token = self._generate_token(user.id)
            
            return {
                'user_id': user.id,
                'token': token,
                'api_key': user.api_key
            }

        except Exception as e:
            self.db_session.rollback()
            self.logger.error(f"Error registering user: {str(e)}")
            raise

    def authenticate(self, username: str, password: str) -> Optional[Dict]:
        """用户认证"""
        try:
            user = self.db_session.query(User).filter(User.username == username).first()
            
            if user and check_password_hash(user.password_hash, password):
                token = self._generate_token(user.id)
                return {
                    'user_id': user.id,
                    'token': token,
                    'api_key': user.api_key
                }
            return None

        except Exception as e:
            self.logger.error(f"Error authenticating user: {str(e)}")
            raise

    def verify_token(self, token: str) -> Optional[int]:
        """验证令牌"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload.get('user_id')
        except jwt.ExpiredSignatureError:
            self.logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError:
            self.logger.warning("Invalid token")
            return None

    def verify_api_key(self, api_key: str) -> Optional[int]:
        """验证API密钥"""
        try:
            user = self.db_session.query(User).filter(User.api_key == api_key).first()
            return user.id if user else None
        except Exception as e:
            self.logger.error(f"Error verifying API key: {str(e)}")
            return None

    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """修改密码"""
        try:
            user = self.db_session.query(User).filter(User.id == user_id).first()
            
            if user and check_password_hash(user.password_hash, old_password):
                user.password_hash = generate_password_hash(new_password)
                self.db_session.commit()
                return True
            return False

        except Exception as e:
            self.db_session.rollback()
            self.logger.error(f"Error changing password: {str(e)}")
            raise

    def reset_api_key(self, user_id: int) -> Optional[str]:
        """重置API密钥"""
        try:
            user = self.db_session.query(User).filter(User.id == user_id).first()
            if user:
                user.api_key = self._generate_api_key()
                self.db_session.commit()
                return user.api_key
            return None

        except Exception as e:
            self.db_session.rollback()
            self.logger.error(f"Error resetting API key: {str(e)}")
            raise

    def _generate_token(self, user_id: int) -> str:
        """生成JWT令牌"""
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + self.token_expiry
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')

    def _generate_api_key(self) -> str:
        """生成API密钥"""
        import secrets
        return secrets.token_hex(32) 
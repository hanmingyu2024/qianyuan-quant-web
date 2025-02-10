from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置"""
    market_data: dict = {
        'api_key': 'test_key',
        'ws_url': 'ws://api.vvtr.com/v1/connect',
        'api_url': 'http://api.vvtr.com/v1'
    }
    
    risk_control: dict = {
        'max_position': 100,
        'max_order_value': 1000000
    }
    
    redis_host: str = "localhost"
    redis_port: int = 6379
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    """获取应用配置单例"""
    return Settings() 
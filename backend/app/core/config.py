from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Quant Strategy Platform"
    
    # 数据库配置
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "quant_strategy"
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # 策略运行配置
    MAX_RUNNING_STRATEGIES: int = 10
    STRATEGY_TIMEOUT: int = 300  # 5 minutes
    
    # 数据服务配置
    SUPPORTED_EXCHANGES: List[str] = [
        "binance",
        "okex",
        "huobi"
    ]
    
    # 数据缓存配置
    DATA_CACHE_DAYS: int = 30
    CACHE_UPDATE_INTERVAL: int = 3600  # 1小时
    
    class Config:
        case_sensitive = True

settings = Settings() 
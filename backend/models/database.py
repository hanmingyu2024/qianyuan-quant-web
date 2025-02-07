from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class OrderStatus(enum.Enum):
    PENDING = "PENDING"
    FILLED = "FILLED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128))
    api_key = Column(String(64), unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联
    strategies = relationship("Strategy", back_populates="user")
    orders = relationship("Order", back_populates="user")

class Strategy(Base):
    __tablename__ = 'strategies'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500))
    user_id = Column(Integer, ForeignKey('users.id'))
    status = Column(String(20), default='INACTIVE')
    parameters = Column(String(1000))  # JSON格式存储策略参数
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # 关联
    user = relationship("User", back_populates="strategies")
    orders = relationship("Order", back_populates="strategy")

class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    strategy_id = Column(Integer, ForeignKey('strategies.id'))
    symbol = Column(String(20), nullable=False)
    order_type = Column(String(20), nullable=False)
    side = Column(String(4), nullable=False)  # BUY/SELL
    quantity = Column(Float, nullable=False)
    price = Column(Float)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    filled_quantity = Column(Float, default=0)
    average_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # 关联
    user = relationship("User", back_populates="orders")
    strategy = relationship("Strategy", back_populates="orders")

class MarketData(Base):
    __tablename__ = 'market_data'
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(20), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    
    __table_args__ = (
        # 创建复合索引
        Index('idx_symbol_timestamp', 'symbol', 'timestamp'),
    )

def init_db(engine):
    """初始化数据库"""
    Base.metadata.create_all(engine)

def drop_db(engine):
    """删除所有表"""
    Base.metadata.drop_all(engine) 
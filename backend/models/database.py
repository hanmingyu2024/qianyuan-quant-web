from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Numeric, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from datetime import datetime

# 创建数据库引擎
SQLALCHEMY_DATABASE_URL = "sqlite:///./quant.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    strategies = relationship("Strategy", back_populates="user")
    orders = relationship("Order", back_populates="user")
    trades = relationship("Trade", back_populates="user")
    positions = relationship("Position", back_populates="user")

class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)
    parameters = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="strategies")

class Trade(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    order_id = Column(Integer, ForeignKey("orders.id"))
    symbol = Column(String)
    side = Column(String)  # BUY, SELL
    quantity = Column(Numeric(precision=18, scale=8))
    price = Column(Numeric(precision=18, scale=8))
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="trades")
    order = relationship("Order", back_populates="trades")

class Position(Base):
    __tablename__ = "positions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String)
    quantity = Column(Numeric(precision=18, scale=8))
    avg_price = Column(Numeric(precision=18, scale=8))
    last_update = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="positions")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    strategy_id = Column(Integer, ForeignKey("strategies.id"))
    symbol = Column(String)
    order_type = Column(String)  # MARKET, LIMIT
    side = Column(String)  # BUY, SELL
    quantity = Column(Numeric(precision=18, scale=8))
    price = Column(Numeric(precision=18, scale=8))
    status = Column(String)  # PENDING, FILLED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)
    filled_price = Column(Numeric(precision=18, scale=8))
    filled_time = Column(DateTime)
    user = relationship("User", back_populates="orders")
    trades = relationship("Trade", back_populates="order")

class MarketData(Base):
    __tablename__ = "market_data"
    id = Column(Integer, primary_key=True)
    symbol = Column(String)
    timestamp = Column(DateTime)
    open = Column(Numeric(precision=18, scale=8))
    high = Column(Numeric(precision=18, scale=8))
    low = Column(Numeric(precision=18, scale=8))
    close = Column(Numeric(precision=18, scale=8))
    volume = Column(Numeric(precision=18, scale=8))

class RiskLimit(Base):
    __tablename__ = "risk_limits"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String)
    max_position = Column(Numeric(precision=18, scale=8))
    max_order_amount = Column(Numeric(precision=18, scale=8))
    max_daily_loss = Column(Numeric(precision=18, scale=8))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", backref="risk_limits")

class RiskAlert(Base):
    __tablename__ = "risk_alerts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    alert_type = Column(String)  # POSITION_LIMIT, ORDER_AMOUNT, DAILY_LOSS
    symbol = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    user = relationship("User", backref="risk_alerts")
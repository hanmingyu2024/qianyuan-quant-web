from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
import asyncio
import aio_pika
import json

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    FILLED = "FILLED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"

class Order(BaseModel):
    order_id: str
    symbol: str
    order_type: OrderType
    side: str
    quantity: float
    price: Optional[float]
    status: OrderStatus = OrderStatus.PENDING

app = FastAPI()

class OrderExecutionService:
    def __init__(self):
        self.orders = {}
        self.connection = None
        self.channel = None

    async def connect_broker(self):
        self.connection = await aio_pika.connect_robust("amqp://guest:guest@rabbitmq/")
        self.channel = await self.connection.channel()
        
        # 声明订单队列
        await self.channel.declare_queue("orders", durable=True)
        
    async def execute_order(self, order: Order):
        # 模拟订单执行逻辑
        if order.order_type == OrderType.MARKET:
            order.status = OrderStatus.FILLED
        else:
            order.status = OrderStatus.PENDING
            
        # 发送订单到消息队列
        await self.channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(order.dict()).encode(),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key="orders"
        )
        
        self.orders[order.order_id] = order
        return order

order_service = OrderExecutionService()

@app.on_event("startup")
async def startup_event():
    await order_service.connect_broker()

@app.post("/orders")
async def create_order(order: Order):
    return await order_service.execute_order(order)

@app.get("/orders/{order_id}")
async def get_order(order_id: str):
    if order_id not in order_service.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_service.orders[order_id] 
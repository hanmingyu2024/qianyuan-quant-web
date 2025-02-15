from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import strategy, backtest, data, risk
from app.db.mongodb import db
from app.services.data_service import data_service
from apscheduler.schedulers.asyncio import AsyncIOScheduler

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 创建定时任务调度器
scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    # 连接数据库
    await db.connect_to_database()
    
    # 初始化交易所连接
    await data_service.init_exchanges()
    
    # 添加定时清理缓存任务
    scheduler.add_job(
        data_service.clean_old_cache,
        'interval',
        hours=24,
        id='clean_cache'
    )
    
    # 启动调度器
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    # 关闭数据库连接
    await db.close_database_connection()
    
    # 关闭调度器
    scheduler.shutdown()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(strategy.router, prefix=settings.API_V1_STR)
app.include_router(backtest.router, prefix=settings.API_V1_STR)
app.include_router(data.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to Quant Strategy Platform"}
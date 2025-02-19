from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.auth import router as auth_router
from backend.api.routes import router as api_router
from backend.services.market_data_service import MarketDataService
from backend.services.execution_engine import ExecutionEngine
from backend.services.risk_control_service import RiskControlService
from backend.config.config_manager import ConfigManager

app = FastAPI(title="乾元量化交易系统")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 加载配置
config = ConfigManager()

# 初始化服务
market_data_service = MarketDataService(config)
risk_service = RiskControlService(market_data_service, config)
execution_engine = ExecutionEngine(market_data_service, risk_service, config)

# 注册路由
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(api_router, prefix="/api/v1", tags=["api"])

@app.on_event("startup")
async def startup():
    await market_data_service.start()
    await risk_service.start_monitoring()
    await execution_engine.start()

@app.get("/")
async def root():
    return {"message": "乾元量化交易系统API"} 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import api_blueprint

# 添加中文标题和描述
app = FastAPI(
    title="乾元量化交易系统",
    description="""
    乾元量化交易系统API接口文档
    
    ## 功能特点
    - 实时行情订阅
    - 策略管理
    - 自动交易执行
    - 风险控制
    
    ## 使用说明
    1. 首先通过登录接口获取token
    2. 使用token访问其他接口
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 使用 FastAPI 内置的方法注册路由
app.include_router(
    api_blueprint,
    prefix="/api",
    tags=["API接口"]
)

@app.get("/", 
    summary="系统首页",
    description="返回系统欢迎信息",
    tags=["默认接口"]
)
async def read_root():
    return {"message": "欢迎使用乾元量化交易系统"}

@app.post("/api/market/subscribe")
async def subscribe_market_data(request: SubscribeRequest):
    """订阅市场数据"""
    try:
        result = await market_service.subscribe(
            symbols=request.symbols,
            market_type=request.market_type
        )
        return {
            "code": 200,
            "data": {"subscribed": result},
            "message": "订阅成功"
        }
    except Exception as e:
        return {
            "code": 500,
            "message": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)


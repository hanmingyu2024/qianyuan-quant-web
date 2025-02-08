from fastapi import FastAPI
from backend.api import api_blueprint

# 添加中文标题和描述
app = FastAPI(
    title="乾元量化交易系统",
    description="乾元量化交易系统API接口文档",
    version="1.0.0"
)

# 使用 FastAPI 内置的方法注册路由
app.include_router(api_blueprint, prefix='/api')

@app.get("/", summary="根路径", description="返回系统欢迎信息")
async def read_root():
    return {"message": "欢迎使用乾元量化交易系统"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)


from fastapi import FastAPI
from backend.api import api_blueprint

app = FastAPI()

# 使用 FastAPI 内置的方法注册路由
app.include_router(api_blueprint, prefix='/api')

@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)


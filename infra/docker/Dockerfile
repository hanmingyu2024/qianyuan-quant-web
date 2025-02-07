# 使用 Python 官方镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install -r requirements.txt

# 复制应用代码
COPY . .

# 设置环境变量
ENV FLASK_APP=app.py

# 启动 Flask 应用
CMD ["flask", "run", "--host=0.0.0.0"]

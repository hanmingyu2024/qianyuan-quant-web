#!/bin/bash

# 启动数据库和Redis
docker-compose up -d postgres redis

# 等待数据库就绪
sleep 5

# 运行数据库迁移
alembic upgrade head

# 启动后端服务
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 
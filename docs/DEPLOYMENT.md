# 项目部署

## 环境要求
- Python 3.8+
- Docker（可选）
- 依赖包：通过 `requirements.txt` 安装
- 数据库：使用 PostgreSQL/MySQL 或本地 SQLite 数据库

## 部署步骤

### 1. 克隆代码库
首先，从 GitHub 克隆代码库到本地：

```bash
git clone https://github.com/hanmingyu2024/qianyuan-quant-web.git
cd qianyuan-quant-web
```

### 2. 配置 `.env` 文件
在项目根目录下创建一个 `.env` 文件，并配置相应的环境变量：

```bash
# .env 文件示例

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=username
DB_PASSWORD=password
DB_NAME=qianyuan_db

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# MetaTrader5 配置
MT5_ACCOUNT=123456
MT5_PASSWORD=password
MT5_SERVER=your_mt5_server

# SMTP 配置
SMTP_SERVER=smtp.example.com
SMTP_PORT=465
SMTP_USERNAME=your_email@example.com
SMTP_PASSWORD=your_email_password

# JWT 密钥配置
SECRET_KEY=your_secret_key
```

确保 `.env` 文件中包含所需的配置，以便正确连接到数据库、Redis 和其他服务。

### 3. 安装依赖
安装项目所需的 Python 依赖包：

```bash
pip install -r requirements.txt
```

### 4. 使用 Docker 启动项目（可选）
如果您希望使用 Docker 来部署项目，可以通过 Docker Compose 启动项目。确保您已经安装了 Docker 和 Docker Compose。

在项目根目录下，运行以下命令来启动所有服务：

```bash
docker-compose up -d
```

此命令将会：

- 构建并启动 Docker 容器。
- 后端服务、数据库和缓存等服务将在容器中启动。

### 5. 数据库迁移
如果您使用数据库（如 PostgreSQL 或 MySQL），在首次部署时，需要执行数据库迁移。可以使用以下命令进行数据库迁移：

```bash
python manage.py migrate
```

### 6. 访问应用
部署完成后，您可以通过浏览器访问应用程序：

```bash
http://localhost:5000
```

此时，应用程序将通过 Flask 提供的端口 `5000` 对外提供服务。

### 7. 配置反向代理（可选）
如果您需要将应用暴露到公网，建议使用 Nginx 或 Apache 配置反向代理以提供更好的性能和安全性。

示例 Nginx 配置：

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8. 项目日志
项目的日志文件将默认保存在 `logs/` 目录下，您可以根据需要查看日志输出：

```bash
tail -f logs/application.log
```

---

## 常见问题解决

- **问题**: `数据库连接失败`  
  **解决方案**: 请检查 `.env` 文件中数据库配置是否正确，确保数据库服务正在运行。

- **问题**: `容器无法启动`  
  **解决方案**: 请检查 Docker Compose 配置文件 (`docker-compose.yml`) 中的服务设置，确保相关服务（如数据库、Redis 等）能够正确连接。

- **问题**: `应用崩溃`  
  **解决方案**: 查看日志文件中的错误信息，以定位问题根源，可能是由于配置错误或缺少依赖项。
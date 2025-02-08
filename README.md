## **快速开始**

### **1. 克隆仓库**

首先，克隆该项目到本地：

```bash
git clone https://github.com/hanmingyu2024/qianyuan-quant-web.git
cd qianyuan-quant-enterprise
```

### **2. 创建并激活虚拟环境**

建议在项目中使用 Python 的虚拟环境来隔离项目的依赖。以下是创建和激活虚拟环境的步骤：

**Windows:**

```bash
python -m venv .venv
.venv\Scripts\activate
```

**Linux/macOS:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### **3. 安装依赖**

安装项目所需的所有依赖项：

```bash
pip install -r requirements.txt
```

### **4. 配置环境变量**

在项目根目录下，创建一个 `.env` 文件，包含以下环境变量配置：

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_NAME=yourdatabase
REDIS_HOST=localhost
REDIS_PORT=6379
SECRET_KEY=your_secret_key
```

确保根据你的本地或生产环境修改这些配置。

### **5. 数据库迁移**

项目使用 PostgreSQL 作为数据库，使用 `alembic` 进行数据库迁移。你可以运行以下命令来执行数据库迁移：

```bash
alembic upgrade head
```

如果你没有安装 `alembic`，可以通过以下命令安装：

```bash
pip install alembic
```

### **6. 启动应用**

使用以下命令启动 FastAPI 后端应用：

```bash
uvicorn backend.app:app --reload
```

应用将启动在 `http://127.0.0.1:8000`，你可以在浏览器中访问它。

### **7. 启动WebSocket服务**

如果项目中包含 WebSocket 服务，可以使用以下命令启动 WebSocket 服务（如果有相关脚本）：

```bash
python backend/services/websocket_service.py
```

### **8. 访问接口文档**

FastAPI 提供自动生成的 API 文档，你可以在浏览器中访问以下 URL：

- [Swagger UI](http://127.0.0.1:8000/docs)
- [ReDoc UI](http://127.0.0.1:8000/redoc)

### **9. 监控与分析**

- **Prometheus**：监控和度量数据通过 Prometheus 进行收集。
- **Grafana**：你可以在 Grafana 中查看项目的监控仪表板。

确保你已根据项目中的 `prometheus.yml` 配置 Prometheus 和 Grafana。

---

## **系统架构图**

(可以根据你的项目架构提供具体图示)

---

## **常见问题**

### **1. 数据库连接问题**

如果遇到数据库连接错误，请确保数据库配置在 `.env` 文件中正确设置，并且数据库已经启动。

### **2. 依赖安装问题**

如果安装依赖项时遇到问题，确保你使用的是正确的 Python 版本，并且已激活虚拟环境。

### **3. WebSocket 服务未启动**

请确保你启动了 WebSocket 服务，检查相关配置文件和服务启动脚本。
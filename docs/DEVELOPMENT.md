# 开发指南

## 本地开发环境

### 1. 克隆代码库
首先，从 GitHub 克隆项目代码到本地：

```bash
git clone https://github.com/hanmingyu2024/qianyuan-quant-web.git
cd qianyuan-quant-web
```

### 2. 安装依赖
安装项目所需的依赖包。可以通过以下命令安装所有依赖：

```bash
pip install -r requirements.txt
```

### 3. 运行 Flask 开发服务器
在本地开发环境中启动 Flask 开发服务器：

```bash
flask run
```

这将在本地启动 Flask 服务，默认监听 `http://localhost:5000`。

### 4. 访问应用
运行服务器后，可以通过浏览器访问应用：

```bash
http://localhost:5000
```

这将打开本地运行的应用程序，您可以开始进行开发和调试。

---

## API 测试

### 使用 Postman 进行 API 测试
1. 下载并安装 [Postman](https://www.postman.com/)。
2. 在 Postman 中创建新的请求。
3. 设置请求类型（如 `GET`、`POST`）和 API 地址。
4. 在请求头中添加 `Authorization`，并提供有效的 token（如果需要认证）。

---

## 开发流程

### 1. 添加新功能
- 在 `backend` 目录中添加新的模块。
- 通过 Flask 蓝图进行路由配置。
- 使用 Pydantic 验证请求数据。
  
### 2. 运行单元测试
确保开发过程中编写了单元测试，并使用 pytest 运行测试：

```bash
pytest
```

### 3. 提交代码
开发完成后，确保代码符合规范，并通过 Git 提交：

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

### 4. 代码审查
进行代码审查以确保代码质量，修复任何可能存在的 bug。

---

## 代码结构

- **backend/**: 后端服务的代码，包括 API 路由、数据处理逻辑、数据库模型等。
- **frontend/**: 前端代码（如适用），提供与用户交互的界面。
- **docker/**: Docker 配置文件，用于容器化部署。
- **tests/**: 单元测试和集成测试文件。

---

## 常见问题解决

- **问题**: `flask run` 命令无法启动服务器  
  **解决方案**: 确保已安装 Flask，并且项目结构正确。可以检查 Flask 是否已经安装：`pip show flask`。
  
- **问题**: API 请求返回 500 错误  
  **解决方案**: 查看后台日志文件，确认错误原因。可能是由于数据库连接失败或请求数据格式不正确。

- **问题**: Docker 容器无法启动  
  **解决方案**: 检查 `docker-compose.yml` 配置文件，确保所有服务都配置正确，并且没有端口冲突。
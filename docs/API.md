# 乾元量化交易系统 API 文档

## 基础信息
- 基础URL: `http://api.qianyuan-quant.com/v1`
- 所有请求需要在header中包含 `Authorization` token
- API 返回格式统一为 JSON

## 认证相关

### 用户注册
POST `/auth/register`

#### 请求体
```json
{
  "username": "string",   // 用户名，必填
  "email": "string",      // 用户邮箱，必填
  "password": "string",   // 用户密码，必填
  "confirm_password": "string" // 确认密码，必填，需与密码相同
}
```

#### 返回示例
**成功响应**:
```json
{
  "status": "success",
  "message": "注册成功",
  "data": {
    "user_id": 123,
    "username": "example_user",
    "email": "example@example.com"
  }
}
```

**失败响应**:
```json
{
  "status": "error",
  "message": "邮箱已被注册"
}
```

### 用户登录
POST `/auth/login`

#### 请求体
```json
{
  "email": "string",   // 用户邮箱，必填
  "password": "string" // 用户密码，必填
}
```

#### 返回示例
**成功响应**:
```json
{
  "status": "success",
  "message": "登录成功",
  "data": {
    "access_token": "string", // 访问令牌
    "token_type": "bearer"
  }
}
```

**失败响应**:
```json
{
  "status": "error",
  "message": "用户名或密码错误"
}
```

## 数据接口

### 获取市场数据
GET `/api/market`

#### 请求参数
- `symbol` (可选): 查询的市场符号，如 `BTCUSD`，`ETHUSD` 等

#### 返回示例
**成功响应**:
```json
{
  "status": "success",
  "data": {
    "symbol": "BTCUSD",
    "price": 40000,
    "volume": 5000,
    "timestamp": "2025-02-10T12:00:00Z"
  }
}
```

**失败响应**:
```json
{
  "status": "error",
  "message": "未找到市场数据"
}


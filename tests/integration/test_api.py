import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def test_market_data_subscription():
    """测试市场数据订阅API"""
    response = client.post(
        "/api/market/subscribe",
        json={
            "symbols": ["rb9999"],
            "market_type": "cn_futures"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200

def test_strategy_creation():
    """测试策略创建API"""
    response = client.post(
        "/api/strategies",
        json={
            "name": "双均线策略",
            "symbol": "rb9999",
            "parameters": {
                "fast_period": 5,
                "slow_period": 20
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "strategy_id" in data["data"]
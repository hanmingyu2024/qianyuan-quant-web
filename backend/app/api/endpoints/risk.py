from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.risk import RiskRule, RiskAlert, PositionRisk
from app.services.risk_service import risk_service

router = APIRouter()

@router.get("/risk/rules", response_model=List[RiskRule])
async def get_risk_rules():
    """获取所有风险规则"""
    return await risk_service.get_risk_rules()

@router.post("/risk/rules", response_model=RiskRule)
async def create_risk_rule(rule: RiskRule):
    """创建新的风险规则"""
    return await risk_service.create_risk_rule(rule)

@router.put("/risk/rules/{rule_id}", response_model=RiskRule)
async def update_risk_rule(rule_id: str, rule: RiskRule):
    """更新风险规则"""
    updated = await risk_service.update_risk_rule(rule_id, rule)
    if not updated:
        raise HTTPException(status_code=404, detail="Risk rule not found")
    return updated

@router.get("/risk/alerts", response_model=List[RiskAlert])
async def get_risk_alerts(
    acknowledged: bool = False,
    limit: int = 50
):
    """获取风险警报"""
    return await risk_service.get_risk_alerts(acknowledged, limit)

@router.post("/risk/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """确认风险警报"""
    success = await risk_service.acknowledge_alert(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "success"}

@router.get("/risk/positions", response_model=List[PositionRisk])
async def get_position_risks():
    """获取所有持仓的风险状况"""
    return await risk_service.get_position_risks()

@router.post("/risk/check")
async def check_risks():
    """手动触发风险检查"""
    await risk_service.check_risks()
    return {"status": "success"} 
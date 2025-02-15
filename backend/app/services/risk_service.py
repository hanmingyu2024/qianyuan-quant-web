from typing import List, Optional
from datetime import datetime
import asyncio
from app.db.mongodb import db
from app.models.risk import RiskRule, RiskAlert, PositionRisk, RiskLevel
from app.services.strategy_service import strategy_service
from bson import ObjectId

class RiskService:
    def __init__(self):
        self.rules_collection = db.db.risk_rules
        self.alerts_collection = db.db.risk_alerts
        self.positions_collection = db.db.positions

    async def get_risk_rules(self) -> List[RiskRule]:
        """获取所有风险规则"""
        rules = await self.rules_collection.find().to_list(length=None)
        return [RiskRule(**rule) for rule in rules]

    async def create_risk_rule(self, rule: RiskRule) -> RiskRule:
        """创建新的风险规则"""
        rule_dict = rule.dict()
        rule_dict["_id"] = ObjectId()
        rule_dict["created_at"] = datetime.utcnow()
        rule_dict["updated_at"] = datetime.utcnow()
        
        await self.rules_collection.insert_one(rule_dict)
        return rule

    async def update_risk_rule(self, rule_id: str, rule: RiskRule) -> Optional[RiskRule]:
        """更新风险规则"""
        rule_dict = rule.dict()
        rule_dict["updated_at"] = datetime.utcnow()
        
        result = await self.rules_collection.update_one(
            {"_id": ObjectId(rule_id)},
            {"$set": rule_dict}
        )
        
        if result.modified_count:
            return rule
        return None

    async def create_alert(self, rule_id: str, level: RiskLevel, message: str, strategy_id: Optional[str] = None):
        """创建风险警报"""
        alert = RiskAlert(
            id=str(ObjectId()),
            rule_id=rule_id,
            strategy_id=strategy_id,
            level=level,
            message=message,
            created_at=datetime.utcnow()
        )
        
        await self.alerts_collection.insert_one(alert.dict())
        return alert

    async def acknowledge_alert(self, alert_id: str) -> bool:
        """确认风险警报"""
        result = await self.alerts_collection.update_one(
            {"_id": ObjectId(alert_id)},
            {
                "$set": {
                    "acknowledged": True,
                    "acknowledged_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def get_position_risks(self) -> List[PositionRisk]:
        """获取所有持仓的风险状况"""
        positions = await self.positions_collection.find().to_list(length=None)
        return [await self._calculate_position_risk(pos) for pos in positions]

    async def _calculate_position_risk(self, position: dict) -> PositionRisk:
        """计算单个持仓的风险状况"""
        # 计算未实现盈亏
        unrealized_pnl = (position["current_price"] - position["entry_price"]) * position["size"]
        
        # 计算回撤
        max_price = max(position["entry_price"], position["current_price"])
        drawdown = (max_price - position["current_price"]) / max_price
        
        # 计算风险等级
        risk_level = self._determine_risk_level(position, drawdown)
        
        return PositionRisk(
            symbol=position["symbol"],
            position_size=position["size"],
            entry_price=position["entry_price"],
            current_price=position["current_price"],
            unrealized_pnl=unrealized_pnl,
            risk_level=risk_level,
            margin_ratio=position.get("margin_ratio", 0),
            liquidation_price=position.get("liquidation_price"),
            max_drawdown=drawdown
        )

    def _determine_risk_level(self, position: dict, drawdown: float) -> RiskLevel:
        """确定风险等级"""
        if drawdown >= 0.5:
            return RiskLevel.EXTREME
        elif drawdown >= 0.3:
            return RiskLevel.HIGH
        elif drawdown >= 0.1:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW

    async def check_risks(self):
        """检查所有风险规则"""
        rules = await self.get_risk_rules()
        positions = await self.get_position_risks()
        
        for rule in rules:
            if not rule.enabled:
                continue
                
            for position in positions:
                await self._check_position_risk(rule, position)

    async def _check_position_risk(self, rule: RiskRule, position: PositionRisk):
        """检查单个持仓的风险"""
        if rule.type == "position":
            if abs(position.position_size) > rule.threshold:
                await self._handle_risk_violation(rule, position)
        
        elif rule.type == "drawdown":
            if position.max_drawdown > rule.threshold:
                await self._handle_risk_violation(rule, position)

    async def _handle_risk_violation(self, rule: RiskRule, position: PositionRisk):
        """处理风险违规"""
        # 创建警报
        await self.create_alert(
            rule_id=rule.id,
            level=position.risk_level,
            message=f"Risk rule '{rule.name}' violated for {position.symbol}"
        )
        
        # 执行风险控制动作
        if rule.action == "close_position":
            await strategy_service.close_position(position.symbol)
        elif rule.action == "stop_strategy":
            # TODO: 实现停止策略的逻辑
            pass

risk_service = RiskService()from typing import List, Optional
from datetime import datetime
import asyncio
from app.db.mongodb import db
from app.models.risk import RiskRule, RiskAlert, PositionRisk, RiskLevel
from app.services.strategy_service import strategy_service
from bson import ObjectId

class RiskService:
    def __init__(self):
        self.rules_collection = db.db.risk_rules
        self.alerts_collection = db.db.risk_alerts
        self.positions_collection = db.db.positions

    async def get_risk_rules(self) -> List[RiskRule]:
        """获取所有风险规则"""
        rules = await self.rules_collection.find().to_list(length=None)
        return [RiskRule(**rule) for rule in rules]

    async def create_risk_rule(self, rule: RiskRule) -> RiskRule:
        """创建新的风险规则"""
        rule_dict = rule.dict()
        rule_dict["_id"] = ObjectId()
        rule_dict["created_at"] = datetime.utcnow()
        rule_dict["updated_at"] = datetime.utcnow()
        
        await self.rules_collection.insert_one(rule_dict)
        return rule

    async def update_risk_rule(self, rule_id: str, rule: RiskRule) -> Optional[RiskRule]:
        """更新风险规则"""
        rule_dict = rule.dict()
        rule_dict["updated_at"] = datetime.utcnow()
        
        result = await self.rules_collection.update_one(
            {"_id": ObjectId(rule_id)},
            {"$set": rule_dict}
        )
        
        if result.modified_count:
            return rule
        return None

    async def create_alert(self, rule_id: str, level: RiskLevel, message: str, strategy_id: Optional[str] = None):
        """创建风险警报"""
        alert = RiskAlert(
            id=str(ObjectId()),
            rule_id=rule_id,
            strategy_id=strategy_id,
            level=level,
            message=message,
            created_at=datetime.utcnow()
        )
        
        await self.alerts_collection.insert_one(alert.dict())
        return alert

    async def acknowledge_alert(self, alert_id: str) -> bool:
        """确认风险警报"""
        result = await self.alerts_collection.update_one(
            {"_id": ObjectId(alert_id)},
            {
                "$set": {
                    "acknowledged": True,
                    "acknowledged_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def get_position_risks(self) -> List[PositionRisk]:
        """获取所有持仓的风险状况"""
        positions = await self.positions_collection.find().to_list(length=None)
        return [await self._calculate_position_risk(pos) for pos in positions]

    async def _calculate_position_risk(self, position: dict) -> PositionRisk:
        """计算单个持仓的风险状况"""
        # 计算未实现盈亏
        unrealized_pnl = (position["current_price"] - position["entry_price"]) * position["size"]
        
        # 计算回撤
        max_price = max(position["entry_price"], position["current_price"])
        drawdown = (max_price - position["current_price"]) / max_price
        
        # 计算风险等级
        risk_level = self._determine_risk_level(position, drawdown)
        
        return PositionRisk(
            symbol=position["symbol"],
            position_size=position["size"],
            entry_price=position["entry_price"],
            current_price=position["current_price"],
            unrealized_pnl=unrealized_pnl,
            risk_level=risk_level,
            margin_ratio=position.get("margin_ratio", 0),
            liquidation_price=position.get("liquidation_price"),
            max_drawdown=drawdown
        )

    def _determine_risk_level(self, position: dict, drawdown: float) -> RiskLevel:
        """确定风险等级"""
        if drawdown >= 0.5:
            return RiskLevel.EXTREME
        elif drawdown >= 0.3:
            return RiskLevel.HIGH
        elif drawdown >= 0.1:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW

    async def check_risks(self):
        """检查所有风险规则"""
        rules = await self.get_risk_rules()
        positions = await self.get_position_risks()
        
        for rule in rules:
            if not rule.enabled:
                continue
                
            for position in positions:
                await self._check_position_risk(rule, position)

    async def _check_position_risk(self, rule: RiskRule, position: PositionRisk):
        """检查单个持仓的风险"""
        if rule.type == "position":
            if abs(position.position_size) > rule.threshold:
                await self._handle_risk_violation(rule, position)
        
        elif rule.type == "drawdown":
            if position.max_drawdown > rule.threshold:
                await self._handle_risk_violation(rule, position)

    async def _handle_risk_violation(self, rule: RiskRule, position: PositionRisk):
        """处理风险违规"""
        # 创建警报
        await self.create_alert(
            rule_id=rule.id,
            level=position.risk_level,
            message=f"Risk rule '{rule.name}' violated for {position.symbol}"
        )
        
        # 执行风险控制动作
        if rule.action == "close_position":
            await strategy_service.close_position(position.symbol)
        elif rule.action == "stop_strategy":
            # TODO: 实现停止策略的逻辑
            pass

risk_service = RiskService()
from typing import Optional
from datetime import datetime
from app.db.mongodb import db
from app.models.user import User, UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from bson import ObjectId

class UserService:
    def __init__(self):
        self.collection = db.db.users

    async def get_user_by_email(self, email: str) -> Optional[User]:
        user = await self.collection.find_one({"email": email})
        if user:
            return User(**user)
        return None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        user = await self.collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return User(**user)
        return None

    async def create_user(self, user: UserCreate) -> User:
        # 检查邮箱是否已存在
        if await self.get_user_by_email(user.email):
            raise ValueError("Email already registered")

        user_dict = user.dict()
        user_dict["password"] = get_password_hash(user_dict["password"])
        user_dict["_id"] = ObjectId()
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()

        await self.collection.insert_one(user_dict)
        return await self.get_user_by_id(str(user_dict["_id"]))

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user

    async def update_user(self, user_id: str, user_update: UserUpdate) -> Optional[User]:
        update_data = user_update.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["password"] = get_password_hash(update_data["password"])
        update_data["updated_at"] = datetime.utcnow()

        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        if result.modified_count:
            return await self.get_user_by_id(user_id)
        return None

    async def delete_user(self, user_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

user_service = UserService()
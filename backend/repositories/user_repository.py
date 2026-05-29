import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.models import User

class UserRepository:
    @staticmethod
    # Get user by email
    async def get_by_email(email: str, db: AsyncSession) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    # Get user by ID
    async def get_by_id(user_id: uuid.UUID, db: AsyncSession) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    # Get user by GitHub ID
    async def get_by_github_id(github_id: str, db: AsyncSession) -> User | None:
        result = await db.execute(select(User).where(User.github_id == github_id))
        return result.scalar_one_or_none()

    @staticmethod
    # Create user
    async def create(email: str, hashed_password: str | None = None, db: AsyncSession = None) -> User:
        user = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=hashed_password,
        )
        db.add(user)
        await db.flush() 
        return user
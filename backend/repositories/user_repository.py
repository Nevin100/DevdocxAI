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

    @staticmethod
    # Upsert GitHub user
    async def upsert_github_user(
        github_id: str,
        github_username: str,
        email: str,
        encrypted_token: str,
        db: AsyncSession
    ) -> User:
        
        user = await UserRepository.get_by_github_id(github_id, db)
 
        if user:
            # Existing user — token refresh 
            user.github_access_token = encrypted_token
            user.github_username = github_username
            await db.flush()
        else:
            # Naya user
            user = User(
                id=uuid.uuid4(),
                email=email,
                github_id=github_id,
                github_username=github_username,
                github_access_token=encrypted_token,
            )
            db.add(user)
            await db.flush()
 
        return user
 
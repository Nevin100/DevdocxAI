import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.models import User
from auth.jwt import create_access_token
from utils.helper_auth import hash_password, verify_password
from schemas.auth_schema import RegisterRequest, LoginRequest, TokenResponse, UserResponse

class AuthService:
    # Register 
    @staticmethod
    async def register(body: RegisterRequest, db: AsyncSession) -> TokenResponse:
        """Registers a new user and returns an access token."""
        # Check duplicate email
        result = await db.execute(select(User).where(User.email == body.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        user = User(
            id=uuid.uuid4(),
            email=body.email,
            hashed_password=hash_password(body.password),
        )
        db.add(user)
        await db.flush()

        return TokenResponse(access_token=create_access_token(user.id))

    # Login
    @staticmethod
    async def login(body: LoginRequest, db: AsyncSession) -> TokenResponse:
        """Authenticates a user and returns an access token."""
        result = await db.execute(select(User).where(User.email == body.email))
        user = result.scalar_one_or_none()

        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if not verify_password(body.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account disabled"
            )

        return TokenResponse(access_token=create_access_token(user.id))

    # Get current user
    @staticmethod
    async def get_me(user_id: uuid.UUID, db: AsyncSession) -> UserResponse:
        """Retrieves the current user's information."""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse.model_validate(user)
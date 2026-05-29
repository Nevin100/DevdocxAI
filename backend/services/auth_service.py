import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from auth.jwt import create_access_token
from utils.helper_auth import hash_password, verify_password
from schemas.auth_schema import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from repositories.user_repository import UserRepository

class AuthService:
    # Register 
    @staticmethod
    async def register(body: RegisterRequest, db: AsyncSession) -> TokenResponse:
        existing = await UserRepository.get_by_email(body.email, db)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        user = await UserRepository.create(
            email=body.email,
            hashed_password=hash_password(body.password),
            db=db
        )

        return TokenResponse(access_token=create_access_token(user.id))
    
    # Login 
    @staticmethod
    async def login(body: LoginRequest, db: AsyncSession) -> TokenResponse:
        user = await UserRepository.get_by_email(body.email, db)

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
        user = await UserRepository.get_by_id(user_id, db)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse.model_validate(user)
import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from auth.jwt import create_access_token
from auth.github_oauth import get_github_oauth_url, exchange_code_for_token, fetch_github_user
from utils.helper_auth import hash_password, verify_password
from schemas.auth_schema import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from repositories.user_repository import UserRepository
from utils.encryption import encrypt
from schemas.auth_schema import RegisterRequest, LoginRequest, TokenResponse, UserResponse, GithubOAuthUrlResponse

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

    # GitHub OAuth URL 
    @staticmethod
    def get_github_url() -> GithubOAuthUrlResponse:
        """Frontend ko yeh URL dedo — woh user ko yahan redirect karega"""
        return GithubOAuthUrlResponse(url=get_github_oauth_url())
 
    # GitHub Callback 
    @staticmethod
    async def github_callback(code: str, db: AsyncSession) -> TokenResponse:
        """
        GitHub se code aaya → token exchange → user fetch → DB upsert → JWT return
        """
        # Step 1 — retrieve access token from GitHub using the code
        access_token = await exchange_code_for_token(code)
 
        # Step 2 — Fetch user details from GitHub using the access token
        github_user = await fetch_github_user(access_token)
 
        github_id       = str(github_user["id"])
        github_username = github_user["login"]
        email           = github_user.get("email") or f"{github_username}@github.com"
 
        # Step 3 — Encrypt the GitHub access token before storing in DB
        encrypted_token = encrypt(access_token)
 
        user = await UserRepository.upsert_github_user(
            github_id=github_id,
            github_username=github_username,
            email=email,
            encrypted_token=encrypted_token,
            db=db
        )
 
        # Step 4 — Return JWT for our app (not GitHub token)
        return TokenResponse(access_token=create_access_token(user.id))
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from auth.jwt import get_current_user_id
from schemas.auth_schema import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from services.auth_service import AuthService

router = APIRouter()

# Authentication Routes : 
# 1. Register
@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService.register(body, db)

# 2. Login
@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService.login(body, db)

# 3. Get Current User
@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await AuthService.get_me(user_id, db)
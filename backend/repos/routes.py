import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from auth.jwt import get_current_user
from schemas.repo_schemas import ConnectRepoRequest, RepoResponse
from services.repo_service import RepoService

router = APIRouter()

@router.get("/repos", response_model=list[RepoResponse])
async def list_repos(
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RepoService.list_repos(user_id, db)

@router.post("/repos/connect", response_model=RepoResponse, status_code=201)
async def connect_repo(
    body: ConnectRepoRequest,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RepoService.connect_repo(user_id, body, db)
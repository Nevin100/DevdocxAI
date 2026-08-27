import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.repo_repository import RepoRepository
from schemas.repo_schemas import ConnectRepoRequest, RepoResponse

class RepoService:
    @staticmethod
    async def list_repos(user_id: uuid.UUID, db: AsyncSession) -> list[RepoResponse]:
        repos = await RepoRepository.list_by_owner(user_id, db)
        return [RepoResponse.model_validate(r) for r in repos]

    @staticmethod
    async def connect_repo(
        user_id: uuid.UUID, body: ConnectRepoRequest, db: AsyncSession
    ) -> RepoResponse:
        existing = await RepoRepository.get_by_github_repo_id(body.github_repo_id, db)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This repository is already connected",
            )

        repo = await RepoRepository.create(
            owner_id=user_id,
            github_repo_id=body.github_repo_id,
            full_name=body.full_name,
            default_branch=body.default_branch,
            db=db,
        )
        return RepoResponse.model_validate(repo)
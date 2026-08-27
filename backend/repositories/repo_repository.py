import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.models import Repository, RepoStatus

class RepoRepository:
    @staticmethod
    async def get_by_id(repo_id: uuid.UUID, db: AsyncSession) -> Repository | None:
        result = await db.execute(select(Repository).where(Repository.id == repo_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_github_repo_id(github_repo_id: str, db: AsyncSession) -> Repository | None:
        result = await db.execute(
            select(Repository).where(Repository.github_repo_id == github_repo_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_owner(owner_id: uuid.UUID, db: AsyncSession) -> list[Repository]:
        result = await db.execute(
            select(Repository)
            .where(Repository.owner_id == owner_id)
            .order_by(Repository.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def create(
        owner_id: uuid.UUID,
        github_repo_id: str,
        full_name: str,
        default_branch: str,
        db: AsyncSession,
    ) -> Repository:
        repo = Repository(
            id=uuid.uuid4(),
            owner_id=owner_id,
            github_repo_id=github_repo_id,
            full_name=full_name,
            default_branch=default_branch,
            status=RepoStatus.CONNECTED,
        )
        db.add(repo)
        await db.flush()
        return repo

    @staticmethod
    async def update_status(repo: Repository, status: RepoStatus, db: AsyncSession) -> Repository:
        repo.status = status
        await db.flush()
        return repo
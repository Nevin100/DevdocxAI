import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ConnectRepoRequest(BaseModel):
    github_repo_id: str
    full_name: str           
    default_branch: str = "main"

class RepoResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    default_branch: str
    status: str
    last_parsed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
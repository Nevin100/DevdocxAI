from pydantic import BaseModel, EmailStr
import uuid

# Request Schemas 
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Response Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    github_username: str | None

    class Config:
        from_attributes = True  # ORM model → Pydantic

from pydantic import BaseModel, EmailStr, ConfigDict
import uuid


# 2. GitHub Schemas :
# Request Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GithubCallbackRequest(BaseModel):
    code: str  # GitHub sends this after user authorizes


# Response Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    github_username: str | None

    model_config = ConfigDict(from_attributes=True)  # SQLAlchemy ORM → Pydantic


class GithubOAuthUrlResponse(BaseModel):
    url: str  # Frontend redirects user to this URL
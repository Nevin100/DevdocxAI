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
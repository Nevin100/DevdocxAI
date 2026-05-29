from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Helper functions for password hashing and verification:
def hash_password(password: str) -> str:
    """Plain password → bcrypt hash"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Plain password vs stored hash → True/False"""
    return pwd_context.verify(plain, hashed)
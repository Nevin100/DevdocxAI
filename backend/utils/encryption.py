from cryptography.fernet import Fernet
from config import get_settings

settings = get_settings()

# Fernet instance:
_fernet = Fernet(settings.ENCRYPTION_KEY.encode())

# Encryption & Decryption Functions
def encrypt(value: str) -> str:
    return _fernet.encrypt(value.encode()).decode()

def decrypt(value: str) -> str:
    return _fernet.decrypt(value.encode()).decode()
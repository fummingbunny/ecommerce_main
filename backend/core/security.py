from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from backend.core.config import settings

# password hashing setup 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# password functions

def hash_password(password: str) -> str:
    """Convert plain password to hashed version before storing in database."""
    password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """ Check if the provided plain password matches the stored hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

# jwt token functions

def create_access_token(data:dict) -> str:
    """ Short lived token - expires in 30 minutes by default."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data:dict) -> str:
    """ Long lived token - expires in 7 days by default."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    """ Decode JWT token and return the payload if valid, else return None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
    



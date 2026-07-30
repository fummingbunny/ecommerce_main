from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.core.security import decode_token

# this tells fastapi to except "Bearer <token>" in the Authorization header
security = HTTPBearer()

# Database Dependency

async def get_db_session(db: AsyncSession = Depends(get_db)) -> AsyncSession:
    """Provide a database session to path operations."""
    return db

# Authentication Dependency

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: AsyncSession = Depends(get_db_session)
): 
    """Extract and validate current user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    return {"user_id": int(user_id), "role": payload.get("role")}

async def get_current_admin(
        current_user: dict = Depends(get_current_user)
):
    """Ensure the current user has admin privileges."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user

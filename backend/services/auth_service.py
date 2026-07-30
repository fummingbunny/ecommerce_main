from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from backend.models.user import User, UserRole
from backend.schemas.user import UserCreate, UserLogin, TokenResponse
from backend.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token


# --- register a new user

async def register(user_data: UserCreate, db: AsyncSession):
    # check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        role=UserRole.customer,  # default role
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

# --- login

async def login(user_data: UserLogin, db: AsyncSession):
    # find user by email
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    # wrong email or wrong password - same error message for security
    # never reveal which one is wrong
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # create tokens
    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)   #valid for 15 minutes
    refresh_token = create_refresh_token(token_data)  #valid for 7 days

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

# --- refresh access token

async def refresh_access_token(refresh_token: str, db: AsyncSession):
    # decode and validate refresh token
    payload = decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    #get user from db
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    # check if user still exists and is active
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # create new access token
    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

# get current user profile

async def get_profile(user_id: int, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user
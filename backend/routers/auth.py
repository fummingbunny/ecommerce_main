from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest
from backend.core.dependencies import get_current_user
from backend.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"]) #prefix means all the paths are prefixed by this path

#register
@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.register(user_data, db)


# login

@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.login(user_data, db)

# refresh token

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.refresh_access_token(token_data.refresh_token, db)


#register token

@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.get_profile(current_user["user_id"], db)

#logout

@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user)
):

    #client side should delete both tokens
    #server side - stateless, nothing to delete for access token
    return {"message": "Logged Out Successfully"}


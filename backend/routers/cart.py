from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.schemas.cart import(
    CartItemCreate,
    CartItemUpdate,
    CartResponse
)
from backend.core.dependencies import get_current_user
from backend.services import cart_service

router = APIRouter(prefix="/cart", tags=["Cart"])

# get cart

@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await cart_service.get_cart(current_user["user_id"], db)

#add item to cart

@router.post("/items", response_model=CartResponse, status_code=201)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await cart_service.add_to_cart(
        current_user["user_id"], item_data, db
    )

# update cart item quantity

@router.put("/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await cart_service.update_cart_item(
        current_user["user_id"], item_id, item_data, db
    )

# remove item from cart

@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_from_cart(
    item_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await cart_service.remove_cart_item(
        current_user["user_id"], item_id, db
    )

# clear cart item

@router.delete("/")
async def clear_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await cart_service.clear_cart(current_user["user_id"], db)
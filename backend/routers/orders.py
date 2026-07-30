from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.schemas.order import(
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    PaginatedOrderResponse
)
from backend.core.dependencies import get_current_user, get_current_admin
from backend.services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])

# place order

@router.post("/", response_model=OrderResponse, status_code=201)
async def place_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await order_service.place_order(
        current_user["user_id"], order_data, db
    )

# get order history

@router.get("/", response_model=PaginatedOrderResponse)
async def get_order_history(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await order_service.get_order_history(
        current_user["user_id"], db, page, per_page
    )


# get order by id

@router.get("/{order_id}",response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await order_service.get_order_by_id(
        order_id, current_user["user_id"], db
    )

# update order status - admin only

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await order_service.update_order_status(
        order_id, status_data, db
    )

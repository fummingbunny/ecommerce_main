from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from backend.database import get_db
from backend.schemas.product import(
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    PaginatedProductResponse
)
from backend.schemas.order import(
    OrderResponse,
    OrderStatusUpdate,
    PaginatedOrderResponse
)
from backend.schemas.user import UserResponse
from backend.models.order import OrderStatus
from backend.core.dependencies import get_current_admin
from backend.services import product_service, order_service
from sqlalchemy import select, func
from backend.models.user import User
from backend.models.order import Order
from backend.models.product import Product

router = APIRouter(prefix="/admin", tags=["Admin"])

# DASHBOARD STATS

@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    #total users
    user_result = await db.execute(select(func.count(User.id)))
    total_users = user_result.scalar()

    # total products
    product_result = await db.execute(select(func.count(Product.id)))
    total_products = product_result.scalar()

    #total_orders
    order_result = await db.execute(select(func.count(Order.id)))
    total_orders = order_result.scalar()

    #total_revenue
    revenue_result = await db.execute(select(func.sum(Order.total_amount)).where(
        Order.status != OrderStatus.cancelled
        )
    )
    total_revenue = revenue_result.scalar() or 0

    #pending orders count
    pending_result = await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.pending))

    pending_orders = pending_result.scalar()

    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "pending_orders": pending_orders
    }

# ─────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────

@router.get("/users", response_model=list[UserResponse])
async def get_all_users(
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_active = False
    await db.commit()
    return {"message": f"User {user_id} deactivated successfully"}

# ─────────────────────────────────────────
# ORDER MANAGEMENT
# ─────────────────────────────────────────

@router.get("/orders", response_model=PaginatedOrderResponse)
async def get_all_orders(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    status: Optional[OrderStatus] = Query(default=None),
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await order_service.admin_get_all_orders(
        db, page, per_page, status
    )

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await order_service.update_order_status(
        order_id, status_data, db
    )

# ─────────────────────────────────────────
# PRODUCT MANAGEMENT
# ─────────────────────────────────────────

@router.get("/products", response_model=PaginatedProductResponse)
async def get_all_products(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=100),
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await product_service.get_products(db=db, page=page, per_page=per_page)

@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await product_service.create_product(product_data, db)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await product_service.update_product(product_id, product_data, db)

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await product_service.delete_product(product_id, db)
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from backend.models.order import OrderStatus
from backend.schemas.product import ProductResponse

# order item schema

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    product: ProductResponse
    quantity: int
    price_at_purchase: float

    class Config:
        from_attributes = True

# order schema

class OrderBase(BaseModel):
    shipping_address: str

class OrderCreate(BaseModel):
    shipping_address: str

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderResponse(BaseModel):
    id: int
    total_amount: int
    status: OrderStatus
    shipping_address: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True

class PaginatedOrderResponse(BaseModel):
    total: int
    page: int
    per_page: int
    orders: list[OrderResponse]

    class Config:
        from_attributes = True
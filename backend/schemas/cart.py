from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from backend.schemas.product import ProductResponse

# cart item schema

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product: ProductResponse
    quantity: int
    created_at: datetime

    class Config:
        from_attributes = True

# cart schema

class CartResponse(BaseModel):
    id: int
    items: list[CartItemResponse]
    total_price: float
    total_items: int

    class Config:
        from_attributes = True


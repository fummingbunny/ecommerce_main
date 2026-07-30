from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

#category schema

class CategoryBase(BaseModel):
    name:str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id:int
    created_at:datetime

    class Config:
        from_attributes = True

#product schema

class ProductBase(BaseModel):
    name:str
    description: Optional[str] = None
    price:float
    stock:int
    image_url: Optional[str] = None
    category_id:int 

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id:int
    is_active:bool
    created_at:datetime
    category: CategoryResponse

    class Config:
        from_attributes = True  

#pagination schema

class PaginatedProductResponse(BaseModel):
    total:int
    page:int
    per_page:int
    products:list[ProductResponse]
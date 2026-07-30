from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from backend.database import get_db
from backend.schemas.product import(
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    CategoryCreate,
    CategoryResponse,
    PaginatedProductResponse
)
from backend.core.dependencies import get_current_user, get_current_admin
from backend.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])

# category routes

@router.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_admin),   # admin only
    db: AsyncSession = Depends(get_db) 
):
    return await product_service.create_category(category_data, db)

@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db)
):
    return await product_service.get_all_categories(db)

# product routes

@router.get("/",response_model=PaginatedProductResponse)
async def get_products(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=100),
    category_id: Optional[int] = Query(default=None),
    min_price: Optional[float] = Query(default=None, ge=0),
    max_price: Optional[float] = Query(default=None, ge=0),
    search: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    return await product_service.get_products(
        db = db,
        page=page,
        per_page=per_page,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        search=search
    )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await product_service.get_product_by_id(product_id, db)

@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_admin),     #admin only
    db: AsyncSession = Depends(get_db)
):
    return await product_service.create_product(product_data, db)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_admin),    #admin only
    db: AsyncSession = Depends(get_db)
):
    return await product_service.update_product(product_id, product_data, db)

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    current_user: dict = Depends(get_current_admin),   #admin only
    db: AsyncSession = Depends(get_db)
):
    return await product_service.delete_product(product_id, db)

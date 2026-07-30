from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from backend.models.product import Product, Category
from backend.schemas.product import ProductCreate, ProductUpdate, CategoryCreate

# category services

async def create_category(category_data: CategoryCreate, db: AsyncSession):
    # check if category exists
    result = await db.execute(select(Category).where(Category.name == category_data.name))
    existing_category = result.scalar_one_or_none()

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists",
        )
    
    new_category = Category(name=category_data.name, description=category_data.description)

    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category


# product services

async def create_product(product_data: ProductCreate, db: AsyncSession):
    # check if category exists
    result = await db.execute(select(Category).where(Category.id == product_data.category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category does not exist",
        )
    
    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        image_url=product_data.image_url,
        category_id=product_data.category_id,
    )

    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    
    # Eagerly load the category relationship before the session closes
    result = await db.execute(
        select(Product).where(Product.id == new_product.id).options(selectinload(Product.category))
    )
    return result.scalar_one_or_none()

async def get_products(
        db: AsyncSession,
        page: int = 1,
        per_page: int = 10,
        category_id: int = None,
        min_price: float = None,
        max_price: float = None,
        search: str = None,
):
    query = select(Product)\
        .options(selectinload(Product.category))\
        .where(Product.is_active == True)

    if category_id:
        query = query.where(Product.category_id == category_id)
    
    if min_price is not None:
        query = query.where(Product.price >= min_price)  
    
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(or_(Product.name.ilike(search_pattern), Product.description.ilike(search_pattern)))
    
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()
    
    # Eagerly load the category relationship
    query = query.options(selectinload(Product.category))
    
    products_result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    products = products_result.scalars().all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "products": products,
    }

async def get_product_by_id(product_id: int, db: AsyncSession):
    result = await db.execute(select(Product).where(Product.id == product_id, Product.is_active == True).options(selectinload(Product.category)))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    return product

async def update_product(product_id: int, product_data: ProductUpdate, db: AsyncSession):
    product = await get_product_by_id(product_id, db)

    # only update fields that are provided
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    # Eagerly load the category relationship before the session closes
    result = await db.execute(
        select(Product).where(Product.id == product_id).options(selectinload(Product.category))
    )
    return result.scalar_one_or_none()

async def delete_product(product_id: int, db: AsyncSession):
    product = await get_product_by_id(product_id, db)

    # soft delete by setting is_active to False
    product.is_active = False
    await db.commit()
    return {"message": "Product deleted successfully"}

async def get_all_categories(db: AsyncSession):
    result = await db.execute(select(Category))
    return result.scalars().all()

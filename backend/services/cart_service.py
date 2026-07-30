from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from backend.models.cart import Cart, CartItem
from backend.schemas.cart import CartItemBase, CartItemCreate, CartItemResponse, CartItemUpdate
from backend.models.product import Product
from sqlalchemy.orm import selectinload

# helper - get or create cart

async def get_or_create_cart(user_id: int, db: AsyncSession):
    result = await db.execute(select(Cart).where(Cart.user_id == user_id))
    cart = result.scalar_one_or_none()

    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)

    return cart

# get cart


async def get_cart(user_id: int, db: AsyncSession):
    cart = await get_or_create_cart(user_id, db)
    
    # fetch cart items with product details
    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product)
            .selectinload(Product.category)
        )
        .where(CartItem.cart_id == cart.id))
    
    items = result.scalars().all()

    # calculate totals

    total_price = sum(item.quantity * item.product.price for item in items)
    total_items = sum(item.quantity for item in items)

    return {
        "id": cart.id,
        "items": items,
        "total_price": round(total_price, 2),
        "total_items": total_items,
    }

# add item to cart

async def add_to_cart(user_id: int, item_data: CartItemCreate, db: AsyncSession):
    # check if product exists and is active

    result = await db.execute(select(Product).where(Product.id == item_data.product_id, Product.is_active == True))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or inactive",
        )
    
    if product.stock < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock} items in stock",
        )
    
    cart = await get_or_create_cart(user_id, db)

    # check if item already in cart
    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == item_data.product_id)
    )
    existing_item = result.scalar_one_or_none()

    if existing_item:
        # product already in cart, update quantity
        new_quantity = existing_item.quantity + item_data.quantity

        # check stock again
        if product.stock < new_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} items in stock",
            )
        existing_item.quantity = new_quantity
    else:
        # add new item to cart
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
        )
        db.add(new_item)

    await db.commit()
    return await get_cart(user_id, db)

# update cart item quantity

async def update_cart_item(user_id: int, item_id: int, item_data: CartItemUpdate, db: AsyncSession):
    cart = await get_or_create_cart(user_id, db)

    # find cart item
    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product)
            .selectinload(Product.category)
        )
        .where(
            CartItem.id == item_id, 
            CartItem.cart_id == cart.id
            )
        )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )
    
    # check if product exists and is active
    if item.product.stock < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {item.product.stock} items in stock",
        )
    
    item.quantity = item_data.quantity
    await db.commit()
    return await get_cart(user_id, db)

# remove item from cart

async def remove_cart_item(user_id: int, item_id: int, db: AsyncSession):
    cart = await get_or_create_cart(user_id, db)

    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.id == item_id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )
    
    await db.delete(item)
    await db.commit()
    return await get_cart(user_id, db)

# clear cart

async def clear_cart(user_id: int, db: AsyncSession):
    cart = await get_or_create_cart(user_id, db)

    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id)
    )
    items = result.scalars().all()

    for item in items:
        await db.delete(item)
    
    await db.commit()
    return {"message": "Cart cleared successfully"}
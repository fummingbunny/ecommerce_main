from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from backend.models.order import Order, OrderItem, OrderStatus
from backend.schemas.order import OrderStatusUpdate, OrderCreate, OrderResponse, OrderItemBase
from backend.models.product import Product
from backend.services.cart_service import get_cart, clear_cart
from backend.websockets.manager import manager
from sqlalchemy.orm import selectinload


#place order

async def place_order(user_id: int, order_data: OrderCreate, db: AsyncSession):
    # get current cart
    cart = await get_cart(user_id, db)

    #cart empty check
    if not cart["items"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Cart is Empty")
    
    # verify stock for all the items before placing oder
    for item in cart["items"]:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()

        if not product or product.stock < item.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Insufficient stock for {product.name}")
        
    # create the order

    new_order = Order(
        user_id=user_id,
        total_amount=cart["total_price"],
        shipping_address = order_data.shipping_address,
        status = OrderStatus.pending
    )

    db.add(new_order)
    await db.flush()   # get order id without committing yet

    # create order items + deduct stock
    for item in cart["items"]:
        product_result = await db.execute(select(Product).where(Product.id==item.product_id))
        product = product_result.scalar_one_or_none()

        # create order item
        order_item = OrderItem(
            order_id=new_order.id,
            product_id = item.product_id,
            quantity=item.quantity,
            price_at_purchase = product.price # save current price
        )
        db.add(order_item)

        # deduct stock

        product.stock -= item.quantity

        # Reload order with all relationships needed by OrderResponse
        result = await db.execute(
                select(Order)
                .options(
                    selectinload(Order.items)
                    .selectinload(OrderItem.product)
                )
                .where(Order.id == new_order.id)
            )

        order = result.scalar_one()

        # clear the cart after the successful order
        await clear_cart(user_id, db)

        return order

# get order by id

async def get_order_by_id(order_id: int, user_id: int, db: AsyncSession):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .selectinload(Product.category)
        )
        .where(
            Order.id == order_id,
            Order.user_id == user_id
        )
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

# get order history

async def get_order_history(
    user_id: int,
    db: AsyncSession,
    page: int = 1,
    per_page: int = 10
):
    # Get total count
    count_result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(Order.user_id == user_id)
    )

    total = count_result.scalar()

    # Pagination
    offset = (page - 1) * per_page

    # Load all relationships needed by the response schema
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .selectinload(Product.category)
        )
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )

    orders = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "orders": orders
    }

# update order status - admin only

async def update_order_status(
        order_id:int,
        status_data: OrderStatusUpdate,
        db: AsyncSession
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items)
                .selectinload(OrderItem.product)
                .selectinload(Product.category)
                )
                .where(Order.id==order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    valid_transaction = {
        OrderStatus.pending: [OrderStatus.confirmed, OrderStatus.cancelled],
        OrderStatus.confirmed: [OrderStatus.shipped, OrderStatus.cancelled],
        OrderStatus.shipped: [OrderStatus.delivered],
        OrderStatus.delivered: [],
        OrderStatus.cancelled: []
    }

    if status_data.status not in valid_transaction[order.status]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot move order from {order.status} to {status_data.status}"
        )
    
    order.status = status_data.status
    await db.commit()
    await manager.notify_order_status_change(
        order_id=order.id,
        user_id=order.user_id,
        new_status=status_data.status.value
    )
    await db.refresh(order)
    return order

# admin - get all orders

async def admin_get_all_orders(
    db: AsyncSession,
    page: int = 1,
    per_page: int = 10,
    status: OrderStatus = None
):
    query = select(Order)
    if status:
        query = query.where(Order.status == status)

    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()

    offset = (page - 1) * per_page
    result = await db.execute(
        query
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .selectinload(Product.category)
        )
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    orders = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "orders": orders
    }


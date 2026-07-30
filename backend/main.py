from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import WebSocket, WebSocketDisconnect
from backend.database import engine, Base
from backend.routers import auth, products, cart, orders, admin
from backend.websockets.manager import manager
from backend.core.config import settings
from backend.core.dependencies import get_current_user
from backend.core.security import decode_token

# DATABASE SETUP

@asynccontextmanager
async def lifespan(app: FastAPI):
    # runs when app starts
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created!")
    yield
    # runs when app STOPS
    print("App shutting down.. :(")

# CREATE APP

app = FastAPI(
    title=settings.APP_NAME,
    description="Production ready ecommerce API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS MIDDLEWARE

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],   # React app url
    allow_credentials=True,
    allow_methods=["*"],    # allow all HTTP methods
    allow_headers=["*"]   # allow all headers
)


# INCLUDE ROUTES

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)


# ROOT ROUTE

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

# WEBSOCKET ROUTES

@app.websocket("/ws/notifications/{user_id}")
async def user_notification(
    websocket: WebSocket,
    user_id: int,
    token: str     #token passed as query param    
):
    """
    Customer connects here to receive:
    - order status updates
    - general notifications
    Usage: ws://localhost:8000/ws/notifications/101?token=eyj...
    """

    # verify token before accepting connection
    payload = decode_token(token)
    if not payload or int(payload.get("sub")) != user_id:
        await websocket.close(code=1008)   # policy violation
        return
    await manager.connect_user(user_id, websocket)
    try: 
        # keep connection alive
        while True:
            # wait for any message from client
            # heartbeat/ping to keep alive
            data = await websocket.receive_text()
            # echo back to confirm connection alive
            await websocket.send_json({
                "type": "pong",
                "message": "connection alive"
            })
    except WebSocketDisconnect:
        manager.disconnect_user(user_id)
        print(f"User {user_id} disconnected")


@app.websocket("/ws/orders/{order_id}")
async def order_tracking(
    websocket: WebSocket,
    order_id: int,
    token: str     #token passed as query param    
):
    """
    Customer connects here to track specific order:
    Usage: ws://localhost:8000/ws/orders/55?token=eyj...
    """

    # verify token before accepting connection
    payload = decode_token(token)
    if not payload:
        await websocket.close(code=1008)   # policy violation
        return

    await manager.connect_order(order_id, websocket)
    try: 
        # keep connection alive
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({
                "type": "pong",
                "message": "tracking active"
            })
    except WebSocketDisconnect:
        manager.disconnect_order(order_id)
        print(f"Client disconnected from order {order_id}")


@app.websocket("/ws/admin")
async def admin_dashboard(
    websocket: WebSocket,
    token: str
):
    """
    Admin connects here for live dashboard
    Usage: ws://localhost:8000/ws/admin?token=eyj...
    """

    # verify token before accepting connection
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin":
        await websocket.close(code=1008)   # policy violation
        return

    await manager.connect_admin(websocket)
    try: 
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({
                "type": "pong",
                "message": "dashboard active"
            })
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)
        print("Admin disconnected")

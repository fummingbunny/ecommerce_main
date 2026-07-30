from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # stores active connections
        # one user can have one connection
        # key = user_id, value = websocket
        self.user_connections: Dict[int, WebSocket] = {}

        # admin connections (multiple admins possible)
        self.admin_connections: List[WebSocket] = []

        # order specific connections
        self.order_connections: Dict[int, List[WebSocket]] = {}

        # Connect ------

    async def connect_user(self, user_id: int, websocket: WebSocket):
        """Connect a user to receive notifications"""
        await websocket.accept()
        self.user_connections[user_id] = websocket
        print(f"User {user_id} connected")
    
    async def connect_admin(self, websocket: WebSocket):
        """Connect an admin to receive live dashboard updates"""
        await websocket.accept()
        self.admin_connections.append(websocket)
        print(f"Admin connected. Total admins: {len(self.admin_connections)}")

    async def connect_order(self, order_id: int, websocket: WebSocket):
        """Connect to a specific order for real-time tracking"""
        await websocket.accept()
        if order_id not in self.order_connections:
            self.order_connections[order_id] = []
        self.order_connections[order_id].append(websocket)
        print(f"Client connected to order {order_id}")


    # disconnect

    def disconnect_user(self, user_id: int):
        """Remove user connection"""
        if user_id in self.user_connections:
            del self.user_connections[user_id]
            print(f"User {user_id} discoonected")
    
    def disconnect_admin(self, websocket: WebSocket):
        """Remove admin connection"""
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)
            print(f"Admin disconnected. Total admins: {len(self.admin_connections)}")

    def disconnect_order(self, order_id: int, websocket: WebSocket):
        """Remove connection from specific order"""
        if order_id in self.order_connections:
            self.order_connections[order_id].remove(websocket)
            if not self.order_connections[order_id]:
                del self.order_connections[order_id]
            print(f"Client disconnnected from order {order_id}")
    
    # send messages

    async def send_to_user(self, user_id: int, message: dict):
        """Send notification to a specifc user"""
        if user_id in self.user_connections:
            webSocket = self.user_connections[user_id]
            try:
                await webSocket.send_json(message)
                print(f"Message sent to user {user_id}")
            except Exception:
                # connection broken - remove it
                self.disconnect_user(user_id)

    async def send_to_admins(self, message: dict):
        """Send update to all connected admins"""
        disconnected = []
        for websocket in self.admin_connections:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect_admin(websocket)

    async def send_to_order(self, order_id: int, message: dict):
        """Send update to everyone tracking a specifc order"""
        if order_id in self.order_connections:
            disconnected = []
            for websocket in self.order_connections[order_id]:
                try:
                    await websocket.send_json(message)
                except Exception:
                    disconnected.append(websocket)
            
            for websocket in disconnected:
                self.disconnect_order(order_id, websocket)
    
    # broadcast helpers

    async def notify_order_status_change(
            self,
            order_id: int,
            user_id: int,
            new_status: str
    ):
        """
        Called when admin updates order status
        Notifies:
        1. The customer who placed the order
        2. Everyone tracking that order
        3. All connected admins (dashboard update)
        """
        message = {
            "type": "order_status_update",
            "order_id": order_id,
            "status": new_status,
            "message": f"Your order #{order_id} is now {new_status}"
        }

        # notify the customer
        await self.send_to_user(user_id, message)

        await self.send_to_order(order_id, message)

        # notify admins dashboard
        await self.send_to_admins({
            "type": "order_updates",
            "order_id": order_id,
            "status": new_status
        })

    async def notify_new_order(self, order_id: int, user_id: int, total: float):
        """
        Called when customer places a new order
        Notifies all admins instantly
        """
        await self.send_to_admins({
            "type": "new_order",
            "order_id": order_id,
            "user_id": user_id,
            "total": total,
            "message": f"New order #{order_id} placed for ₹{total}"
        })
    
    async def notify_low_stock(self, product_id: int, product_name: str, stock: int):
        """
        Called when product stock goes low
        Notifies all admins
        """

        await self.send_to_admin({
            "type": "low_stock",
            "product_id": product_id,
            "product_name": product_name,
            "stock": stock,
            "message": f"Low stock alert: {product_name} has only {stock} items left"
        })


manager: ConnectionManager = ConnectionManager()
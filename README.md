# ecommerce_main
E-Commerce Platform  —  React, TypeScript, FastAPI, PostgreSQL, JWT, WebSockets
🛍️ Ecommerce API
A production-ready full-stack ecommerce application built with modern technologies and senior-level architecture patterns.

🚀 Tech Stack
Layer	Technology
Backend	FastAPI (Python)
Database	PostgreSQL
ORM	SQLAlchemy (Async)
Authentication	JWT (Access + Refresh Tokens)
Real-time	WebSockets
Frontend	React
✨ Features
Customer Features
🔐 Register and Login with JWT authentication
🔄 Refresh token rotation (stay logged in securely)
🛍️ Browse products with search and filter by category and price
🛒 Cart management (add, remove, update quantity)
📦 Place orders and view order history
📡 Real-time order status updates via WebSockets
Admin Features
📊 Live dashboard (total users, orders, revenue, pending orders)
🏷️ Product management (create, update, soft delete)
📋 Order management with status transitions
👥 User management (view, deactivate)
🔔 Real-time notifications for new orders via WebSockets
🏗️ Project Structure
ecommerce/
├── backend/
│   ├── core/
│   │   ├── config.py            # env variables via pydantic settings
│   │   ├── security.py          # JWT creation and password hashing
│   │   └── dependencies.py      # reusable FastAPI dependencies
│   ├── models/                  # SQLAlchemy database models
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   └── order.py
│   ├── schemas/                 # Pydantic request and response schemas
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   └── order.py
│   ├── routers/                 # API route definitions (thin layer)
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── orders.py
│   │   └── admin.py
│   ├── services/                # business logic (service layer pattern)
│   │   ├── auth_service.py
│   │   ├── product_service.py
│   │   ├── cart_service.py
│   │   └── order_service.py
│   ├── websockets/              # WebSocket connection manager
│   │   └── manager.py
│   ├── database.py              # async DB engine and session
│   └── main.py                  # app entry point
└── frontend/                    # React application
    └── src/
        ├── components/
        ├── pages/
        ├── hooks/
        ├── services/
        └── context/
🔑 Architecture Decisions
Service Layer Pattern — business logic separated from routes for maintainability and reusability across multiple endpoints
Async SQLAlchemy — non-blocking database calls for high performance under concurrent load
JWT with Refresh Tokens — secure stateless authentication with seamless user experience (no forced re-login every 30 mins)
Role Based Access Control — admin and customer roles with protected routes using FastAPI dependency injection
Soft Delete — products marked inactive instead of deleted to preserve order history and invoice integrity
Price at Purchase — order items store price at time of order to handle future product price changes correctly
Database Indexing — indexes on frequently queried columns (email, product name, price, category) for faster queries
WebSocket Manager — handles multiple concurrent client connections for real-time order tracking and notifications
Ownership Validation — users can only access their own cart, orders and profile data (prevents data leakage)
🛡️ Security Features
Password hashing with bcrypt (slow by design, brute force resistant)
JWT access token (30 mins) + refresh token (7 days)
Same error message for wrong email and wrong password (prevents user enumeration attacks)
Role based route protection (admin vs customer)
Ownership validation on all sensitive resources
All secrets in environment variables (never hardcoded)
Token type validation (access token cannot be used as refresh)
⚡ Real-time Features (WebSockets)
Order Status Updates — customer sees live updates when admin moves order from pending → confirmed → shipped → delivered
Stock Updates — all users viewing a product see instant out-of-stock notification when stock hits zero
Admin Live Dashboard — new orders appear without page refresh
User Notifications — instant alerts for order confirmations and shipping updates
🗄️ Database Schema
users
├── id, name, email, password (hashed)
├── role (customer/admin), is_active
└── created_at, updated_at

categories
├── id, name, description
└── created_at

products
├── id, name, description, price, stock
├── image_url, is_active, category_id
└── created_at, updated_at
└── index on (category_id, price) for fast filtering

carts
├── id, user_id (unique — one cart per user)
└── created_at, updated_at

cart_items
├── id, cart_id, product_id, quantity
└── created_at, updated_at

orders
├── id, user_id, total_amount
├── status (pending/confirmed/shipped/delivered/cancelled)
├── shipping_address
└── created_at, updated_at

order_items
├── id, order_id, product_id
├── quantity, price_at_purchase
└── created_at
🚦 API Endpoints
Authentication
POST   /auth/register         → create new account
POST   /auth/login            → login and get tokens
POST   /auth/refresh          → get new access token
GET    /auth/profile          → view my profile (protected)
POST   /auth/logout           → logout (protected)
Products
GET    /products/             → browse with search, filter, pagination
GET    /products/{id}         → product detail page
POST   /products/             → create product (admin only)
PUT    /products/{id}         → update product (admin only)
DELETE /products/{id}         → soft delete product (admin only)
GET    /products/categories   → get all categories
POST   /products/categories   → create category (admin only)
Cart
GET    /cart/                 → view cart with totals (protected)
POST   /cart/items            → add item to cart (protected)
PUT    /cart/items/{id}       → update item quantity (protected)
DELETE /cart/items/{id}       → remove item from cart (protected)
DELETE /cart/                 → clear entire cart (protected)
Orders
POST   /orders/               → place order from cart (protected)
GET    /orders/               → my order history (protected)
GET    /orders/{id}           → order detail (protected)
PUT    /orders/{id}/status    → update order status (admin only)
Admin Panel
GET    /admin/dashboard              → live stats (admin only)
GET    /admin/users                  → all users (admin only)
PUT    /admin/users/{id}/deactivate  → ban user (admin only)
GET    /admin/orders                 → all orders with filter (admin only)
PUT    /admin/orders/{id}/status     → update status (admin only)
GET    /admin/products               → all products (admin only)
POST   /admin/products               → create product (admin only)
PUT    /admin/products/{id}          → update product (admin only)
DELETE /admin/products/{id}          → soft delete (admin only)
WebSockets
WS     /ws/orders/{order_id}         → order status updates
WS     /ws/admin                     → admin live dashboard
WS     /ws/notifications/{user_id}   → user notifications
🛠️ Local Setup
Prerequisites
Python 3.12+
PostgreSQL 15+
Node.js 18+
Homebrew (Mac)
Backend Setup
# Clone the repo
git clone https://github.com/charanreddy1410/ecommerce.git
cd ecommerce

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
# .\venv\Scripts\activate       # Windows

# Install dependencies
pip3 install -r requirements.txt

# Create .env file from example
cp .env.example .env
# Open .env and fill in your PostgreSQL credentials

# Start PostgreSQL (Mac)
brew services start postgresql@15

# Run the backend server
uvicorn backend.main:app --reload
Frontend Setup
cd frontend
npm install
npm start
Environment Variables
Create a .env file in the root folder:

DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/ecommerce
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
APP_NAME=Ecommerce API
DEBUG=True
📖 API Documentation
Once the backend server is running, visit:

Swagger UI → http://localhost:8000/docs
ReDoc → http://localhost:8000/redoc
All endpoints, request schemas, and response schemas are automatically documented and testable from the browser.

🧪 Testing the API
Open http://localhost:8000/docs
Register a new user via POST /auth/register
Login via POST /auth/login → copy the access token
Click "Authorize" button in Swagger UI
Paste: Bearer your_access_token
Now test all protected endpoints directly from the browser
📦 Dependencies
fastapi
uvicorn
sqlalchemy
asyncpg
alembic
pydantic
pydantic-settings
passlib
python-jose
python-dotenv
bcrypt
email-validator
🗺️ Roadmap
 JWT Authentication with refresh tokens
 Product management with search and filters
 Cart and order management
 Role based access control
 Real-time WebSockets
 Payment gateway integration (Stripe)
 Email notifications
 Docker containerization
 CI/CD pipeline
 Cloud deployment (AWS/Railway)
👨‍💻 Author
Bathineni Kowshik
⭐ If you found this project helpful, please give it a star!

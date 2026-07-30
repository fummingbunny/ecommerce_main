# ecommerce_main

**E-Commerce Platform** — React, TypeScript, FastAPI, PostgreSQL, JWT, WebSockets

## 🛍️ Ecommerce API

A production-ready full-stack ecommerce application built with modern technologies and senior-level architecture patterns.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI (Python) |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy (Async) |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **Real-time** | WebSockets |
| **Frontend** | React |

---

## ✨ Features

### Customer Features
* 🔐 **Register and Login** with JWT authentication
* 🔄 **Refresh token rotation** (stay logged in securely)
* 🛍️ **Browse products** with search and filter by category and price
* 🛒 **Cart management** (add, remove, update quantity)
* 📦 **Place orders** and view order history
* 📡 **Real-time order status updates** via WebSockets

### Admin Features
* 📊 **Live dashboard** (total users, orders, revenue, pending orders)
* 🏷️ **Product management** (create, update, soft delete)
* 📋 **Order management** with status transitions
* 👥 **User management** (view, deactivate)
* 🔔 **Real-time notifications** for new orders via WebSockets

---

## 🏗️ Project Structure

```text
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


## 🔑 Architecture Decisions

* **Service Layer Pattern:** Business logic separated from routes for maintainability and reusability across multiple endpoints.
* **Async SQLAlchemy:** Non-blocking database calls for high performance under concurrent load.
* **JWT with Refresh Tokens:** Secure stateless authentication with seamless user experience (no forced re-login every 30 mins).
* **Role-Based Access Control:** Admin and customer roles with protected routes using FastAPI dependency injection.
* **Soft Delete:** Products marked inactive instead of deleted to preserve order history and invoice integrity.
* **Price at Purchase:** Order items store price at time of order to handle future product price changes correctly.
* **Database Indexing:** Indexes on frequently queried columns (email, product name, price, category) for faster queries.
* **WebSocket Manager:** Handles multiple concurrent client connections for real-time order tracking and notifications.
* **Ownership Validation:** Users can only access their own cart, orders, and profile data (prevents data leakage).

---

## 🛡️ Security Features

* Password hashing with `bcrypt` (slow by design, brute force resistant)
* JWT access token (30 mins) + refresh token (7 days)
* Same error message for wrong email and wrong password (prevents user enumeration attacks)
* Role-based route protection (admin vs customer)
* Ownership validation on all sensitive resources
* All secrets in environment variables (never hardcoded)
* Token type validation (access token cannot be used as refresh)

---

## ⚡ Real-time Features (WebSockets)

* **Order Status Updates:** Customer sees live updates when admin moves order from pending → confirmed → shipped → delivered
* **Stock Updates:** All users viewing a product see instant out-of-stock notification when stock hits zero
* **Admin Live Dashboard:** New orders appear without page refresh
* **User Notifications:** Instant alerts for order confirmations and shipping updates

---

## 🗄️ Database Schema

```text
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

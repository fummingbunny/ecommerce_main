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


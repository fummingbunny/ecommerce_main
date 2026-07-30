// --------------------------
// AUTH TYPES
// --------------------------

export interface User {
    id: number,
    name: string,
    email: string,
    role: "customer" | "admin"
    is_active: boolean
    created_at: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface TokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
}

// PRODUCT TYPES

export interface Category {
    id: number
    name: string
    description: string | null
    created_at: string
}

export interface Product {
    id: number
    name: string
    description: string | null
    price: number
    stock: number
    image_url: string | null
    is_active: boolean
    category_id: number
    category: Category
    created_at: string
}

export interface PaginatedProducts {
    total: number
    page: number
    per_page: number
    products: Product[]
}

export interface ProductFilters {
    page?: number
    per_page?: number
    category_id?: number
    min_price?: number
    max_price?: number
    search?: string
}

// CART TYPES

export interface CartItem {
    id: number
    quantity: number
    product: Product
    created_at: string
}

export interface Cart {
    id: number
    items: CartItem[]
    total_price: number
    total_items: number
}

export interface AddToCartResponse {
    product_id: number
    quantity: number
}

export interface UpdateCartRequest {
    quantity: number
}

// ORDER TYPES

export type OrderStatus = 
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"

export interface OrderItem {
    id: number
    quantity: number
    price_at_purchase: number
    product: Product
}

export interface Order {
    id: number
    total_amount: number
    status: OrderStatus
    shipping_address: string
    created_at: string
    updated_at: string | null
    items: OrderItem[]
}

export interface PaginatedOrders {
    total: number
    page: number
    per_page: number
    orders: Order[]
}

export interface PlaceOrderRequest {
    shiping_address: string
}

// ADMIN TYPES

export interface DashboardStats {
    total_users: number
    total_products: number
    total_orders: number
    total_revenue: number
    pending_orders: number
}

// WEBSOCKET TYPES

export interface WebSocketMessage {
    type: 
        | "order_status_update"
        | "new_order"
        | "low_stock"
        | "pong"
    order_id?: number
    status?: OrderStatus
    message?: string
    product_id?: number
    product_name?: string
    stock?: number
    total?: number
}

// API ERROR TYPE

export interface ApiError{
    detail: string
}
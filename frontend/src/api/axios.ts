import axios from "axios"

// ─────────────────────────────────────────
// CREATE AXIOS INSTANCE
// ─────────────────────────────────────────

const api = axios.create({
    baseURL: "http://localhost:8000",  // FastAPI URL
    withCredentials: true,  // send cookies and credentials with requests
    headers: {
        "Content-Type": "application/json"
    }
})

// ─────────────────────────────────────────
// REQUEST INTERCEPTOR
// attach token to every request automatically
// ─────────────────────────────────────────

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ─────────────────────────────────────────
// RESPONSE INTERCEPTOR
// handle token expiry automatically
// ─────────────────────────────────────────

api.interceptors.response.use(
    // success → just return response
    (response) => response,

    // error → check if token expired
    async (error) => {
        const originalRequest = error.config

        // 401 = unauthorized = token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true  // prevent infinite loop

            try {
                // try to refresh the token
                const refresh_token = localStorage.getItem("refresh_token")

                if (!refresh_token) {
                    // no refresh token → logout
                    localStorage.clear()
                    window.location.href = "/login"
                    return Promise.reject(error)
                }

                // call refresh endpoint
                const response = await axios.post(
                    "http://localhost:8000/auth/refresh",
                    { refresh_token }
                )

                const { access_token } = response.data

                // save new access token
                localStorage.setItem("access_token", access_token)

                // retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`
                return api(originalRequest)

            } catch (refreshError) {
                // refresh failed → logout
                localStorage.clear()
                window.location.href = "/login"
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// ─────────────────────────────────────────
// AUTH API CALLS
// ─────────────────────────────────────────

export const authAPI = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post("/auth/register", data),

    login: (data: { email: string; password: string }) =>
        api.post("/auth/login", data),

    logout: () =>
        api.post("/auth/logout"),

    getProfile: () =>
        api.get("/auth/profile"),

    refreshToken: (refresh_token: string) =>
        api.post("/auth/refresh", { refresh_token })
}

// ─────────────────────────────────────────
// PRODUCTS API CALLS
// ─────────────────────────────────────────

export const productsAPI = {
    getProducts: (params?: {
        page?: number
        per_page?: number
        category_id?: number
        min_price?: number
        max_price?: number
        search?: string
    }) => api.get("/products/", { params }),

    getProduct: (id: number) =>
        api.get(`/products/${id}`),

    getCategories: () =>
        api.get("/products/categories"),

    createProduct: (data: FormData | object) =>
        api.post("/products/", data),

    updateProduct: (id: number, data: object) =>
        api.put(`/products/${id}`, data),

    deleteProduct: (id: number) =>
        api.delete(`/products/${id}`)
}

// ─────────────────────────────────────────
// CART API CALLS
// ─────────────────────────────────────────

export const cartAPI = {
    getCart: () =>
        api.get("/cart/"),

    addToCart: (product_id: number, quantity: number) =>
        api.post("/cart/items", { product_id, quantity }),

    updateCartItem: (item_id: number, quantity: number) =>
        api.put(`/cart/items/${item_id}`, { quantity }),

    removeFromCart: (item_id: number) =>
        api.delete(`/cart/items/${item_id}`),

    clearCart: () =>
        api.delete("/cart/")
}

// ─────────────────────────────────────────
// ORDERS API CALLS
// ─────────────────────────────────────────

export const ordersAPI = {
    placeOrder: (shipping_address: string) =>
        api.post("/orders/", { shipping_address }),

    getOrders: (page?: number, per_page?: number) =>
        api.get("/orders/", { params: { page, per_page } }),

    getOrder: (id: number) =>
        api.get(`/orders/${id}`),

    updateOrderStatus: (id: number, status: string) =>
        api.put(`/orders/${id}/status`, { status })
}

// ─────────────────────────────────────────
// ADMIN API CALLS
// ─────────────────────────────────────────

export const adminAPI = {
    getDashboard: () =>
        api.get("/admin/dashboard"),

    getUsers: () =>
        api.get("/admin/users"),

    deactivateUser: (id: number) =>
        api.put(`/admin/users/${id}/deactivate`),

    getAllOrders: (page?: number, status?: string) =>
        api.get("/admin/orders", { params: { page, status } }),

    getAllProducts: (page?: number) =>
        api.get("/admin/products", { params: { page } })
}

export default api
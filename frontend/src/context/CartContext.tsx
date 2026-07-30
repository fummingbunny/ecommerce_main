import React, { createContext, useContext, useState, useEffect } from "react"
import type { Cart } from "../types"
import { cartAPI } from "../api/axios"
import { useAuth } from "./AuthContext"

// ─────────────────────────────────────────
// CONTEXT TYPE
// ─────────────────────────────────────────

interface CartContextType {
    cart: Cart | null
    cartCount: number
    loading: boolean
    addToCart: (product_id: number, quantity: number) => Promise<void>
    updateCartItem: (item_id: number, quantity: number) => Promise<void>
    removeFromCart: (item_id: number) => Promise<void>
    clearCart: () => Promise<void>
    refreshCart: () => Promise<void>
}

// ─────────────────────────────────────────
// CREATE CONTEXT
// ─────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null)

// ─────────────────────────────────────────
// CART PROVIDER
// ─────────────────────────────────────────

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [cart, setCart] = useState<Cart | null>(null)
    const [loading, setLoading] = useState(false)
    const { isAuthenticated } = useAuth()

    // fetch cart when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            refreshCart()
        } else {
            setCart(null)
        }
    }, [isAuthenticated])

    // ─────────────────────────────────────────
    // REFRESH CART
    // ─────────────────────────────────────────

    const refreshCart = async () => {
        try {
            setLoading(true)
            const response = await cartAPI.getCart()
            setCart(response.data)
        } catch {
            setCart(null)
        } finally {
            setLoading(false)
        }
    }

    // ─────────────────────────────────────────
    // ADD TO CART
    // ─────────────────────────────────────────

    const addToCart = async (product_id: number, quantity: number) => {
        try {
            setLoading(true)
            const response = await cartAPI.addToCart(product_id, quantity)
            setCart(response.data)
        } finally {
            setLoading(false)
        }
    }

    // ─────────────────────────────────────────
    // UPDATE CART ITEM
    // ─────────────────────────────────────────

    const updateCartItem = async (item_id: number, quantity: number) => {
        try {
            setLoading(true)
            const response = await cartAPI.updateCartItem(item_id, quantity)
            setCart(response.data)
        } finally {
            setLoading(false)
        }
    }

    // ─────────────────────────────────────────
    // REMOVE FROM CART
    // ─────────────────────────────────────────

    const removeFromCart = async (item_id: number) => {
        try {
            setLoading(true)
            const response = await cartAPI.removeFromCart(item_id)
            setCart(response.data)
        } finally {
            setLoading(false)
        }
    }

    // ─────────────────────────────────────────
    // CLEAR CART
    // ─────────────────────────────────────────

    const clearCart = async () => {
        try {
            setLoading(true)
            await cartAPI.clearCart()
            setCart(null)
        } finally {
            setLoading(false)
        }
    }

    const value: CartContextType = {
        cart,
        cartCount: cart?.total_items ?? 0,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

// ─────────────────────────────────────────
// CUSTOM HOOK
// ─────────────────────────────────────────

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used inside CartProvider")
    }
    return context
}
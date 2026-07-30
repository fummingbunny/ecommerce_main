import React, {createContext, useContext, useState, useEffect} from "react";
import type { User } from "../types";
import { authAPI } from "../api/axios";

// CONTEXT TYPE

interface AuthContextType {
    user: User | null
    loading: boolean
    isAuthenticated: boolean
    isAdmin: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
}

// CREATE CONTEXT

const AuthContext = createContext<AuthContextType | null>(null)


// AUTH PROVIDER

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
    children
}) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // check if user is already logged in on app start
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("access_token")
            if (token) {
                try {
                    const response = await authAPI.getProfile()
                    setUser(response.data)
                }
                catch {
                    //token invalid or expired
                    localStorage.clear()
                }
            }
            setLoading(false)
        }
        initAuth()
    }, [])

    // LOGIN

    const login = async (email: string, password: string) => {
        const response = await authAPI.login({email, password})
        const {access_token, refresh_token} = response.data

        localStorage.setItem("access_token", access_token)
        localStorage.setItem("refresh_token", refresh_token)

        const profileResponse = await authAPI.getProfile()
        setUser(profileResponse.data)
    }

    // REGISTER

    const register = async (
        name: string,
        email: string,
        password: string
    ) => {
        await authAPI.register({name, email, password})
        await login(email, password)     // auto login after register
    }

    // LOGOUT

    const logout = () => {
        localStorage.clear()
        setUser(null)
        window.location.href = "/login"
    }

    const value: AuthContextType = {
        user, 
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

// CUSTOM HOOK TO USE AUTH CONTEXT

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { changePassword, checkAuthStatus, login, logout, signup, type AuthUser, type SignUpData } from "../services/authService"

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; errorAction?: string; errorActionText?: string }>
  signup: (userData: SignUpData) => Promise<{ success: boolean; error?: string; errorAction?: string; errorActionText?: string }>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => { },
  changePassword: async () => false,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const contextSessionId = Math.random().toString(36).substr(2, 9)
      console.log(`[AuthContext] 🔍 Starting authentication check [Session: ${contextSessionId}]`)

      try {
        const authStatus = await checkAuthStatus()

        console.log(`[AuthContext] ✅ Auth status received [Session: ${contextSessionId}]:`, {
          isAuthenticated: authStatus.isAuthenticated,
          hasUser: !!authStatus.user,
          userId: authStatus.user?.id,
        })

        setIsAuthenticated(authStatus.isAuthenticated)
        setUser(authStatus.user)

        if (authStatus.isAuthenticated && authStatus.user) {
          console.log(
            `[AuthContext] 🎉 User authenticated successfully [Session: ${contextSessionId}] [UserID: ${authStatus.user.id}]`,
          )
        } else {
          console.log(`[AuthContext] ℹ️ User not authenticated [Session: ${contextSessionId}]`)
        }
      } catch (error) {
        console.error(`[AuthContext] ❌ Auth check failed [Session: ${contextSessionId}]:`, error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
        console.log(`[AuthContext] ✅ Auth check completed [Session: ${contextSessionId}]`)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string; errorAction?: string; errorActionText?: string }> => {
    const contextSessionId = Math.random().toString(36).substr(2, 9)
    console.log(`[AuthContext] 🚀 Starting login process [Session: ${contextSessionId}] [Email: ${email}]`)

    try {
      const result = await login(email, password)

      console.log(`[AuthContext] 📋 Login result received [Session: ${contextSessionId}]:`, {
        success: result.success,
        hasUser: !!result.user,
        hasToken: !!result.token,
        error: result.error,
        errorAction: result.errorAction,
        errorActionText: result.errorActionText,
      })

      if (result.success && result.user && result.token) {
        console.log(`[AuthContext] ✅ Login successful, updating context state [Session: ${contextSessionId}]`)
        setIsAuthenticated(true)
        setUser(result.user)

        console.log(
          `[AuthContext] 🎉 Context state updated successfully [Session: ${contextSessionId}] [UserID: ${result.user.id}]`,
        )
        return { success: true }
      } else {
        console.error(`[AuthContext] ❌ Login failed [Session: ${contextSessionId}]:`, result.error)
        setIsAuthenticated(false)
        setUser(null)
        return {
          success: false,
          error: result.error,
          errorAction: result.errorAction,
          errorActionText: result.errorActionText
        }
      }
    } catch (error) {
      console.error(`[AuthContext] ❌ Login process failed [Session: ${contextSessionId}]:`, error)
      setIsAuthenticated(false)
      setUser(null)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed. Please try again."
      }
    }
  }

  const handleSignup = async (userData: SignUpData): Promise<{ success: boolean; error?: string; errorAction?: string; errorActionText?: string }> => {
    const contextSessionId = Math.random().toString(36).substr(2, 9)
    console.log(`[AuthContext] 🚀 Starting signup process [Session: ${contextSessionId}] [Email: ${userData.email}]`)

    try {
      const result = await signup(userData)

      console.log(`[AuthContext] 📋 Signup result received [Session: ${contextSessionId}]:`, {
        success: result.success,
        hasUser: !!result.user,
        hasToken: !!result.token,
        error: result.error,
        errorAction: result.errorAction,
        errorActionText: result.errorActionText,
      })

      if (result.success && result.user && result.token) {
        console.log(`[AuthContext] ✅ Signup successful, updating context state [Session: ${contextSessionId}]`)
        setIsAuthenticated(true)
        setUser(result.user)

        console.log(
          `[AuthContext] 🎉 Context state updated successfully [Session: ${contextSessionId}] [UserID: ${result.user.id}]`,
        )
        return { success: true }
      } else {
        console.error(`[AuthContext] ❌ Signup failed [Session: ${contextSessionId}]:`, result.error)
        setIsAuthenticated(false)
        setUser(null)
        return {
          success: false,
          error: result.error,
          errorAction: result.errorAction,
          errorActionText: result.errorActionText
        }
      }
    } catch (error) {
      console.error(`[AuthContext] ❌ Signup process failed [Session: ${contextSessionId}]:`, error)
      setIsAuthenticated(false)
      setUser(null)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Signup failed. Please try again."
      }
    }
  }

  const handleLogout = async (): Promise<void> => {
    const contextSessionId = Math.random().toString(36).substr(2, 9)
    console.log(`[AuthContext] 🚪 Starting logout process [Session: ${contextSessionId}]`)

    try {
      const result = await logout()

      console.log(`[AuthContext] 📋 Logout result [Session: ${contextSessionId}]:`, {
        success: result.success,
        error: result.error,
      })

      // Always clear context state regardless of logout result
      setIsAuthenticated(false)
      setUser(null)

      console.log(`[AuthContext] ✅ Context state cleared [Session: ${contextSessionId}]`)
    } catch (error) {
      console.error(`[AuthContext] ❌ Logout process failed [Session: ${contextSessionId}]:`, error)
      // Still clear context state even if logout fails
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const contextSessionId = Math.random().toString(36).substr(2, 9)
    console.log(`[AuthContext] 🔐 Starting password change process [Session: ${contextSessionId}]`)

    try {
      const result = await changePassword(currentPassword, newPassword)

      console.log(`[AuthContext] 📋 Password change result [Session: ${contextSessionId}]:`, {
        success: result.success,
        error: result.error,
      })

      if (result.success) {
        console.log(`[AuthContext] ✅ Password change successful [Session: ${contextSessionId}]`)
        return true
      } else {
        console.error(`[AuthContext] ❌ Password change failed [Session: ${contextSessionId}]:`, result.error)
        return false
      }
    } catch (error) {
      console.error(`[AuthContext] ❌ Password change process failed [Session: ${contextSessionId}]:`, error)
      return false
    }
  }

  // Log context state changes
  useEffect(() => {
    console.log(`[AuthContext] 🔄 Context state changed:`, {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userId: user?.id,
    })
  }, [isAuthenticated, isLoading, user])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated,
    isLoading,
    user,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    changePassword: handleChangePassword,
  }), [isAuthenticated, isLoading, user])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
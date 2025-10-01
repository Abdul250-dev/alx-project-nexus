import { STORAGE_KEYS } from "../utils/constants"
import firebase from "./firebase"
import { createUserProfile, getUserProfile } from "./userService"

// Declare global type for TypeScript
// Fixed version
declare global {
  interface GlobalThis {
    memoryStorage?: Map<string, string>
  }
}

// Enhanced Storage Service with better React Native compatibility
class StorageService {
  private secureStore: any = null
  private asyncStorage: any = null
  private initialized = false

  // Fix 1: Remove async operation from constructor
  constructor() {
    // Constructor is now synchronous
  }

  // Fix 1: Create separate initialization method
  private async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      console.log("[StorageService] 🚀 Initializing storage service...")

      // Fix 2: Use dynamic imports instead of require()
      try {
        const SecureStoreModule = await import("expo-secure-store")
        this.secureStore = SecureStoreModule.default || SecureStoreModule
        console.log("[StorageService] ✅ SecureStore initialized")
      } catch (error) {
        // Fix 3: Proper error typing
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn("[StorageService] ⚠️ SecureStore not available:", errorMessage)
        this.secureStore = null
      }

      // Fix 2 & 4: Use dynamic imports and proper type handling
      try {
        const AsyncStorageModule = await import("@react-native-async-storage/async-storage")
        this.asyncStorage = AsyncStorageModule.default || AsyncStorageModule
        console.log("[StorageService] ✅ AsyncStorage initialized")
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn("[StorageService] ⚠️ AsyncStorage not available:", errorMessage)
        this.asyncStorage = null
      }

      // Fix 5: Proper globalThis typing and memory storage initialization
      if (typeof globalThis !== 'undefined' && !(globalThis as any).memoryStorage) {
        (globalThis as any).memoryStorage = new Map<string, string>()
        console.log("[StorageService] ✅ Memory storage initialized")
      }

      this.initialized = true
      console.log("[StorageService] 🔧 Storage service initialization complete")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("[StorageService] ❌ Failed to initialize storage service:", errorMessage)
      this.initialized = true // Set to true to avoid infinite retry

      // Ensure we have at least memory storage
      try {
        if (typeof globalThis !== 'undefined' && !(globalThis as any).memoryStorage) {
          (globalThis as any).memoryStorage = new Map<string, string>()
        }
      } catch (memError) {
        const memErrorMessage = memError instanceof Error ? memError.message : String(memError)
        console.error("[StorageService] ❌ Failed to initialize memory storage:", memErrorMessage)
      }
    }
  }

  // Ensure initialization is complete before any operation
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  private async isSecureStoreReady(): Promise<boolean> {
    await this.ensureInitialized()

    if (!this.secureStore) return false

    try {
      return (
        typeof this.secureStore.setItemAsync === "function" &&
        typeof this.secureStore.getItemAsync === "function" &&
        typeof this.secureStore.deleteItemAsync === "function"
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn("[StorageService] SecureStore readiness check failed:", errorMessage)
      return false
    }
  }

  private async isAsyncStorageReady(): Promise<boolean> {
    await this.ensureInitialized()

    if (!this.asyncStorage) return false

    try {
      return (
        typeof this.asyncStorage.setItem === "function" &&
        typeof this.asyncStorage.getItem === "function" &&
        typeof this.asyncStorage.removeItem === "function"
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn("[StorageService] AsyncStorage readiness check failed:", errorMessage)
      return false
    }
  }

  private isMemoryStorageReady(): boolean {
    try {
      return (
        typeof globalThis !== 'undefined' &&
        (globalThis as any).memoryStorage instanceof Map
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn("[StorageService] Memory storage check failed:", errorMessage)
      return false
    }
  }

  // Fix 6: Reduce cognitive complexity by extracting methods
  async setItem(key: string, value: string): Promise<void> {
    const sessionInfo = this.createSessionInfo()
    console.log(`[StorageService] ${sessionInfo.timestamp} - Setting item with key: ${key} [Session: ${sessionInfo.id}]`)

    try {
      await this.ensureInitialized()
    } catch (initError) {
      const errorMessage = initError instanceof Error ? initError.message : String(initError)
      console.error(`[StorageService] ❌ Initialization failed [Session: ${sessionInfo.id}]:`, errorMessage)
      // Continue with memory storage fallback
    }

    this.validateStorageInput(key, value, sessionInfo.id)

    const stringValue = typeof value === "string" ? value : String(value)
    const errors: string[] = []

    // Try each storage method
    if (await this.trySecureStoreSet(key, stringValue, sessionInfo.id, errors)) return
    if (await this.tryAsyncStorageSet(key, stringValue, sessionInfo.id, errors)) return
    if (this.tryMemoryStorageSet(key, stringValue, sessionInfo.id, errors)) return

    // If all methods fail
    const finalError = `All storage methods failed: ${errors.join(', ')}`
    console.error(`[StorageService] ❌ ${finalError} [Session: ${sessionInfo.id}]`)
    throw new Error(finalError)
  }

  // Helper methods to reduce complexity
  private createSessionInfo() {
    return {
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substring(7)
    }
  }

  private validateStorageInput(key: string, value: string, sessionId: string): void {
    if (!key || typeof key !== "string" || key.trim().length === 0) {
      const error = `Invalid storage key provided: "${key}"`
      console.error(`[StorageService] ❌ ${error} [Session: ${sessionId}]`)
      throw new Error(error)
    }

    if (value === null || value === undefined) {
      const error = "Storage value cannot be null or undefined"
      console.error(`[StorageService] ❌ ${error} [Session: ${sessionId}]`)
      throw new Error(error)
    }
  }

  private async trySecureStoreSet(key: string, value: string, sessionId: string, errors: string[]): Promise<boolean> {
    if (await this.isSecureStoreReady()) {
      try {
        console.log(`[StorageService] 🔐 Using SecureStore... [Session: ${sessionId}]`)
        await this.secureStore.setItemAsync(key, value)
        console.log(`[StorageService] ✅ SecureStore setItem successful [Session: ${sessionId}]`)
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ SecureStore setItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`SecureStore: ${errorMessage}`)
      }
    }
    return false
  }

  private async tryAsyncStorageSet(key: string, value: string, sessionId: string, errors: string[]): Promise<boolean> {
    if (await this.isAsyncStorageReady()) {
      try {
        console.log(`[StorageService] 📱 Using AsyncStorage... [Session: ${sessionId}]`)
        await this.asyncStorage.setItem(key, value)
        console.log(`[StorageService] ✅ AsyncStorage setItem successful [Session: ${sessionId}]`)
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ AsyncStorage setItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`AsyncStorage: ${errorMessage}`)
      }
    }
    return false
  }

  private tryMemoryStorageSet(key: string, value: string, sessionId: string, errors: string[]): boolean {
    if (this.isMemoryStorageReady()) {
      try {
        console.log(`[StorageService] 🧠 Using Memory Storage... [Session: ${sessionId}]`)
          ; (globalThis as any).memoryStorage.set(key, value)
        console.log(`[StorageService] ✅ Memory Storage setItem successful [Session: ${sessionId}]`)
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ Memory Storage setItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`MemoryStorage: ${errorMessage}`)
      }
    }
    return false
  }

  async getItem(key: string): Promise<string | null> {
    const sessionInfo = this.createSessionInfo()
    console.log(`[StorageService] ${sessionInfo.timestamp} - Getting item with key: ${key} [Session: ${sessionInfo.id}]`)

    try {
      await this.ensureInitialized()
    } catch (initError) {
      const errorMessage = initError instanceof Error ? initError.message : String(initError)
      console.error(`[StorageService] ❌ Initialization failed [Session: ${sessionInfo.id}]:`, errorMessage)
      // Continue with memory storage fallback
    }

    this.validateStorageInput(key, "dummy", sessionInfo.id) // Use dummy value for validation

    const errors: string[] = []

    // Try each storage method
    const secureStoreValue = await this.trySecureStoreGet(key, sessionInfo.id, errors)
    if (secureStoreValue !== null) return secureStoreValue

    const asyncStorageValue = await this.tryAsyncStorageGet(key, sessionInfo.id, errors)
    if (asyncStorageValue !== null) return asyncStorageValue

    const memoryStorageValue = this.tryMemoryStorageGet(key, sessionInfo.id, errors)
    if (memoryStorageValue !== null) return memoryStorageValue

    // If all methods fail or return null
    console.log(`[StorageService] ℹ️ Item not found in any storage [Session: ${sessionInfo.id}]`)
    return null
  }

  private async trySecureStoreGet(key: string, sessionId: string, errors: string[]): Promise<string | null> {
    if (await this.isSecureStoreReady()) {
      try {
        console.log(`[StorageService] 🔐 Using SecureStore... [Session: ${sessionId}]`)
        const value = await this.secureStore.getItemAsync(key)
        console.log(`[StorageService] ✅ SecureStore getItem successful [Session: ${sessionId}]`)
        return value
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ SecureStore getItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`SecureStore: ${errorMessage}`)
      }
    }
    return null
  }

  private async tryAsyncStorageGet(key: string, sessionId: string, errors: string[]): Promise<string | null> {
    if (await this.isAsyncStorageReady()) {
      try {
        console.log(`[StorageService] 📱 Using AsyncStorage... [Session: ${sessionId}]`)
        const value = await this.asyncStorage.getItem(key)
        console.log(`[StorageService] ✅ AsyncStorage getItem successful [Session: ${sessionId}]`)
        return value
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ AsyncStorage getItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`AsyncStorage: ${errorMessage}`)
      }
    }
    return null
  }

  private tryMemoryStorageGet(key: string, sessionId: string, errors: string[]): string | null {
    if (this.isMemoryStorageReady()) {
      try {
        console.log(`[StorageService] 🧠 Using Memory Storage... [Session: ${sessionId}]`)
        const value = (globalThis as any).memoryStorage.get(key)
        console.log(`[StorageService] ✅ Memory Storage getItem successful [Session: ${sessionId}]`)
        return value || null
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ Memory Storage getItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`MemoryStorage: ${errorMessage}`)
      }
    }
    return null
  }

  async deleteItem(key: string): Promise<void> {
    const sessionInfo = this.createSessionInfo()
    console.log(`[StorageService] ${sessionInfo.timestamp} - Deleting item with key: ${key} [Session: ${sessionInfo.id}]`)

    try {
      await this.ensureInitialized()
    } catch (initError) {
      const errorMessage = initError instanceof Error ? initError.message : String(initError)
      console.error(`[StorageService] ❌ Initialization failed [Session: ${sessionInfo.id}]:`, errorMessage)
      // Continue with memory storage fallback
    }

    this.validateStorageInput(key, "dummy", sessionInfo.id) // Use dummy value for validation

    const errors: string[] = []

    // Try each storage method
    if (await this.trySecureStoreDelete(key, sessionInfo.id, errors)) return
    if (await this.tryAsyncStorageDelete(key, sessionInfo.id, errors)) return
    if (this.tryMemoryStorageDelete(key, sessionInfo.id, errors)) return

    // If all methods fail
    const finalError = `All storage methods failed: ${errors.join(', ')}`
    console.error(`[StorageService] ❌ ${finalError} [Session: ${sessionInfo.id}]`)
    throw new Error(finalError)
  }

  private async trySecureStoreDelete(key: string, sessionId: string, errors: string[]): Promise<boolean> {
    if (await this.isSecureStoreReady()) {
      try {
        console.log(`[StorageService] 🔐 Using SecureStore... [Session: ${sessionId}]`)
        await this.secureStore.deleteItemAsync(key)
        console.log(`[StorageService] ✅ SecureStore deleteItem successful [Session: ${sessionId}]`)
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ SecureStore deleteItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`SecureStore: ${errorMessage}`)
      }
    }
    return false
  }

  private async tryAsyncStorageDelete(key: string, sessionId: string, errors: string[]): Promise<boolean> {
    if (await this.isAsyncStorageReady()) {
      try {
        console.log(`[StorageService] 📱 Using AsyncStorage... [Session: ${sessionId}]`)
        await this.asyncStorage.removeItem(key)
        console.log(`[StorageService] ✅ AsyncStorage deleteItem successful [Session: ${sessionId}]`)
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ AsyncStorage deleteItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`AsyncStorage: ${errorMessage}`)
      }
    }
    return false
  }

  private tryMemoryStorageDelete(key: string, sessionId: string, errors: string[]): boolean {
    if (this.isMemoryStorageReady()) {
      try {
        console.log(`[StorageService] 🧠 Using Memory Storage... [Session: ${sessionId}]`)
          ; (globalThis as any).memoryStorage.delete(key)
        console.log(`[StorageService] ✅ Memory Storage deleteItem successful [Session: ${sessionId}]`)
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`[StorageService] ⚠️ Memory Storage deleteItem failed [Session: ${sessionId}]:`, errorMessage)
        errors.push(`MemoryStorage: ${errorMessage}`)
      }
    }
    return false
  }

  async getStorageStatus(): Promise<{
    initialized: boolean
    secureStore: boolean
    asyncStorage: boolean
    memoryStorage: boolean
    preferredMethod: string
  }> {
    await this.ensureInitialized()

    const secureStoreReady = await this.isSecureStoreReady()
    const asyncStorageReady = await this.isAsyncStorageReady()
    const memoryStorageReady = this.isMemoryStorageReady()

    let preferredMethod = "none"
    if (secureStoreReady) {
      preferredMethod = "secureStore"
    } else if (asyncStorageReady) {
      preferredMethod = "asyncStorage"
    } else if (memoryStorageReady) {
      preferredMethod = "memoryStorage"
    }

    return {
      initialized: this.initialized,
      secureStore: secureStoreReady,
      asyncStorage: asyncStorageReady,
      memoryStorage: memoryStorageReady,
      preferredMethod,
    }
  }
}

// Create singleton instance
const storageService = new StorageService()

// Type definitions
export interface AuthUser {
  id: string
  email: string
  displayName: string
  gender?: string
  birthDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface SignUpData {
  email: string
  password: string
  displayName: string
  gender: string
  birthDate: string
}

export interface AuthResponse {
  success: boolean
  user?: AuthUser
  token?: string
  error?: string
  errorAction?: string
  errorActionText?: string
}

export interface AuthStatus {
  isAuthenticated: boolean
  user: AuthUser | null
}

// Enhanced input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long" }
  }
  return { isValid: true }
}

const validateSignUpData = (userData: SignUpData): { isValid: boolean; message?: string } => {
  const { email, password, displayName, gender, birthDate } = userData

  if (!email || !validateEmail(email)) {
    return { isValid: false, message: "Valid email address is required" }
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return passwordValidation
  }

  if (!displayName || displayName.trim().length < 2) {
    return { isValid: false, message: "Display name must be at least 2 characters long" }
  }

  if (!gender || gender.trim().length === 0) {
    return { isValid: false, message: "Gender is required" }
  }

  if (!birthDate || birthDate.trim().length === 0) {
    return { isValid: false, message: "Birth date is required" }
  }

  return { isValid: true }
}

// Helper function to safely store token
const storeTokenSafely = async (token: string): Promise<void> => {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new Error("Invalid token provided for storage")
  }

  console.log("[AuthService] 🔐 Storing authentication token...")

  try {
    await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    console.log("[AuthService] ✅ Token stored successfully")
  } catch (storageError) {
    const errorMessage = storageError instanceof Error ? storageError.message : "Unknown storage error"
    console.error("[AuthService] ❌ Token storage failed:", storageError)
    throw new Error(`Token storage failed: ${errorMessage}`)
  }
}

// Enhanced Firebase error handling
const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Invalid email address format.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/email-already-in-use": "This email is already registered. Please try signing in instead, or use a different email address.",
    "auth/operation-not-allowed": "Email/password accounts are not enabled.",
    "auth/weak-password": "Password should be at least 6 characters long.",
    "auth/invalid-credential": "Invalid login credentials. Please check your email and password.",
    "auth/account-exists-with-different-credential": "An account already exists with this email.",
    "auth/credential-already-in-use": "This credential is already associated with a different account.",
  }

  return errorMessages[errorCode] || "An unexpected error occurred. Please try again."
}

// Enhanced error handling with specific actions for email-already-in-use
const getFirebaseErrorWithAction = (errorCode: string): { message: string; action?: string; actionText?: string } => {
  const errorActions: { [key: string]: { message: string; action?: string; actionText?: string } } = {
    "auth/email-already-in-use": {
      message: "This email is already registered.",
      action: "signin",
      actionText: "Try signing in instead"
    },
    "auth/user-not-found": {
      message: "No account found with this email address.",
      action: "signup",
      actionText: "Create a new account"
    },
    "auth/wrong-password": {
      message: "Incorrect password. Please try again."
    },
    "auth/invalid-email": {
      message: "Invalid email address format."
    },
    "auth/user-disabled": {
      message: "This account has been disabled. Please contact support."
    },
    "auth/too-many-requests": {
      message: "Too many failed attempts. Please try again later."
    },
    "auth/network-request-failed": {
      message: "Network error. Please check your internet connection."
    },
    "auth/operation-not-allowed": {
      message: "Email/password accounts are not enabled."
    },
    "auth/weak-password": {
      message: "Password should be at least 6 characters long."
    },
    "auth/invalid-credential": {
      message: "Invalid login credentials. Please check your email and password."
    },
    "auth/account-exists-with-different-credential": {
      message: "An account already exists with this email."
    },
    "auth/credential-already-in-use": {
      message: "This credential is already associated with a different account."
    },
  }

  return errorActions[errorCode] || { message: "An unexpected error occurred. Please try again." }
}

// ENHANCED SIGNIN FUNCTION
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // Add debug logging
  console.log("[AuthService] 🔍 Debug - storageService:", storageService)
  console.log("[AuthService] 🔍 Debug - STORAGE_KEYS:", STORAGE_KEYS)

  const startTime = Date.now()
  const sessionId = Math.random().toString(36).substr(2, 9)

  try {
    console.log(`[AuthService] 🚀 Starting login process [Session: ${sessionId}]`)
    console.log(`[AuthService] 📧 Email: ${email}`)

    // Input validation
    if (!email || !password) {
      const error = "Email and password are required"
      console.error(`[AuthService] ❌ Validation failed: ${error}`)
      return { success: false, error }
    }

    if (!validateEmail(email)) {
      const error = "Invalid email address format"
      console.error(`[AuthService] ❌ Email validation failed: ${error}`)
      return { success: false, error }
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      console.error(`[AuthService] ❌ Password validation failed: ${passwordValidation.message}`)
      return { success: false, error: passwordValidation.message }
    }

    // Check storage configuration
    if (!STORAGE_KEYS?.AUTH_TOKEN) {
      const error = "Storage configuration is missing"
      console.error(`[AuthService] ❌ ${error}`)
      return { success: false, error: "Configuration error. Please contact support." }
    }

    // Firebase authentication
    console.log(`[AuthService] 🔐 Authenticating with Firebase... [Session: ${sessionId}]`)
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password)
    const firebaseUser = userCredential.user

    if (!firebaseUser) {
      throw new Error("Firebase authentication failed - no user returned")
    }

    console.log(`[AuthService] ✅ Firebase login successful [Session: ${sessionId}] [UID: ${firebaseUser.uid}]`)

    // Get ID token
    console.log(`[AuthService] 🎫 Retrieving ID token... [Session: ${sessionId}]`)
    const token = await firebaseUser.getIdToken()

    if (!token) {
      throw new Error("Failed to retrieve authentication token")
    }

    console.log(`[AuthService] ✅ Token retrieved successfully [Session: ${sessionId}]`)

    // Store token securely
    await storeTokenSafely(token)

    // Get user profile from Firestore
    console.log(`[AuthService] 👤 Fetching user profile... [Session: ${sessionId}]`)
    console.log("userId", firebaseUser.uid, "email", firebaseUser.email)
    const userProfile = await getUserProfile(firebaseUser.uid)

    if (userProfile) {
      console.log(`[AuthService] ✅ User profile fetched successfully [Session: ${sessionId}]`)
    } else {
      console.warn(`[AuthService] ⚠️ No user profile found, using Firebase data [Session: ${sessionId}]`)
    }

    // Construct user object
    const authUser: AuthUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      displayName: userProfile?.displayName || firebaseUser.displayName || "User",
      gender: userProfile?.gender,
      birthDate: userProfile?.birthDate,
      createdAt: userProfile?.createdAt,
      updatedAt: userProfile?.updatedAt,
    }

    const duration = Date.now() - startTime
    console.log(`[AuthService] 🎉 Login completed successfully [Session: ${sessionId}] [Duration: ${duration}ms]`)

    return {
      success: true,
      user: authUser,
      token,
    }
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    console.error(`[AuthService] ❌ Login failed [Session: ${sessionId}] [Duration: ${duration}ms]`)
    console.error(`[AuthService] Error details:`, {
      code: (error as any)?.code,
      message: error instanceof Error ? error.message : String(error),
      stack: (error as any)?.stack,
    })

    if ((error as any)?.code) {
      const errorInfo = getFirebaseErrorWithAction((error as any).code)
      return {
        success: false,
        error: errorInfo.message,
        errorAction: errorInfo.action,
        errorActionText: errorInfo.actionText
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."
    return {
      success: false,
      error: errorMessage,
    }
  }
}

// ENHANCED SIGNUP FUNCTION
export const signup = async (userData: SignUpData): Promise<AuthResponse> => {
  const sessionId = Math.random().toString(36).substr(2, 9)
  console.log(`[AuthService] 🚀 Starting signup process [Session: ${sessionId}] [Email: ${userData.email}]`)

  try {
    // Validate input
    const validation = validateSignUpData(userData)
    if (!validation.isValid) {
      console.error(`[AuthService] ❌ Invalid signup data [Session: ${sessionId}]: ${validation.message}`)
      return { success: false, error: validation.message || "Invalid signup data" }
    }

    console.log(`[AuthService] ✅ Input validation passed [Session: ${sessionId}]`)

    // Attempt Firebase user creation using compat API
    const auth = firebase.auth()
    const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password)
    const firebaseUser = userCredential.user

    if (!firebaseUser) {
      console.error(`[AuthService] ❌ No user returned from Firebase [Session: ${sessionId}]`)
      return { success: false, error: "Failed to create user account" }
    }

    console.log(`[AuthService] ✅ Firebase user creation successful [Session: ${sessionId}] [FirebaseUID: ${firebaseUser.uid}]`)

    // Create user profile
    const newUserData = {
      email: userData.email,
      displayName: userData.displayName,
      gender: userData.gender,
      birthDate: userData.birthDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const profileCreated = await createUserProfile(firebaseUser.uid, newUserData)

    if (!profileCreated) {
      console.error(`[AuthService] ❌ Failed to create user profile [Session: ${sessionId}]`)

      // Clean up Firebase user if profile creation fails
      try {
        await firebaseUser.delete()
        console.log(`[AuthService] 🧹 Cleaned up Firebase user after profile creation failure [Session: ${sessionId}]`)
      } catch (deleteError) {
        console.warn(`[AuthService] ⚠️ Failed to clean up Firebase user [Session: ${sessionId}]:`, deleteError)
      }

      return { success: false, error: "Failed to create user profile" }
    }

    console.log(`[AuthService] ✅ User profile created successfully [Session: ${sessionId}]`)

    // Create user profile object for response
    const userProfile: AuthUser = {
      id: firebaseUser.uid,
      email: userData.email,
      displayName: userData.displayName,
      gender: userData.gender,
      birthDate: userData.birthDate,
      createdAt: newUserData.createdAt,
      updatedAt: newUserData.updatedAt,
    }

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken()
    if (!token) {
      console.error(`[AuthService] ❌ Failed to get Firebase ID token [Session: ${sessionId}]`)
      return { success: false, error: "Failed to get authentication token" }
    }

    console.log(`[AuthService] ✅ Firebase ID token obtained [Session: ${sessionId}]`)

    // Store token securely
    try {
      await storeTokenSafely(token)
      console.log(`[AuthService] ✅ Token stored securely [Session: ${sessionId}]`)
    } catch (storageError) {
      console.warn(`[AuthService] ⚠️ Failed to store token securely [Session: ${sessionId}]:`, storageError)
      // Continue anyway as the user is still authenticated
    }

    console.log(`[AuthService] 🎉 Signup process completed successfully [Session: ${sessionId}] [UserID: ${userProfile.id}]`)

    return {
      success: true,
      user: userProfile,
      token,
    }
  } catch (error: any) {
    console.error(`[AuthService] ❌ Signup process failed [Session: ${sessionId}]:`, error)

    // Handle specific Firebase auth errors
    if (error.code) {
      const errorInfo = getFirebaseErrorWithAction(error.code)
      console.error(`[AuthService] ❌ Firebase error [Session: ${sessionId}]: ${error.code} - ${errorInfo.message}`)

      return {
        success: false,
        error: errorInfo.message,
        errorAction: errorInfo.action,
        errorActionText: errorInfo.actionText
      }
    }

    // Handle generic errors
    const errorMessage = error.message || "An unexpected error occurred during signup"
    console.error(`[AuthService] ❌ Generic error [Session: ${sessionId}]: ${errorMessage}`)
    return { success: false, error: errorMessage }
  }
}

// ENHANCED LOGOUT FUNCTION
export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  const sessionId = Math.random().toString(36).substr(2, 9)
  console.log(`[AuthService] 🚪 Starting logout process [Session: ${sessionId}]`)

  try {
    // Sign out from Firebase using compat API
    const auth = firebase.auth()
    await auth.signOut()
    console.log(`[AuthService] ✅ Firebase signout successful [Session: ${sessionId}]`)

    // Clear stored token
    try {
      await storageService.deleteItem(STORAGE_KEYS.AUTH_TOKEN)
      console.log(`[AuthService] ✅ Stored token cleared [Session: ${sessionId}]`)
    } catch (storageError) {
      console.warn(`[AuthService] ⚠️ Failed to clear stored token [Session: ${sessionId}]:`, storageError)
      // Continue anyway as Firebase signout was successful
    }

    console.log(`[AuthService] 🎉 Logout process completed successfully [Session: ${sessionId}]`)

    return { success: true }
  } catch (error: any) {
    console.error(`[AuthService] ❌ Logout process failed [Session: ${sessionId}]:`, error)

    // Handle specific Firebase auth errors
    if (error.code) {
      const errorMessage = getFirebaseErrorMessage(error.code)
      console.error(`[AuthService] ❌ Firebase error [Session: ${sessionId}]: ${error.code} - ${errorMessage}`)
      return { success: false, error: errorMessage }
    }

    // Handle generic errors
    const errorMessage = error.message || "An unexpected error occurred during logout"
    console.error(`[AuthService] ❌ Generic error [Session: ${sessionId}]: ${errorMessage}`)
    return { success: false, error: errorMessage }
  }
}

// ENHANCED AUTH STATUS CHECK
export const checkAuthStatus = async (): Promise<AuthStatus> => {
  const sessionId = Math.random().toString(36).substr(2, 9)
  console.log(`[AuthService] 🔍 Starting auth status check [Session: ${sessionId}]`)

  try {
    // Check Firebase auth state using compat API
    const auth = firebase.auth()
    const firebaseUser = auth.currentUser

    if (!firebaseUser) {
      console.log(`[AuthService] ℹ️ No Firebase user found [Session: ${sessionId}]`)
      return { isAuthenticated: false, user: null }
    }

    console.log(`[AuthService] ✅ Firebase user found [Session: ${sessionId}] [FirebaseUID: ${firebaseUser.uid}]`)

    // Get user profile from Firestore
    const userProfile = await getUserProfile(firebaseUser.uid)

    if (!userProfile) {
      console.log(`[AuthService] ℹ️ No user profile found for Firebase user [Session: ${sessionId}]`)
      return { isAuthenticated: false, user: null }
    }

    console.log(`[AuthService] ✅ User profile retrieved [Session: ${sessionId}] [UserID: ${userProfile.id}]`)

    return {
      isAuthenticated: true,
      user: userProfile,
    }
  } catch (error: any) {
    console.error(`[AuthService] ❌ Auth status check failed [Session: ${sessionId}]:`, error)
    return { isAuthenticated: false, user: null }
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: any | null) => void) => {
  const auth = firebase.auth()
  return auth.onAuthStateChanged(callback)
}

// CHANGE PASSWORD FUNCTION
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  const sessionId = Math.random().toString(36).substr(2, 9)
  console.log(`[AuthService] 🔐 Starting password change process [Session: ${sessionId}]`)

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      console.error(`[AuthService] ❌ Missing password parameters [Session: ${sessionId}]`)
      return { success: false, error: "Current password and new password are required" }
    }

    if (newPassword.length < 6) {
      console.error(`[AuthService] ❌ New password too short [Session: ${sessionId}]`)
      return { success: false, error: "New password must be at least 6 characters long" }
    }

    if (currentPassword === newPassword) {
      console.error(`[AuthService] ❌ New password same as current [Session: ${sessionId}]`)
      return { success: false, error: "New password must be different from current password" }
    }

    console.log(`[AuthService] ✅ Input validation passed [Session: ${sessionId}]`)

    // Get current Firebase user
    const auth = firebase.auth()
    const currentUser = auth.currentUser

    if (!currentUser) {
      console.error(`[AuthService] ❌ No authenticated user found [Session: ${sessionId}]`)
      return { success: false, error: "No authenticated user found. Please log in again." }
    }

    if (!currentUser.email) {
      console.error(`[AuthService] ❌ User has no email [Session: ${sessionId}]`)
      return { success: false, error: "User account has no email address" }
    }

    console.log(`[AuthService] ✅ Current user found [Session: ${sessionId}] [FirebaseUID: ${currentUser.uid}]`)

    // Re-authenticate user with current password
    console.log(`[AuthService] 🔐 Re-authenticating user [Session: ${sessionId}]`)
    const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword)
    await currentUser.reauthenticateWithCredential(credential)
    console.log(`[AuthService] ✅ Re-authentication successful [Session: ${sessionId}]`)

    // Update password
    console.log(`[AuthService] 🔑 Updating password [Session: ${sessionId}]`)
    await currentUser.updatePassword(newPassword)
    console.log(`[AuthService] ✅ Password update successful [Session: ${sessionId}]`)

    // Get new token after password change
    const newToken = await currentUser.getIdToken(true) // Force refresh
    if (newToken) {
      try {
        await storeTokenSafely(newToken)
        console.log(`[AuthService] ✅ New token stored securely [Session: ${sessionId}]`)
      } catch (storageError) {
        console.warn(`[AuthService] ⚠️ Failed to store new token [Session: ${sessionId}]:`, storageError)
        // Continue anyway as password change was successful
      }
    }

    console.log(`[AuthService] 🎉 Password change completed successfully [Session: ${sessionId}]`)

    return { success: true }
  } catch (error: any) {
    console.error(`[AuthService] ❌ Password change failed [Session: ${sessionId}]:`, error)

    // Handle specific Firebase auth errors
    if (error.code) {
      const errorMessage = getFirebaseErrorMessage(error.code)
      console.error(`[AuthService] ❌ Firebase error [Session: ${sessionId}]: ${error.code} - ${errorMessage}`)
      return { success: false, error: errorMessage }
    }

    // Handle generic errors
    const errorMessage = error.message || "An unexpected error occurred while changing password"
    console.error(`[AuthService] ❌ Generic error [Session: ${sessionId}]: ${errorMessage}`)
    return { success: false, error: errorMessage }
  }
}


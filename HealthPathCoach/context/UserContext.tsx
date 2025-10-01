import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { getUserProfile, updateUserProfile, type UserProfile, type UserProfileData } from "../services/userService"

// Updated UserData interface to match what we actually get from getUserProfile
interface UserData {
  id: string
  email?: string
  displayName?: string
  gender?: string
  birthDate?: string
  createdAt?: string 
  updatedAt?: string
  // Add other user properties as needed
  [key: string]: any
}

type UserContextType = {
  userData: UserData | null
  loading: boolean
  updateUser: (data: Partial<UserProfileData>) => Promise<boolean>
  refreshUserData: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  userData: null,
  loading: true,
  updateUser: async () => false,
  refreshUserData: async () => {},
})

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async (): Promise<void> => {
    if (!user?.id) return

    setLoading(true)
    try {
      const profile: UserProfile | null = await getUserProfile(user.id)
      
      if (profile) {
        // Transform UserProfile to UserData without id duplication
        const { id, ...profileRest } = profile
        const userData: UserData = {
          id, // Use the id from profile
          ...profileRest // Spread the rest of the properties
        }
        
        setUserData(userData)
      } else {
        setUserData(null)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const updateUser = useCallback(async (data: Partial<UserProfileData>): Promise<boolean> => {
    if (!user?.id) return false

    try {
      const success = await updateUserProfile(user.id, data)
      if (success) {
        await loadUserData() // Refresh user data
      }
      return success
    } catch (error) {
      console.error("Error updating user data:", error)
      return false
    }
  }, [user?.id, loadUserData])

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    } else {
      setUserData(null)
      setLoading(false)
    }
  }, [isAuthenticated, user, loadUserData])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<UserContextType>(() => ({
    userData,
    loading,
    updateUser,
    refreshUserData: loadUserData,
  }), [userData, loading, updateUser, loadUserData])

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
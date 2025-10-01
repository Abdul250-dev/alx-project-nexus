import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import * as securityService from "../services/securityService"

type SecurityContextType = {
  isSecurityEnabled: boolean
  isAuthenticated: boolean
  securityMethod: "biometric" | "pin" | null
  authenticate: () => Promise<boolean>
  authenticateWithPIN: (pin: string) => Promise<boolean>
  enableSecurity: (method: "biometric" | "pin") => Promise<boolean>
  disableSecurity: () => Promise<boolean>
  setPIN: (pin: string) => Promise<boolean>
}

const SecurityContext = createContext<SecurityContextType>({
  isSecurityEnabled: false,
  isAuthenticated: false,
  securityMethod: null,
  authenticate: async () => false,
  authenticateWithPIN: async () => false,
  enableSecurity: async () => false,
  disableSecurity: async () => false,
  setPIN: async () => false,
})

export const useSecurity = () => useContext(SecurityContext)

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [securityMethod, setSecurityMethod] = useState<"biometric" | "pin" | null>(null)

  useEffect(() => {
    const checkSecuritySettings = async () => {
      const enabled = await securityService.isSecurityEnabled()
      const method = await securityService.getSecurityMethod()

      setIsSecurityEnabled(enabled)
      setSecurityMethod(method)

      // If security is not enabled, consider the user authenticated
      if (!enabled) {
        setIsAuthenticated(true)
      }
    }

    checkSecuritySettings()
  }, [])

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isSecurityEnabled) {
      setIsAuthenticated(true)
      return true
    }

    let success = false

    if (securityMethod === "biometric") {
      success = await securityService.authenticateWithBiometrics()
    } else if (securityMethod === "pin") {
      // PIN authentication is handled in the PIN input screen
      // This would be called after PIN verification
      return false
    }

    setIsAuthenticated(success)
    return success
  }, [isSecurityEnabled, securityMethod])

  const authenticateWithPIN = useCallback(async (pin: string): Promise<boolean> => {
    const success = await securityService.authenticateWithPIN(pin)
    setIsAuthenticated(success)
    return success
  }, [])

  const enableSecurity = useCallback(async (method: "biometric" | "pin"): Promise<boolean> => {
    const success = await securityService.enableSecurity(method)

    if (success) {
      setIsSecurityEnabled(true)
      setSecurityMethod(method)
    }

    return success
  }, [])

  const disableSecurity = useCallback(async (): Promise<boolean> => {
    const success = await securityService.disableSecurity()

    if (success) {
      setIsSecurityEnabled(false)
      setIsAuthenticated(true)
    }

    return success
  }, [])

  const setPIN = useCallback(async (pin: string): Promise<boolean> => {
    const success = await securityService.setPIN(pin)
    return success
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isSecurityEnabled,
      isAuthenticated,
      securityMethod,
      authenticate,
      authenticateWithPIN,
      enableSecurity,
      disableSecurity,
      setPIN,
    }),
    [
      isSecurityEnabled,
      isAuthenticated,
      securityMethod,
      authenticate,
      authenticateWithPIN,
      enableSecurity,
      disableSecurity,
      setPIN,
    ]
  )

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  )
}
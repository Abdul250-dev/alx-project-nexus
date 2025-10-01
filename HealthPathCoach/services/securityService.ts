import * as LocalAuthentication from "expo-local-authentication"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

// Storage keys
const SECURITY_ENABLED_KEY = "security_enabled"
const SECURITY_METHOD_KEY = "security_method"

// Check if device supports biometric authentication
export const isBiometricAvailable = async (): Promise<boolean> => {
  const compatible = await LocalAuthentication.hasHardwareAsync()
  return compatible
}

// Get available biometric types
export const getAvailableBiometricTypes = async (): Promise<string[]> => {
  const types = []
  const hasFingerprint = await LocalAuthentication.isEnrolledAsync()

  if (hasFingerprint) {
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      types.push("fingerprint")
    }

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      types.push("facial")
    }
  }

  return types
}

// Get biometric prompt message based on available types
export const getBiometricPromptMessage = async (): Promise<string> => {
  const types = await getAvailableBiometricTypes()

  if (types.includes("facial")) {
    return "Authenticate with Face ID"
  } else if (types.includes("fingerprint")) {
    return Platform.OS === "ios" ? "Authenticate with Touch ID" : "Authenticate with Fingerprint"
  }

  return "Authenticate"
}

// Enable security
export const enableSecurity = async (method: "biometric" | "pin"): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(SECURITY_ENABLED_KEY, "true")
    await SecureStore.setItemAsync(SECURITY_METHOD_KEY, method)
    return true
  } catch (error) {
    console.error("Error enabling security:", error)
    return false
  }
}

// Disable security
export const disableSecurity = async (): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(SECURITY_ENABLED_KEY, "false")
    return true
  } catch (error) {
    console.error("Error disabling security:", error)
    return false
  }
}

// Check if security is enabled
export const isSecurityEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(SECURITY_ENABLED_KEY)
    return enabled === "true"
  } catch (error) {
    console.error("Error checking security status:", error)
    return false
  }
}

// Get security method
export const getSecurityMethod = async (): Promise<"biometric" | "pin" | null> => {
  try {
    const method = await SecureStore.getItemAsync(SECURITY_METHOD_KEY)
    return (method as "biometric" | "pin") || null
  } catch (error) {
    console.error("Error getting security method:", error)
    return null
  }
}

// Authenticate with biometrics
export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to access your health information",
      fallbackLabel: "Use PIN",
      disableDeviceFallback: false,
    })

    return result.success
  } catch (error) {
    console.error("Biometric authentication error:", error)
    return false
  }
}

// Authenticate with PIN
export const authenticateWithPIN = async (enteredPIN: string): Promise<boolean> => {
  try {
    const storedPIN = await SecureStore.getItemAsync("security_pin")
    return storedPIN === enteredPIN
  } catch (error) {
    console.error("PIN authentication error:", error)
    return false
  }
}

// Set PIN
export const setPIN = async (pin: string): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync("security_pin", pin)
    return true
  } catch (error) {
    console.error("Error setting PIN:", error)
    return false
  }
}

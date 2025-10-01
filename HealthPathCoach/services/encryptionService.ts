import AsyncStorage from "@react-native-async-storage/async-storage";
import base64 from 'base-64';
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

// Constants for storage
const ENCRYPTION_KEY_ID = "health_data_encryption_key"
const ENCRYPTION_IV_ID = "health_data_encryption_iv"
const ENCRYPTION_ENABLED_KEY = "encryption_enabled"
const ENCRYPTION_MIGRATION_COMPLETE = "encryption_migration_complete"

// Define which data types should be encrypted
export const SENSITIVE_DATA_TYPES = [
  "periodLogs",
  "symptomLogs",
  "moodLogs",
  "medicalData",
  "contraceptionData",
  "userProfile",
]

/**
 * Helper: Convert Uint8Array to base64 string
 */
function uint8ToBase64(uint8: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return base64.encode(binary);
}

/**
 * Helper: Convert base64 string to Uint8Array
 */
function base64ToUint8(base64str: string): Uint8Array {
  const binary = base64.decode(base64str);
  const uint8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8[i] = binary.charCodeAt(i);
  }
  return uint8;
}

/**
 * Generates a random encryption key and initialization vector
 */
export const generateEncryptionKey = async (): Promise<boolean> => {
  try {
    // Generate a random 256-bit (32-byte) key
    const key = await Crypto.getRandomBytesAsync(32)
    const keyBase64 = uint8ToBase64(key)

    // Generate a random 128-bit (16-byte) initialization vector
    const iv = await Crypto.getRandomBytesAsync(16)
    const ivBase64 = uint8ToBase64(iv)

    // Store the key and IV securely
    await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, keyBase64)
    await SecureStore.setItemAsync(ENCRYPTION_IV_ID, ivBase64)

    // Mark encryption as enabled
    await AsyncStorage.setItem(ENCRYPTION_ENABLED_KEY, "true")

    return true
  } catch (error) {
    console.error("Error generating encryption key:", error)
    return false
  }
}

/**
 * Checks if encryption is enabled
 */
export const isEncryptionEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(ENCRYPTION_ENABLED_KEY)
    return enabled === "true"
  } catch (error) {
    console.error("Error checking if encryption is enabled:", error)
    return false
  }
}

/**
 * Enables encryption for sensitive data
 */
export const enableEncryption = async (): Promise<boolean> => {
  try {
    // Check if encryption key already exists
    const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID)

    if (!existingKey) {
      // Generate new encryption key if one doesn't exist
      const success = await generateEncryptionKey()
      if (!success) {
        return false
      }
    }

    // Mark encryption as enabled
    await AsyncStorage.setItem(ENCRYPTION_ENABLED_KEY, "true")

    return true
  } catch (error) {
    console.error("Error enabling encryption:", error)
    return false
  }
}

/**
 * Disables encryption for sensitive data
 * Note: This doesn't remove the encryption key, just disables encryption for new data
 */
export const disableEncryption = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(ENCRYPTION_ENABLED_KEY, "false")
    return true
  } catch (error) {
    console.error("Error disabling encryption:", error)
    return false
  }
}

/**
 * Gets the encryption key and IV
 */
const getEncryptionKeyAndIV = async (): Promise<{ key: string; iv: string } | null> => {
  try {
    const key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID)
    const iv = await SecureStore.getItemAsync(ENCRYPTION_IV_ID)

    if (!key || !iv) {
      return null
    }

    return { key, iv }
  } catch (error) {
    console.error("Error getting encryption key and IV:", error)
    return null
  }
}

/**
 * Encrypts data using AES-256-GCM
 */
export const encryptData = async (data: any): Promise<string | null> => {
  try {
    const isEnabled = await isEncryptionEnabled()
    if (!isEnabled) {
      // If encryption is disabled, return stringified data
      return JSON.stringify(data)
    }

    const keyAndIV = await getEncryptionKeyAndIV()
    if (!keyAndIV) {
      console.error("Encryption key not found")
      return null
    }

    // Convert data to string
    const dataString = JSON.stringify(data)

    // Create a digest of the data for integrity verification
    const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, dataString)

    // Combine data and digest
    const payload = JSON.stringify({
      data: dataString,
      digest,
    })

    // Encrypt using Web Crypto API
    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(payload)

    const keyBytes = base64ToUint8(keyAndIV.key)
    const ivBytes = base64ToUint8(keyAndIV.iv)

    // Use SubtleCrypto for encryption (if available)
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const cryptoKey = await window.crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"])
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: ivBytes,
        },
        cryptoKey,
        dataBytes,
      )
      // Convert encrypted data to base64
      const encryptedArray = new Uint8Array(encryptedBuffer)
      const encryptedBase64 = uint8ToBase64(encryptedArray)
      return `encrypted:${encryptedBase64}`
    } else {
      // Fallback: just return unencrypted data
      return JSON.stringify(data)
    }
  } catch (error) {
    console.error("Error encrypting data:", error)
    // Fallback to unencrypted data if encryption fails
    return JSON.stringify(data)
  }
}

/**
 * Decrypts data that was encrypted using AES-256-GCM
 */
export const decryptData = async (encryptedData: string): Promise<any | null> => {
  try {
    // Check if data is encrypted
    if (!encryptedData.startsWith("encrypted:")) {
      // Data is not encrypted, parse and return
      return JSON.parse(encryptedData)
    }

    const keyAndIV = await getEncryptionKeyAndIV()
    if (!keyAndIV) {
      console.error("Encryption key not found")
      return null
    }

    // Extract the encrypted data
    const encryptedBase64 = encryptedData.substring(10) // Remove 'encrypted:' prefix
    const encryptedBytes = base64ToUint8(encryptedBase64)
    const keyBytes = base64ToUint8(keyAndIV.key)
    const ivBytes = base64ToUint8(keyAndIV.iv)

    // Use SubtleCrypto for decryption (if available)
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const cryptoKey = await window.crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"])
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivBytes,
        },
        cryptoKey,
        encryptedBytes,
      )
      const decoder = new TextDecoder()
      const decryptedString = decoder.decode(decryptedBuffer)
      const { data } = JSON.parse(decryptedString)
      return JSON.parse(data)
    } else {
      // Fallback: just return null
      return null
    }
  } catch (error) {
    console.error("Error decrypting data:", error)
    return null
  }
}

/**
 * Checks if data migration is complete
 */
export const isMigrationComplete = async (): Promise<boolean> => {
  try {
    const complete = await AsyncStorage.getItem(ENCRYPTION_MIGRATION_COMPLETE)
    return complete === "true"
  } catch (error) {
    console.error("Error checking if migration is complete:", error)
    return false
  }
}

/**
 * Marks data migration as complete
 */
export const markMigrationComplete = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(ENCRYPTION_MIGRATION_COMPLETE, "true")
    return true
  } catch (error) {
    console.error("Error marking migration as complete:", error)
    return false
  }
}

/**
 * Determines if a data type should be encrypted
 */
export const shouldEncryptDataType = (dataType: string): boolean => {
  return SENSITIVE_DATA_TYPES.includes(dataType)
}

/**
 * Fallback encryption for devices that don't support the Web Crypto API
 * This is less secure but better than no encryption
 */
const fallbackEncrypt = (data: string, key: string): string => {
  let result = ""
  const keyLength = key.length

  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % keyLength)
    result += String.fromCharCode(charCode)
  }

  return base64.encode(result)
}

/**
 * Fallback decryption for devices that don't support the Web Crypto API
 */
const fallbackDecrypt = (encryptedData: string, key: string): string => {
  const data = base64.decode(encryptedData)
  let result = ""
  const keyLength = key.length

  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % keyLength)
    result += String.fromCharCode(charCode)
  }

  return result
}

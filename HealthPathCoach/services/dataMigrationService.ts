import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"
import * as encryptionService from "./encryptionService"
import firebase from "./firebase"

/**
 * Migrates existing unencrypted data to encrypted format
 */
export const migrateDataToEncrypted = async (): Promise<boolean> => {
  try {
    // Check if migration is already complete
    const migrationComplete = await encryptionService.isMigrationComplete()
    if (migrationComplete) {
      return true
    }

    // Check if encryption is enabled
    const encryptionEnabled = await encryptionService.isEncryptionEnabled()
    if (!encryptionEnabled) {
      // Enable encryption first
      const success = await encryptionService.enableEncryption()
      if (!success) {
        return false
      }
    }

    // Get current user
    const user = firebase.auth().currentUser

    if (!user) {
      console.error("No user logged in")
      return false
    }

    // Migrate Firestore data
    await migrateFirestoreData(user.uid)

    // Migrate AsyncStorage data
    await migrateAsyncStorageData()

    // Mark migration as complete
    await encryptionService.markMigrationComplete()

    return true
  } catch (error) {
    console.error("Error migrating data:", error)
    return false
  }
}

/**
 * Migrates Firestore data to encrypted format
 */
const migrateFirestoreData = async (userId: string): Promise<void> => {
  try {
    const db = firebase.firestore()

    // Get all sensitive data collections
    for (const dataType of encryptionService.SENSITIVE_DATA_TYPES) {
      // Skip userProfile as it's handled differently
      if (dataType === "userProfile") continue

      const collectionRef = db.collection("users").doc(userId).collection(dataType)
      const snapshot = await collectionRef.get()

      // Process each document
      snapshot.forEach(async (docSnapshot) => {
        const data = docSnapshot.data()

        // Encrypt the data
        const encryptedData = await encryptionService.encryptData(data)

        if (encryptedData) {
          // Update the document with encrypted data
          await docSnapshot.ref.set({
            encryptedData,
            isEncrypted: true,
            updatedAt: new Date(),
          })
        }
      })
    }

    // Handle user profile separately
    const userDocRef = db.collection("users").doc(userId)
    const userDoc = await userDocRef.get()

    if (userDoc.exists) {
      const userData = userDoc.data()

      // Encrypt sensitive user data
      const sensitiveFields = ["medicalHistory", "personalInfo", "healthMetrics"]
      const encryptedUserData = { ...userData }

      for (const field of sensitiveFields) {
        if (userData[field]) {
          const encryptedField = await encryptionService.encryptData(userData[field])
          if (encryptedField) {
            encryptedUserData[field] = encryptedField
            encryptedUserData[`${field}Encrypted`] = true
          }
        }
      }

      // Update user document
      await userDocRef.set(encryptedUserData)
    }
  } catch (error) {
    console.error("Error migrating Firestore data:", error)
    throw error
  }
}

/**
 * Migrates AsyncStorage data to encrypted format
 */
const migrateAsyncStorageData = async (): Promise<void> => {
  try {
    // Get all AsyncStorage keys
    const keys = await AsyncStorage.getAllKeys()

    // Filter for sensitive data keys
    const sensitiveKeys = keys.filter((key) => {
      return encryptionService.SENSITIVE_DATA_TYPES.some((type) => key.includes(type))
    })

    // Process each sensitive key
    for (const key of sensitiveKeys) {
      const data = await AsyncStorage.getItem(key)

      if (data) {
        try {
          // Parse the data
          const parsedData = JSON.parse(data)

          // Encrypt the data
          const encryptedData = await encryptionService.encryptData(parsedData)

          if (encryptedData) {
            // Store the encrypted data
            await AsyncStorage.setItem(key, encryptedData)
          }
        } catch (e) {
          // Skip if data is not valid JSON
          console.warn(`Skipping migration for ${key}: not valid JSON`)
        }
      }
    }
  } catch (error) {
    console.error("Error migrating AsyncStorage data:", error)
    throw error
  }
}

/**
 * Shows a migration prompt to the user
 */
export const showMigrationPrompt = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    Alert.alert(
      "Enhance Your Data Security",
      "We can encrypt your health data for additional security. This is recommended and will protect your sensitive information.",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Encrypt My Data",
          onPress: async () => {
            const success = await migrateDataToEncrypted()
            resolve(success)
          },
        },
      ],
      { cancelable: false },
    )
  })
}

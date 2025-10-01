import "firebase/compat/functions";
import firebase from "./firebase";

// Define Partner type
export interface Partner {
  id: string
  name?: string
  email: string
}

// Define UserProfile type to match what's stored in Firestore
export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  gender?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
  partnerId?: string | null;
  partnerCode?: string | null;
  [key: string]: any; // Allow for additional fields
}

// Define the data structure for creating/updating user profiles
export interface UserProfileData {
  email: string;
  displayName: string;
  gender?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
  partnerId?: string | null;
  partnerCode?: string | null;
  [key: string]: any; // Allow for additional fields
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!userId) {
      console.log("No user ID provided to getUserProfile")
      return null
    }

    const db = firebase.firestore()
    const userRef = db.collection("users").doc(userId)
    console.log("Fetching user profile with ID:", userId)

    const userDoc = await userRef.get()

    if (userDoc.exists) {
      console.log("User document found:", userDoc.data())
      const data = userDoc.data()

      if (!data) {
        return null
      }

      // Fix legacy boolean partnerId values
      if (typeof data.partnerId === 'boolean') {
        console.log("Fixing legacy boolean partnerId for user:", userId)
        await userRef.update({
          partnerId: null,
          updatedAt: new Date().toISOString(),
        })
        data.partnerId = null
      }

      return {
        id: userDoc.id,
        ...data
      } as UserProfile
    } else {
      console.log("No user profile found for ID:", userId)
      return null
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Create user profile
export const createUserProfile = async (userId: string, userData: UserProfileData): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Cannot create profile: No user ID provided")
      return false
    }

    const db = firebase.firestore()
    await db.collection("users").doc(userId).set({
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return true
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (userId: string, userData: Partial<UserProfileData>): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Cannot update profile: No user ID provided")
      return false
    }

    const db = firebase.firestore()
    await db.collection("users").doc(userId).set({
      ...userData,
      updatedAt: new Date().toISOString(),
    }, { merge: true })

    return true
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Get partners for a user
export const getPartners = async (userId: string): Promise<Partner[]> => {
  try {
    if (!userId) {
      console.error("Cannot get partners: No user ID provided")
      return []
    }

    const db = firebase.firestore()
    const partnersRef = db.collection("users").doc(userId).collection("partners")
    const snapshot = await partnersRef.get()

    const partners: Partner[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      partners.push({
        id: doc.id,
        name: data.name,
        email: data.email,
      })
    })

    return partners
  } catch (error) {
    console.error("Error getting partners:", error)
    throw error
  }
}

// Generate a random partner code
const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create partner code
export const createPartnerCode = async (userId: string): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("Cannot create partner code: No user ID provided")
    }

    // Fetch user profile to check if already linked
    const userProfile = await getUserProfile(userId)
    if (userProfile && userProfile.partnerId) {
      throw new Error("You are already linked to a partner. Cannot generate a new partner code.")
    }

    // Debug logging
    console.log("[createPartnerCode] userId argument:", userId)
    console.log("[createPartnerCode] Firebase Auth UID:", firebase.auth().currentUser?.uid)

    // Generate a unique partner code
    let code = generatePartnerCode()
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    // Ensure the code is unique
    while (!isUnique && attempts < maxAttempts) {
      const db = firebase.firestore()
      const usersRef = db.collection("users")
      const q = usersRef.where("partnerCode", "==", code)
      const querySnapshot = await q.get()

      if (querySnapshot.empty) {
        isUnique = true
      } else {
        code = generatePartnerCode()
        attempts++
      }
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique partner code")
    }

    // Update user with the partner code
    await updateUserProfile(userId, { partnerCode: code })

    return code
  } catch (error) {
    console.error("Error creating partner code:", error)
    throw error
  }
}

// Join partner using partner code
export const joinPartner = async (userId: string, partnerCode: string): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("Cannot join partner: No user ID provided")
    }

    if (!partnerCode) {
      throw new Error("Cannot join partner: No partner code provided")
    }

    // Find the user with the partner code
    const db = firebase.firestore()
    const usersRef = db.collection("users")
    const q = usersRef.where("partnerCode", "==", partnerCode.toUpperCase())
    const querySnapshot = await q.get()

    if (querySnapshot.empty) {
      throw new Error("Invalid partner code")
    }

    const partnerDoc = querySnapshot.docs[0]
    const partnerId = partnerDoc.id

    if (partnerId === userId) {
      throw new Error("You cannot connect to yourself")
    }

    // Only update the current user's document to set partnerId
    await updateUserProfile(userId, { partnerId: partnerId })

    // NEW: Also update the partner's document to set their partnerId to the joining user's ID
    await updateUserProfile(partnerId, { partnerId: userId })

    return partnerId
  } catch (error) {
    console.error("Error joining partner:", error)
    throw error
  }
}

// NEW FUNCTION: Disconnect from partner (updates both users)
export const disconnectFromPartner = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      throw new Error("Cannot disconnect: No user ID provided")
    }

    // First, get the current user's profile to find their partner
    const currentUserProfile = await getUserProfile(userId)

    if (!currentUserProfile || !currentUserProfile.partnerId) {
      console.log("User has no partner to disconnect from")
      return true // Already disconnected
    }

    const partnerId = currentUserProfile.partnerId

    // Update current user - remove partner connection and partner code
    await updateUserProfile(userId, {
      partnerId: null,
      partnerCode: null
    })

    // Update partner - remove partner connection and partner code
    await updateUserProfile(partnerId, {
      partnerId: null,
      partnerCode: null
    })

    console.log(`Successfully disconnected users ${userId} and ${partnerId}`)
    return true
  } catch (error) {
    console.error("Error disconnecting from partner:", error)
    throw error
  }
}

// Cleanup function to fix legacy boolean partnerId values
export const cleanupLegacyPartnerIds = async (): Promise<void> => {
  try {
    console.log("Starting cleanup of legacy partnerId values...")

    const db = firebase.firestore()
    const usersRef = db.collection("users")
    const querySnapshot = await usersRef.get()

    const updates: Promise<void>[] = []

    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data()

      // Check if partnerId is a boolean (true/false) instead of string
      if (typeof userData.partnerId === 'boolean') {
        console.log(`Cleaning up user ${userDoc.id} - partnerId is boolean: ${userData.partnerId}`)

        // Reset partnerId to null since we can't recover the actual partner ID
        const updatePromise = db.collection("users").doc(userDoc.id).update({
          partnerId: null,
          updatedAt: new Date().toISOString(),
        })

        updates.push(updatePromise)
      }
    })

    if (updates.length > 0) {
      await Promise.all(updates)
      console.log(`Cleanup completed. Updated ${updates.length} users.`)
    } else {
      console.log("No cleanup needed - all partnerId values are valid.")
    }

  } catch (error) {
    console.error("Error cleaning up legacy partnerId values:", error)
    throw error
  }
}
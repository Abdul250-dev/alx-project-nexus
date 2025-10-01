import { doc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase" // adjust the import path to your Firebase setup

export const deleteDayDataForDate = async (userId: string, dateKey: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "users", userId, "dayLogs", dateKey)
    await deleteDoc(docRef)
    console.log(`[Firebase] Deleted day data for ${dateKey}`)
    return true
  } catch (error) {
    console.error(`[Firebase] Error deleting day data for ${dateKey}:`, error)
    return false
  }
}

import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "./firebase"
import type { Reminder } from "../models/Reminder"
import { scheduleReminderNotification, cancelNotification } from "./notificationService"

// Get all reminders for a user with proper error handling
export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  try {
    const remindersRef = collection(db, "users", userId, "reminders")
    const q = query(remindersRef, orderBy("createdAt", "desc"))
    const remindersSnapshot = await getDocs(q)

    const reminders = remindersSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Reminder,
    )

    console.log(`Fetched ${reminders.length} reminders for user ${userId}`)
    return reminders
  } catch (error) {
    console.error("Error getting reminders:", error)
    return [] // Return empty array instead of throwing
  }
}

// Get a specific reminder
export const getReminder = async (userId: string, reminderId: string): Promise<Reminder | null> => {
  try {
    const reminderDoc = await getDoc(doc(db, "users", userId, "reminders", reminderId))

    if (reminderDoc.exists()) {
      return { id: reminderDoc.id, ...reminderDoc.data() } as Reminder
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting reminder:", error)
    return null
  }
}

// Add a new reminder with improved error handling
export const addReminder = async (
  userId: string,
  reminderData: Omit<Reminder, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<string> => {
  try {
    console.log("Adding reminder for user:", userId, reminderData)

    // Calculate the next due date
    const nextDue = calculateNextDueDate(reminderData)

    const reminderWithMeta = {
      ...reminderData,
      userId,
      nextDue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await addDoc(collection(db, "users", userId, "reminders"), reminderWithMeta)
    console.log("Reminder added with ID:", docRef.id)

    // Schedule notification for the reminder
    if (reminderData.enabled) {
      try {
        const notificationId = await scheduleReminderNotification({
          id: docRef.id,
          ...reminderWithMeta,
        } as Reminder)

        if (notificationId) {
          // Store the notification ID with the reminder
          await updateDoc(docRef, { notificationId })
        }
      } catch (notificationError) {
        console.warn("Failed to schedule notification:", notificationError)
        // Don't fail the entire operation if notification scheduling fails
      }
    }

    return docRef.id
  } catch (error) {
    console.error("Error adding reminder:", error)
    throw new Error("Failed to save reminder. Please try again.")
  }
}

// Update an existing reminder
export const updateReminder = async (
  userId: string,
  reminderId: string,
  reminderData: Partial<Reminder>,
): Promise<void> => {
  try {
    const reminderRef = doc(db, "users", userId, "reminders", reminderId)
    const reminderDoc = await getDoc(reminderRef)

    if (!reminderDoc.exists()) {
      throw new Error("Reminder not found")
    }

    const currentReminder = { id: reminderDoc.id, ...reminderDoc.data() } as Reminder

    // Cancel existing notification if it exists
    if (currentReminder.notificationId) {
      try {
        await cancelNotification(currentReminder.notificationId)
      } catch (notificationError) {
        console.warn("Failed to cancel existing notification:", notificationError)
      }
    }

    // Calculate the next due date if relevant fields changed
    let nextDue = currentReminder.nextDue
    if (
      reminderData.frequency !== undefined ||
      reminderData.startDate !== undefined ||
      reminderData.time !== undefined ||
      reminderData.days !== undefined ||
      reminderData.date !== undefined
    ) {
      nextDue = calculateNextDueDate({
        ...currentReminder,
        ...reminderData,
      })
    }

    const updatedReminder = {
      ...reminderData,
      nextDue,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(reminderRef, updatedReminder)

    // Schedule new notification if the reminder is enabled
    const isEnabled = reminderData.enabled !== undefined ? reminderData.enabled : currentReminder.enabled

    if (isEnabled) {
      try {
        const notificationId = await scheduleReminderNotification({
          ...currentReminder,
          ...updatedReminder,
          id: reminderId,
        } as Reminder)

        if (notificationId) {
          await updateDoc(reminderRef, { notificationId })
        }
      } catch (notificationError) {
        console.warn("Failed to schedule new notification:", notificationError)
      }
    }
  } catch (error) {
    console.error("Error updating reminder:", error)
    throw error
  }
}

// Delete a reminder
export const deleteReminder = async (userId: string, reminderId: string): Promise<void> => {
  try {
    const reminderRef = doc(db, "users", userId, "reminders", reminderId)
    const reminderDoc = await getDoc(reminderRef)

    if (reminderDoc.exists()) {
      const reminder = reminderDoc.data() as Reminder

      // Cancel notification if it exists
      if (reminder.notificationId) {
        try {
          await cancelNotification(reminder.notificationId)
        } catch (notificationError) {
          console.warn("Failed to cancel notification:", notificationError)
        }
      }
    }

    await deleteDoc(reminderRef)
  } catch (error) {
    console.error("Error deleting reminder:", error)
    throw error
  }
}

// Log reminder completion
export const logReminderCompletion = async (userId: string, reminderLog: any): Promise<void> => {
  try {
    await addDoc(collection(db, "users", userId, "reminderLogs"), {
      ...reminderLog,
      timestamp: new Date().toISOString(),
    })

    // Update the reminder's next due date
    const reminderRef = doc(db, "users", userId, "reminders", reminderLog.reminderId)
    const reminderDoc = await getDoc(reminderRef)

    if (reminderDoc.exists()) {
      const reminder = { id: reminderDoc.id, ...reminderDoc.data() } as Reminder
      const nextDue = calculateNextDueDate(reminder)

      await updateDoc(reminderRef, {
        nextDue,
        lastCompleted: new Date().toISOString(),
      })

      // Reschedule notification
      if (reminder.notificationId) {
        try {
          await cancelNotification(reminder.notificationId)
        } catch (error) {
          console.warn("Failed to cancel notification:", error)
        }
      }

      if (reminder.enabled) {
        try {
          const notificationId = await scheduleReminderNotification({
            ...reminder,
            nextDue,
          })

          if (notificationId) {
            await updateDoc(reminderRef, { notificationId })
          }
        } catch (error) {
          console.warn("Failed to reschedule notification:", error)
        }
      }
    }
  } catch (error) {
    console.error("Error logging reminder completion:", error)
    throw error
  }
}

// Helper function to calculate next due date with better logic
const calculateNextDueDate = (reminder: Partial<Reminder>): string => {
  const now = new Date()
  let nextDue = new Date()

  // Start from the start date if provided, otherwise use current time
  if (reminder.startDate) {
    nextDue = new Date(reminder.startDate)
  }

  // If we have a last completed date, start from there
  if (reminder.lastCompleted) {
    nextDue = new Date(reminder.lastCompleted)
  }

  // Calculate next occurrence based on frequency
  switch (reminder.frequency) {
    case "daily":
      nextDue.setDate(nextDue.getDate() + 1)
      break
    case "weekly":
      if (reminder.days && reminder.days.length > 0) {
        // Find next occurrence based on selected days
        const currentDay = nextDue.getDay()
        const sortedDays = [...reminder.days].sort((a, b) => a - b)

        let nextDay = sortedDays.find((day) => day > currentDay)
        if (!nextDay) {
          nextDay = sortedDays[0] // Wrap to next week
          nextDue.setDate(nextDue.getDate() + (7 - currentDay + nextDay))
        } else {
          nextDue.setDate(nextDue.getDate() + (nextDay - currentDay))
        }
      } else {
        nextDue.setDate(nextDue.getDate() + 7)
      }
      break
    case "monthly":
      if (reminder.date) {
        nextDue.setMonth(nextDue.getMonth() + 1)
        nextDue.setDate(reminder.date)
      } else {
        nextDue.setMonth(nextDue.getMonth() + 1)
      }
      break
    case "quarterly":
      nextDue.setMonth(nextDue.getMonth() + 3)
      break
    default:
      nextDue.setDate(nextDue.getDate() + 1)
  }

  // Set the time if provided
  if (reminder.time) {
    const [hours, minutes] = reminder.time.split(":").map(Number)
    nextDue.setHours(hours, minutes, 0, 0)
  }

  // Ensure the next due date is in the future
  if (nextDue <= now) {
    nextDue = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Add 1 day
  }

  return nextDue.toISOString()
}

// Share a reminder with another user
export const shareReminder = async (fromUserId: string, toUserId: string, reminderId: string): Promise<void> => {
  try {
    const reminderRef = doc(db, "users", fromUserId, "reminders", reminderId)
    const reminderSnap = await getDoc(reminderRef)

    if (!reminderSnap.exists()) {
      throw new Error("Reminder not found")
    }

    const reminderData = reminderSnap.data()

    // Optionally remove user-specific fields before sharing
    const sharedReminderData = {
      ...reminderData,
      userId: toUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sharedFrom: fromUserId, // add optional metadata
    }

    await addDoc(collection(db, "users", toUserId, "reminders"), sharedReminderData)
  } catch (error) {
    console.error("Error sharing reminder:", error)
    throw error
  }
}

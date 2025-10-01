import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import type { Reminder } from "../models/Reminder"

// ✅ Configure notification handler with correct return type for web
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // Required for web
    shouldShowList: true    // Required for web
  }),
})

// ✅ Register for push notifications
export const registerForPushNotifications = async (): Promise<string | null> => {
  let token: string | null = null

  // ✅ Skip registration on web unless VAPID key is set
  if (Platform.OS === "web") {
    console.log("Skipping push token registration on web.")
    return null
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!")
      return null
    }

    token = (await Notifications.getExpoPushTokenAsync()).data
  } else {
    console.log("Must use physical device for Push Notifications")
  }

  // ✅ Android channel setup
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }

  return token
}

// ✅ Schedule a reminder notification
export const scheduleReminderNotification = async (reminder: Reminder): Promise<string | null> => {
  try {
    if (!reminder.nextDue || !reminder.enabled) {
      return null
    }

    const nextDueDate = new Date(reminder.nextDue)
    const now = new Date()

    if (nextDueDate <= now) {
      return null
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "HealthPath Reminder",
        body: reminder.title,
        data: {
          reminderId: reminder.id,
          type: reminder.type,
        },
        sound: true,
      },
      trigger: {
        date: nextDueDate,
      },
    })

    return notificationId
  } catch (error) {
    console.error("Error scheduling notification:", error)
    return null
  }
}

// ✅ Cancel a specific notification
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  } catch (error) {
    console.error("Error canceling notification:", error)
  }
}

// ✅ Cancel all scheduled notifications
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
  } catch (error) {
    console.error("Error canceling all notifications:", error)
  }
}

// ✅ Get all scheduled notifications
export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync()
  } catch (error) {
    console.error("Error getting scheduled notifications:", error)
    return []
  }
}

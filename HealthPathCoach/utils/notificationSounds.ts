interface NotificationSound {
  id: string
  name: string
  file: string
  category: string
}

// Define available notification sounds
export const NOTIFICATION_SOUNDS: NotificationSound[] = [
  { id: "default", name: "Default", file: "default", category: "System" },
  { id: "alert", name: "Alert", file: "alert.wav", category: "System" },
  { id: "bell", name: "Bell", file: "bell.wav", category: "System" },
  { id: "chime", name: "Chime", file: "chime.wav", category: "System" },
  { id: "crystal", name: "Crystal", file: "crystal.wav", category: "System" },
  { id: "notification", name: "Notification", file: "notification.wav", category: "System" },
  { id: "pill-reminder", name: "Pill Reminder", file: "pill-reminder.wav", category: "Health" },
  { id: "appointment", name: "Appointment", file: "appointment.wav", category: "Health" },
  { id: "water", name: "Water", file: "water.wav", category: "Health" },
  { id: "gentle", name: "Gentle", file: "gentle.wav", category: "Calm" },
  { id: "soft", name: "Soft", file: "soft.wav", category: "Calm" },
  { id: "subtle", name: "Subtle", file: "subtle.wav", category: "Calm" },
]

// Get a sound by its ID
export const getSoundById = (id: string): NotificationSound => {
  const sound = NOTIFICATION_SOUNDS.find((s) => s.id === id)
  return sound || NOTIFICATION_SOUNDS[0] // Return default if not found
}

// Get all available sounds
export const getAllSounds = (): NotificationSound[] => {
  return NOTIFICATION_SOUNDS
}

// Get sounds by category
export const getSoundsByCategory = (): Record<string, NotificationSound[]> => {
  return NOTIFICATION_SOUNDS.reduce(
    (acc, sound) => {
      if (!acc[sound.category]) {
        acc[sound.category] = []
      }
      acc[sound.category].push(sound)
      return acc
    },
    {} as Record<string, NotificationSound[]>,
  )
}

// Get default sounds for each reminder type
export const getDefaultSoundsForTypes = (): Record<string, string> => {
  return {
    pill: "pill-reminder",
    patch: "notification",
    ring: "bell",
    injection: "alert",
    appointment: "appointment",
    other: "default",
  }
}

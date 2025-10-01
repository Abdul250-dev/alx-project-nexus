export type ReminderType = "pill" | "patch" | "ring" | "injection" | "appointment" | "other"
export type ReminderFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "custom"

export interface Reminder {
  id: string
  title: string
  type: ReminderType
  frequency: ReminderFrequency
  time: string // Format: "HH:MM"
  startDate: string // ISO date string
  endDate?: string // ISO date string
  days?: number[] // For weekly reminders, 0 = Sunday, 1 = Monday, etc.
  date?: number // For monthly reminders, day of month (1-31)
  notes?: string
  enabled: boolean
  nextDue?: string // ISO date string
  soundId?: string // ID of the notification sound
  userId: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

export interface ReminderCompletion {
  id?: string
  reminderId: string
  timestamp: string // ISO date string
  completed: boolean
  notes?: string
}

export interface NotificationSettings {
  enabled: boolean
  reminderAlerts: boolean
  reminderTime: number // Minutes before the reminder time
  dailyDigest: boolean
  digestTime: string // Format: "HH:MM"
  sound: boolean
  vibration: boolean
  defaultSoundId: string
  typeSounds: Record<ReminderType, string>
}

"use client"

import { addDays, format, isToday, isTomorrow, parseISO } from "date-fns"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Bell, ChevronRight } from "react-native-feather"
import { useUser } from "../context/UserContext"
import type { Reminder } from "../models/Reminder"
import { getUserReminders } from "../services/reminderService"
import { useTheme } from "./theme-provider"

export default function UpcomingReminders() {
  const router = useRouter()
  const { colors } = useTheme()
  const { userData } = useUser()

  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUpcomingReminders()
  }, [userData])

  const loadUpcomingReminders = async () => {
    if (!userData) return

    setLoading(true)
    try {
      const allReminders = await getUserReminders(userData.id)

      // Filter for reminders due in the next 3 days
      const threeDaysFromNow = addDays(new Date(), 3)
      const upcoming = allReminders
        .filter((reminder) => {
          if (!reminder.nextDue || !reminder.enabled) return false

          const dueDate = parseISO(reminder.nextDue)
          return dueDate <= threeDaysFromNow
        })
        .sort((a, b) => {
          const dateA = a.nextDue ? parseISO(a.nextDue) : new Date()
          const dateB = b.nextDue ? parseISO(b.nextDue) : new Date()
          return dateA.getTime() - dateB.getTime()
        })
        .slice(0, 3) // Show at most 3 reminders 

      setUpcomingReminders(upcoming)
    } catch (error) {
      console.error("Error loading upcoming reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDueDate = (dateString: string) => {
    const date = parseISO(dateString)

    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, "h:mm a")}`
    } else {
      return format(date, "EEE, MMM d, h:mm a")
    }
  }

  const navigateToReminders = () => {
    router.push("/main/reminders")
  }

  const navigateToEditReminder = (reminder: Reminder) => {
    router.push(`/main/reminders/edit?mode=edit&id=${reminder.id}`)
  }

  if (upcomingReminders.length === 0 && !loading) {
    return null
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Bell stroke={colors.teal} width={20} height={20} style={styles.icon} />
          <Text style={[styles.title, { color: colors.navyBlue }]}>Upcoming Reminders</Text>
        </View>
        <TouchableOpacity onPress={navigateToReminders}>
          <Text style={[styles.viewAll, { color: colors.teal }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={[styles.loadingText, { color: colors.gray }]}>Loading reminders...</Text>
      ) : (
        <View>
          {upcomingReminders.map((reminder) => (
            <TouchableOpacity
              key={reminder.id}
              style={styles.reminderItem}
              onPress={() => navigateToEditReminder(reminder)}
            >
              <View style={styles.reminderContent}>
                <Text style={[styles.reminderTitle, { color: colors.navyBlue }]}>{reminder.title}</Text>
                <Text style={[styles.reminderTime, { color: colors.gray }]}>
                  {reminder.nextDue ? formatDueDate(reminder.nextDue) : "No due date"}
                </Text>
              </View>
              <ChevronRight stroke={colors.gray} width={16} height={16} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 13,
  },
})

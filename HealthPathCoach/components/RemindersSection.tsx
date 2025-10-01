import type { useRouter } from "expo-router"
import type React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Bell } from "react-native-feather"
import { ROUTES } from "../utils/constants"
import Card from "./Card"

interface RemindersSectionProps {
  upcomingReminders: any[]
  router: ReturnType<typeof useRouter>
  colors: any
}

const RemindersSection: React.FC<RemindersSectionProps> = ({ upcomingReminders, router, colors }) => {
  const formatDueDate = (dueDateString: string) => {
    const dueDate = new Date(dueDateString)
    const today = new Date()

    // Reset time to compare dates only
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

    if (dueDateOnly < todayDate) {
      return "Overdue"
    } else if (dueDateOnly.getTime() === todayDate.getTime()) {
      return "Due today"
    } else {
      return `Due: ${dueDate.toLocaleDateString()}`
    }
  }

  return (
    <View style={styles.remindersContainer}>
      <View style={styles.remindersHeader}>
        <View style={styles.remindersTitleContainer}>
          <Bell stroke={colors.teal} width={20} height={20} style={styles.remindersIcon} />
          <Text style={[styles.remindersTitle, { color: colors.navyBlue }]}>Reminders</Text>
        </View>
        <TouchableOpacity onPress={() => router.push(ROUTES.MAIN.REMINDERS.LIST)}>
          <Text style={[styles.viewAllText, { color: colors.teal }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {upcomingReminders.length > 0 ? (
        upcomingReminders.map((reminder, index) => (
          <TouchableOpacity
            key={reminder.id || index}
            onPress={() => router.push(`/main/reminders/edit?mode=view&id=${reminder.id}`)}
            activeOpacity={0.7}
          >
            <Card style={styles.reminderCard}>
              <View style={styles.reminderCardContent}>
                <View style={[styles.reminderTypeIcon, { backgroundColor: reminder.color || colors.teal }]}>
                  <Text style={styles.reminderTypeEmoji}>
                    {reminder.type === "pill"
                      ? "💊"
                      : reminder.type === "patch"
                        ? "🩹"
                        : reminder.type === "ring"
                          ? "⭕"
                          : reminder.type === "injection"
                            ? "💉"
                            : reminder.type === "appointment"
                              ? "🗓️"
                              : "⏰"}
                  </Text>
                </View>
                <View style={styles.reminderDetails}>
                  <Text style={[styles.reminderTitle, { color: colors.navyBlue }]}>
                    {reminder.title || reminder.name || "Unnamed Reminder"}
                  </Text>
                  <Text style={[styles.reminderTime, { color: colors.gray }]}>
                    {reminder.time && `${reminder.time} • `}
                    {reminder.nextDue ? formatDueDate(reminder.nextDue) : "No due date"}
                  </Text>
                </View>
                {/* Status indicator */}
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: reminder.nextDue
                          ? new Date(reminder.nextDue) < new Date()
                            ? colors.error
                            : new Date(reminder.nextDue).toDateString() === new Date().toDateString()
                              ? colors.warning || "#FFA500"
                              : colors.success || "#4CAF50"
                          : colors.gray,
                      },
                    ]}
                  />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      ) : (
        <Card style={styles.noRemindersCard}>
          <Text style={[styles.noRemindersText, { color: colors.gray }]}>
            No upcoming reminders. Set one up to stay on track!
          </Text>
          <TouchableOpacity
            style={[styles.addReminderButton, { backgroundColor: colors.teal }]}
            onPress={() => router.push(ROUTES.MAIN.REMINDERS.ADD)}
          >
            <Text style={[styles.addReminderButtonText, { color: colors.white }]}>Add Reminder</Text>
          </TouchableOpacity>
        </Card>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  remindersContainer: {
    marginBottom: 20,
  },
  remindersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  remindersTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  remindersIcon: {
    marginRight: 10,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  reminderCard: {
    marginBottom: 10,
    marginHorizontal: 15,
  },
  reminderCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  reminderTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  reminderTypeEmoji: {
    fontSize: 20,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 12,
  },
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noRemindersCard: {
    alignItems: "center",
    padding: 20,
    marginHorizontal: 15,
  },
  noRemindersText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  addReminderButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addReminderButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default RemindersSection

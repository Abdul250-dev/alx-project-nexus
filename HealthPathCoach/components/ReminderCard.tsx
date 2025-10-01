import { format } from "date-fns"
import { useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { CheckCircle, Clock, Edit2, Trash2 } from "react-native-feather"
import type { Reminder } from "../models/Reminder"
import { useTheme } from "./theme-provider"

type ReminderCardProps = {
  reminder: Reminder
  onComplete: (reminder: Reminder) => void
  onEdit: (reminder: Reminder) => void
  onDelete: (reminder: Reminder) => void
}

export default function ReminderCard({ reminder, onComplete, onEdit, onDelete }: ReminderCardProps) {
  const { colors } = useTheme()
  const [showActions, setShowActions] = useState(false)

  const getStatusColor = () => {
    if (!reminder.nextDue) return colors.gray

    const nextDue = new Date(reminder.nextDue)
    const now = new Date()

    // If next due is in the past
    if (nextDue < now) {
      return colors.error
    }

    // If next due is today
    if (nextDue.toDateString() === now.toDateString()) {
      return colors.warning
    }

    return colors.success
  }

  const getStatusText = () => {
    if (!reminder.nextDue) return "Not scheduled"

    const nextDue = new Date(reminder.nextDue)
    const now = new Date()

    // If next due is in the past
    if (nextDue < now) {
      return "Overdue"
    }

    // If next due is today
    if (nextDue.toDateString() === now.toDateString()) {
      return "Due today"
    }

    // Format the date
    return `Due ${format(nextDue, "MMM d")}`
  }

  const getFrequencyText = () => {
    switch (reminder.frequency) {
      case "daily":
        return "Every day"
      case "weekly":
        return "Every week"
      case "monthly":
        return "Every month"
      case "quarterly":
        return "Every 3 months"
      case "custom":
        return "Custom schedule"
      default:
        return ""
    }
  }

  const getTypeIcon = () => {
    switch (reminder.type) {
      case "pill":
        return (
          <View style={[styles.typeIcon, { backgroundColor: reminder.color || colors.teal }]}>
            <Text style={styles.typeIconText}>💊</Text>
          </View>
        )
      case "patch":
        return (
          <View style={[styles.typeIcon, { backgroundColor: reminder.color || colors.teal }]}>
            <Text style={styles.typeIconText}>🩹</Text>
          </View>
        )
      case "ring":
        return (
          <View style={[styles.typeIcon, { backgroundColor: reminder.color || colors.teal }]}>
            <Text style={styles.typeIconText}>⭕</Text>
          </View>
        )
      case "injection":
        return (
          <View style={[styles.typeIcon, { backgroundColor: reminder.color || colors.teal }]}>
            <Text style={styles.typeIconText}>💉</Text>
          </View>
        )
      case "appointment":
        return (
          <View style={[styles.typeIcon, { backgroundColor: reminder.color || colors.teal }]}>
            <Text style={styles.typeIconText}>🗓️</Text>
          </View>
        )
      default:
        return (
          <View style={[styles.typeIcon, { backgroundColor: reminder.color || colors.teal }]}>
            <Text style={styles.typeIconText}>⏰</Text>
          </View>
        )
    }
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.white }]}
      onPress={() => setShowActions(!showActions)}
      activeOpacity={0.7}
    >
      <View style={styles.mainContent}>
        {getTypeIcon()}

        <View style={styles.reminderInfo}>
          <Text style={[styles.title, { color: colors.navyBlue }]}>{reminder.title}</Text>
          <View style={styles.detailsRow}>
            <Clock stroke={colors.gray} width={12} height={12} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: colors.gray }]}>
              {reminder.time} • {getFrequencyText()}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
        </View>
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => onComplete(reminder)}
          >
            <CheckCircle stroke={colors.white} width={20} height={20} />
            <Text style={[styles.actionText, { color: colors.white }]}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.teal }]}
            onPress={() => onEdit(reminder)}
          >
            <Edit2 stroke={colors.white} width={20} height={20} />
            <Text style={[styles.actionText, { color: colors.white }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => onDelete(reminder)}
          >
            <Trash2 stroke={colors.white} width={20} height={20} />
            <Text style={[styles.actionText, { color: colors.white }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  mainContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  typeIconText: {
    fontSize: 20,
  },
  reminderInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
  },
  statusContainer: {
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
})

import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Filter, Plus } from "react-native-feather"
import Header from "../../components/Header"
import ReminderCard from "../../components/ReminderCard"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"
import type { Reminder, ReminderType } from "../../models/Reminder"
import { deleteReminder, getUserReminders, logReminderCompletion } from "../../services/reminderService"
import { ROUTES } from "../../utils/constants"

export default function RemindersScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { userData } = useUser()

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ReminderType | "all">("all")

  useEffect(() => {
    loadReminders()
  }, [userData])

  const loadReminders = async () => {
    if (!userData) return

    setLoading(true)
    try {
      const userReminders = await getUserReminders(userData.id)
      setReminders(userReminders)
    } catch (error) {
      console.error("Error loading reminders:", error)
      Alert.alert("Error", "Failed to load reminders. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddReminder = () => {
    router.push(ROUTES.MAIN.REMINDERS.ADD)
  }

  const handleCompleteReminder = async (reminder: Reminder) => {
    if (!userData) return

    try {
      await logReminderCompletion(userData.id, {
        reminderId: reminder.id,
        timestamp: new Date().toISOString(),
        completed: true,
      })

      // Refresh reminders
      loadReminders()

      Alert.alert("Success", "Reminder marked as completed!")
    } catch (error) {
      console.error("Error completing reminder:", error)
      Alert.alert("Error", "Failed to complete reminder. Please try again.")
    }
  }

  const handleEditReminder = (reminder: Reminder) => {
    router.push(ROUTES.MAIN.REMINDERS.EDIT(reminder.id))
  }

  const handleDeleteReminder = (reminder: Reminder) => {
    Alert.alert("Delete Reminder", `Are you sure you want to delete "${reminder.title}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!userData) return

          try {
            await deleteReminder(userData.id, reminder.id)

            // Update local state
            setReminders(reminders.filter((r) => r.id !== reminder.id))

            Alert.alert("Success", "Reminder deleted successfully!")
          } catch (error) {
            console.error("Error deleting reminder:", error)
            Alert.alert("Error", "Failed to delete reminder. Please try again.")
          }
        },
      },
    ])
  }

  const filteredReminders = filter === "all" ? reminders : reminders.filter((r) => r.type === filter)

  const renderFilterButtons = () => {
    const filterOptions: { id: ReminderType | "all"; label: string }[] = [
      { id: "all", label: "All" },
      { id: "pill", label: "Pills" },
      { id: "patch", label: "Patches" },
      { id: "ring", label: "Rings" },
      { id: "injection", label: "Injections" },
      { id: "appointment", label: "Appointments" },
      { id: "other", label: "Other" },
    ]

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === option.id ? colors.teal : colors.white,
                borderColor: colors.lightGray,
              },
            ]}
            onPress={() => setFilter(option.id)}
          >
            <Text style={[styles.filterText, { color: filter === option.id ? colors.white : colors.navyBlue }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header
        title="Reminders"
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={handleAddReminder}>
            <Plus stroke={colors.teal} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Filter stroke={colors.navyBlue} width={16} height={16} style={styles.filterIcon} />
          <Text style={[styles.filterTitle, { color: colors.navyBlue }]}>Filter by type</Text>
        </View>
        {renderFilterButtons()}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <Text style={[styles.emptyText, { color: colors.gray }]}>Loading reminders...</Text>
        ) : filteredReminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.gray }]}>
              {filter === "all" ? "You don't have any reminders yet." : `You don't have any ${filter} reminders.`}
            </Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.teal }]} onPress={handleAddReminder}>
              <Plus stroke={colors.white} width={20} height={20} style={styles.addIcon} />
              <Text style={[styles.addText, { color: colors.white }]}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>
              {filter === "all" ? "All Reminders" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Reminders`}
            </Text>

            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleCompleteReminder}
                onEdit={handleEditReminder}
                onDelete={handleDeleteReminder}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterSection: {
    padding: 16,
    paddingBottom: 0,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filterIcon: {
    marginRight: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterContainer: {
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addIcon: {
    marginRight: 8,
  },
  addText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
})

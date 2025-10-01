import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native"
import { AlertCircle, Calendar, Clock } from "react-native-feather"
import AnimatedButton from "../../components/AnimatedButton"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"
import type { Reminder, ReminderFrequency, ReminderType } from "../../models/Reminder"
import { addReminder, updateReminder } from "../../services/reminderService"

export default function AddEditReminderScreen({
  mode: propMode,
  reminderId,
  contraceptionMethod: propContraceptionMethod,
}: {
  mode?: "add" | "edit" | "view"
  reminderId?: string
  contraceptionMethod?: string
}) {
  const router = useRouter()
  const params = useLocalSearchParams<{
    mode?: "add" | "edit" | "view"
    reminderId?: string
    contraceptionMethod?: string
  }>()

  const mode = propMode ?? params.mode ?? "add"
  const contraceptionMethod = propContraceptionMethod ?? params.contraceptionMethod

  const { colors } = useTheme()
  const { userData } = useUser()

  const [title, setTitle] = useState("")
  const [type, setType] = useState<ReminderType>("pill")
  const [frequency, setFrequency] = useState<ReminderFrequency>("daily")
  const [time, setTime] = useState(new Date())
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [notes, setNotes] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(false)

  // For weekly reminders
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  // For monthly reminders
  const [selectedDate, setSelectedDate] = useState<number>(1)

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && reminderId) {
      // Fetch reminder by ID and populate state
      const fetchReminder = async () => {
        // Placeholder: Replace with actual fetch logic
        // const reminder = await getReminder(reminderId);
        const reminder: Reminder = {
          id: reminderId,
          title: "Example Reminder",
          type: "pill",
          frequency: "daily",
          time: "08:00",
          startDate: new Date().toISOString(),
          enabled: true,
          notes: "Example notes",
        }

        setTitle(reminder.title)
        setType(reminder.type)
        setFrequency(reminder.frequency)

        // Parse time
        if (reminder.time) {
          const [hours, minutes] = reminder.time.split(":").map(Number)
          const timeDate = new Date()
          timeDate.setHours(hours, minutes, 0, 0)
          setTime(timeDate)
        }

        // Parse dates
        if (reminder.startDate) {
          setStartDate(new Date(reminder.startDate))
        }

        if (reminder.endDate) {
          setEndDate(new Date(reminder.endDate))
        }

        // Parse days for weekly reminders
        if (reminder.days) {
          setSelectedDays(reminder.days)
        }

        // Parse date for monthly reminders
        if (reminder.date) {
          setSelectedDate(reminder.date)
        }

        setNotes(reminder.notes || "")
        setEnabled(reminder.enabled)
      }

      fetchReminder()
    } else if (contraceptionMethod) {
      // Pre-fill based on contraception method
      switch (contraceptionMethod) {
        case "combined-pill":
        case "progestin-only-pill":
          setTitle("Take birth control pill")
          setType("pill")
          setFrequency("daily")
          break
        case "patch":
          setTitle("Change contraceptive patch")
          setType("patch")
          setFrequency("weekly")
          break
        case "vaginal-ring":
          setTitle("Change vaginal ring")
          setType("ring")
          setFrequency("monthly")
          break
        case "injection":
          setTitle("Contraceptive injection appointment")
          setType("injection")
          setFrequency("quarterly")
          break
        default:
          setTitle("Contraception reminder")
          break
      }
    }
  }, [mode, reminderId, contraceptionMethod])

  const handleSave = async () => {
    if (!userData) return

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for the reminder.")
      return
    }

    setLoading(true)

    try {
      const reminderData: Omit<Reminder, "id"> = {
        title,
        type,
        frequency,
        time: format(time, "HH:mm"),
        startDate: startDate.toISOString(),
        enabled,
        notes: notes.trim() || undefined,
      }

      // Add frequency-specific data
      if (frequency === "weekly") {
        reminderData.days = selectedDays.length > 0 ? selectedDays : [0] // Default to Sunday
      }

      if (frequency === "monthly") {
        reminderData.date = selectedDate
      }

      if (endDate) {
        reminderData.endDate = endDate.toISOString()
      }

      if (mode === "edit" && reminderId) {
        await updateReminder(userData.id, reminderId, reminderData)
        Alert.alert("Success", "Reminder updated successfully!")
      } else {
        await addReminder(userData.id, reminderData)
        Alert.alert("Success", "Reminder added successfully!")
      }

      router.back()
    } catch (error) {
      console.error("Error saving reminder:", error)
      Alert.alert("Error", "Failed to save reminder. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderReminderTypes = () => {
    const types: { id: ReminderType; label: string; emoji: string }[] = [
      { id: "pill", label: "Pill", emoji: "💊" },
      { id: "patch", label: "Patch", emoji: "🩹" },
      { id: "ring", label: "Ring", emoji: "⭕" },
      { id: "injection", label: "Injection", emoji: "💉" },
      { id: "appointment", label: "Appointment", emoji: "🗓️" },
      { id: "other", label: "Other", emoji: "⏰" },
    ]

    return (
      <View style={styles.typeContainer}>
        {types.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.typeButton,
              {
                backgroundColor: type === item.id ? colors.teal : colors.white,
                borderColor: colors.lightGray,
              },
            ]}
            onPress={() => setType(item.id)}
          >
            <Text style={styles.typeEmoji}>{item.emoji}</Text>
            <Text style={[styles.typeText, { color: type === item.id ? colors.white : colors.navyBlue }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  const renderFrequencyOptions = () => {
    const frequencies: { id: ReminderFrequency; label: string }[] = [
      { id: "daily", label: "Daily" },
      { id: "weekly", label: "Weekly" },
      { id: "monthly", label: "Monthly" },
      { id: "quarterly", label: "Every 3 Months" },
      { id: "custom", label: "Custom" },
    ]

    return (
      <View style={styles.frequencyContainer}>
        {frequencies.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.frequencyButton,
              {
                backgroundColor: frequency === item.id ? colors.teal : colors.white,
                borderColor: colors.lightGray,
              },
            ]}
            onPress={() => setFrequency(item.id)}
          >
            <Text style={[styles.frequencyText, { color: frequency === item.id ? colors.white : colors.navyBlue }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  const renderWeeklyOptions = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <View style={styles.weeklyContainer}>
        <Text style={[styles.sectionSubtitle, { color: colors.navyBlue }]}>Repeat on</Text>
        <View style={styles.daysContainer}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                {
                  backgroundColor: selectedDays.includes(index) ? colors.teal : colors.white,
                  borderColor: colors.lightGray,
                },
              ]}
              onPress={() => {
                if (selectedDays.includes(index)) {
                  setSelectedDays(selectedDays.filter((d) => d !== index))
                } else {
                  setSelectedDays([...selectedDays, index])
                }
              }}
            >
              <Text style={[styles.dayText, { color: selectedDays.includes(index) ? colors.white : colors.navyBlue }]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  const renderMonthlyOptions = () => {
    return (
      <View style={styles.monthlyContainer}>
        <Text style={[styles.sectionSubtitle, { color: colors.navyBlue }]}>Day of month</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.lightGray }]}
            onPress={() => setSelectedDate(selectedDate > 1 ? selectedDate - 1 : 1)}
          >
            <Text style={{ color: colors.navyBlue }}>-</Text>
          </TouchableOpacity>

          <View style={[styles.dateDisplay, { backgroundColor: colors.teal }]}>
            <Text style={[styles.dateText, { color: colors.white }]}>{selectedDate}</Text>
          </View>

          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.lightGray }]}
            onPress={() => setSelectedDate(selectedDate < 31 ? selectedDate + 1 : 31)}
          >
            <Text style={{ color: colors.navyBlue }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header
        title={
          mode === "add" ? "Add Reminder" :
            mode === "edit" ? "Edit Reminder" :
              "Reminder Details"
        }
        showBackButton
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>
            {mode === "add" ? "Create New Reminder" : mode === "edit" ? "Edit Reminder" : "Reminder Information"}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Title</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.white, borderColor: colors.lightGray, color: colors.black },
                mode === "view" && { backgroundColor: colors.lightGray, color: colors.gray }
              ]}
              placeholder="Enter reminder title"
              placeholderTextColor={colors.gray}
              value={title}
              onChangeText={setTitle}
              editable={mode !== "view"}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Type</Text>
            {mode === "view" ? (
              <View style={[styles.viewModeContainer, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
                <Text style={[styles.viewModeText, { color: colors.navyBlue }]}>
                  {type === "pill" ? "💊 Pill" :
                    type === "patch" ? "🩹 Patch" :
                      type === "ring" ? "⭕ Ring" :
                        type === "injection" ? "💉 Injection" :
                          type === "appointment" ? "🗓️ Appointment" :
                            "⏰ Other"}
                </Text>
              </View>
            ) : (
              renderReminderTypes()
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Frequency</Text>
            {mode === "view" ? (
              <View style={[styles.viewModeContainer, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
                <Text style={[styles.viewModeText, { color: colors.navyBlue }]}>
                  {frequency === "daily" ? "Daily" :
                    frequency === "weekly" ? "Weekly" :
                      frequency === "monthly" ? "Monthly" :
                        frequency === "quarterly" ? "Quarterly" :
                          "Custom"}
                </Text>
              </View>
            ) : (
              renderFrequencyOptions()
            )}
          </View>

          {frequency === "weekly" && renderWeeklyOptions()}
          {frequency === "monthly" && renderMonthlyOptions()}

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Time</Text>
            {mode === "view" ? (
              <View style={[styles.viewModeContainer, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
                <Text style={[styles.viewModeText, { color: colors.navyBlue }]}>
                  {format(time, "h:mm a")}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.dateTimeButton, { backgroundColor: colors.white, borderColor: colors.lightGray }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock stroke={colors.teal} width={20} height={20} style={styles.dateTimeIcon} />
                <Text style={[styles.dateTimeText, { color: colors.navyBlue }]}>{format(time, "h:mm a")}</Text>
              </TouchableOpacity>
            )}

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(Platform.OS === "ios")
                  if (selectedTime) {
                    setTime(selectedTime)
                  }
                }}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Start Date</Text>
            {mode === "view" ? (
              <View style={[styles.viewModeContainer, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
                <Text style={[styles.viewModeText, { color: colors.navyBlue }]}>
                  {format(startDate, "MMM d, yyyy")}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.dateTimeButton, { backgroundColor: colors.white, borderColor: colors.lightGray }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Calendar stroke={colors.teal} width={20} height={20} style={styles.dateTimeIcon} />
                <Text style={[styles.dateTimeText, { color: colors.navyBlue }]}>{format(startDate, "MMM d, yyyy")}</Text>
              </TouchableOpacity>
            )}

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(Platform.OS === "ios")
                  if (selectedDate) {
                    setStartDate(selectedDate)
                  }
                }}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.endDateHeader}>
              <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>End Date (Optional)</Text>
              {mode !== "view" && (
                <Switch
                  value={endDate !== null}
                  onValueChange={(value) => {
                    if (value) {
                      // Set default end date to 3 months from now
                      const date = new Date()
                      date.setMonth(date.getMonth() + 3)
                      setEndDate(date)
                    } else {
                      setEndDate(null)
                    }
                  }}
                  trackColor={{ false: colors.lightGray, true: colors.teal }}
                  thumbColor={colors.white}
                />
              )}
            </View>

            {endDate && (
              mode === "view" ? (
                <View style={[styles.viewModeContainer, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
                  <Text style={[styles.viewModeText, { color: colors.navyBlue }]}>
                    {format(endDate, "MMM d, yyyy")}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: colors.white, borderColor: colors.lightGray }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Calendar stroke={colors.teal} width={20} height={20} style={styles.dateTimeIcon} />
                  <Text style={[styles.dateTimeText, { color: colors.navyBlue }]}>{format(endDate, "MMM d, yyyy")}</Text>
                </TouchableOpacity>
              )
            )}

            {showEndDatePicker && endDate && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(Platform.OS === "ios")
                  if (selectedDate) {
                    setEndDate(selectedDate)
                  }
                }}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Notes</Text>
            {mode === "view" ? (
              <View style={[styles.viewModeContainer, { backgroundColor: colors.white, borderColor: colors.lightGray, minHeight: 100 }]}>
                <Text style={[styles.viewModeText, { color: colors.navyBlue }]}>
                  {notes || "No notes added"}
                </Text>
              </View>
            ) : (
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: colors.white, borderColor: colors.lightGray, color: colors.black },
                ]}
                placeholder="Add notes or instructions"
                placeholderTextColor={colors.gray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.enabledContainer}>
              <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Enabled</Text>
              {mode === "view" ? (
                <View style={[styles.viewModeContainer, { backgroundColor: colors.white, borderColor: colors.lightGray, width: 80, alignItems: 'center' }]}>
                  <Text style={[styles.viewModeText, { color: enabled ? colors.success || "#4CAF50" : colors.error }]}>
                    {enabled ? "Yes" : "No"}
                  </Text>
                </View>
              ) : (
                <Switch
                  value={enabled}
                  onValueChange={setEnabled}
                  trackColor={{ false: colors.lightGray, true: colors.teal }}
                  thumbColor={colors.white}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <AlertCircle stroke={colors.teal} width={20} height={20} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: colors.navyBlue }]}>
            {mode === "view"
              ? "This is a read-only view of your reminder details."
              : "Reminders will appear in your reminder list. In a real app, you would also receive notifications at the specified times."
            }
          </Text>
        </View>

        {mode !== "view" && (
          <AnimatedButton
            title={mode === "add" ? "Add Reminder" : "Save Changes"}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        )}

        {mode === "view" && (
          <View style={styles.viewModeActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.teal }]}
              onPress={() => router.push(`/main/reminders/edit?mode=edit&id=${reminderId}`)}
            >
              <Text style={[styles.actionButtonText, { color: colors.white }]}>Edit Reminder</Text>
            </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  viewModeContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  viewModeText: {
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  typeButton: {
    width: "31%",
    margin: "1%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  typeEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  frequencyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  frequencyButton: {
    width: "48%",
    margin: "1%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  weeklyContainer: {
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
  },
  monthlyContainer: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  dateButton: {
    width: "20%",
    margin: "2.5%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  dateTimeIcon: {
    marginRight: 12,
  },
  dateTimeText: {
    fontSize: 16,
  },
  endDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  enabledContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  saveButton: {
    marginBottom: 24,
  },
  viewModeActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})

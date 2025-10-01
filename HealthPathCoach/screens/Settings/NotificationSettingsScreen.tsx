import DateTimePicker from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"
import { format, parse } from "date-fns"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"
import { Bell, ChevronDown, ChevronUp, Clock, Volume2, X } from "react-native-feather"
import Header from "../../components/Header"
import SoundSelector from "../../components/SoundSelector"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"
import type { NotificationSettings, ReminderType } from "../../models/Reminder"
import firebase from "../../services/firebase"
import { registerForPushNotifications } from "../../services/notificationService"
import { ROUTES } from "../../utils/constants"
import { getDefaultSoundsForTypes } from "../../utils/notificationSounds"

export default function NotificationSettingsScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const { colors } = useTheme()
  const { userData } = useUser()

  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reminderAlerts: true,
    reminderTime: 15, // 15 minutes before
    dailyDigest: false,
    digestTime: "08:00", // 8:00 AM
    sound: true,
    vibration: true,
    defaultSoundId: "default",
    typeSounds: getDefaultSoundsForTypes(),
  })

  const [loading, setLoading] = useState(true)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timePickerMode, setTimePickerMode] = useState<"digest" | "reminder">("digest")
  const [showSoundSettings, setShowSoundSettings] = useState(false)
  const [editingSoundType, setEditingSoundType] = useState<ReminderType | "default" | null>(null)

  useEffect(() => {
    loadSettings()
  }, [userData])

  const loadSettings = async () => {
    if (!userData) return

    setLoading(true)
    try {
      const db = firebase.firestore()
      const settingsRef = db.collection("users").doc(userData.id).collection("settings").doc("notifications")
      const settingsSnap = await settingsRef.get()

      if (settingsSnap.exists) {
        const loadedSettings = settingsSnap.data() as NotificationSettings
        // Ensure typeSounds exists with default values
        if (!loadedSettings.typeSounds) {
          loadedSettings.typeSounds = getDefaultSoundsForTypes()
        }
        setSettings(loadedSettings)
      } else {
        // If no settings exist, create default settings
        await settingsRef.set(settings)
      }
    } catch (error) {
      console.error("Error loading notification settings:", error)
      Alert.alert("Error", "Failed to load notification settings")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings: NotificationSettings) => {
    if (!userData) return

    try {
      const db = firebase.firestore()
      const settingsRef = db.collection("users").doc(userData.id).collection("settings").doc("notifications")
      await settingsRef.set(newSettings)

      // If notifications are being enabled, request permissions
      if (newSettings.enabled && !settings.enabled) {
        const token = await registerForPushNotifications()

        if (!token) {
          Alert.alert(
            "Notification Permission",
            "Please enable notifications in your device settings to receive reminder alerts.",
            [{ text: "OK" }],
          )
        }
      }
    } catch (error) {
      console.error("Error saving notification settings:", error)
      Alert.alert("Error", "Failed to save notification settings")
    }
  }

  const handleToggleSetting = (setting: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [setting]: value }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleReminderTimeChange = (minutes: number) => {
    const newSettings = { ...settings, reminderTime: minutes }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false)

    if (selectedTime) {
      const timeString = format(selectedTime, "HH:mm")

      if (timePickerMode === "digest") {
        const newSettings = { ...settings, digestTime: timeString }
        setSettings(newSettings)
        saveSettings(newSettings)
      }
    }
  }

  const showDigestTimePicker = () => {
    setTimePickerMode("digest")
    setShowTimePicker(true)
  }

  const getTimePickerValue = () => {
    if (timePickerMode === "digest") {
      const [hours, minutes] = settings.digestTime.split(":").map(Number)
      const date = new Date()
      date.setHours(hours, minutes, 0, 0)
      return date
    }

    return new Date()
  }

  const handleSoundSelection = (soundId: string) => {
    if (editingSoundType === "default") {
      const newSettings = { ...settings, defaultSoundId: soundId }
      setSettings(newSettings)
      saveSettings(newSettings)
    } else if (editingSoundType) {
      const newTypeSounds = { ...settings.typeSounds, [editingSoundType]: soundId }
      const newSettings = { ...settings, typeSounds: newTypeSounds }
      setSettings(newSettings)
      saveSettings(newSettings)
    }
    setEditingSoundType(null)
  }

  const renderReminderTimeOptions = () => {
    const options = [
      { label: "At time", value: 0 },
      { label: "5 min before", value: 5 },
      { label: "15 min before", value: 15 },
      { label: "30 min before", value: 30 },
      { label: "1 hour before", value: 60 },
    ]

    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              {
                backgroundColor: settings.reminderTime === option.value ? colors.teal : colors.white,
                borderColor: colors.lightGray,
              },
            ]}
            onPress={() => handleReminderTimeChange(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                { color: settings.reminderTime === option.value ? colors.white : colors.navyBlue },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  const renderSoundSettings = () => {
    const reminderTypes: { id: ReminderType | "default"; label: string; emoji: string }[] = [
      { id: "default", label: "Default Sound", emoji: "🔔" },
      { id: "pill", label: "Pill Reminders", emoji: "💊" },
      { id: "patch", label: "Patch Reminders", emoji: "🩹" },
      { id: "ring", label: "Ring Reminders", emoji: "⭕" },
      { id: "injection", label: "Injection Reminders", emoji: "💉" },
      { id: "appointment", label: "Appointment Reminders", emoji: "🗓️" },
      { id: "other", label: "Other Reminders", emoji: "⏰" },
    ]

    return (
      <View style={styles.soundSettingsContainer}>
        <TouchableOpacity style={styles.soundSettingsHeader} onPress={() => setShowSoundSettings(!showSoundSettings)}>
          <Text style={[styles.soundSettingsTitle, { color: colors.navyBlue }]}>Customize Sounds</Text>
          {showSoundSettings ? (
            <ChevronUp stroke={colors.teal} width={20} height={20} />
          ) : (
            <ChevronDown stroke={colors.teal} width={20} height={20} />
          )}
        </TouchableOpacity>

        {showSoundSettings && (
          <View style={styles.soundTypesList}>
            {reminderTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.soundTypeItem, { borderColor: colors.lightGray }]}
                onPress={() => setEditingSoundType(type.id)}
              >
                <View style={styles.soundTypeInfo}>
                  <Text style={styles.soundTypeEmoji}>{type.emoji}</Text>
                  <Text style={[styles.soundTypeLabel, { color: colors.navyBlue }]}>{type.label}</Text>
                </View>
                <Text style={[styles.soundTypeCurrent, { color: colors.gray }]}>
                  {type.id === "default"
                    ? settings.defaultSoundId
                    : settings.typeSounds[type.id] || settings.defaultSoundId}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {editingSoundType && (
          <View style={styles.soundSelectorContainer}>
            <Text style={[styles.soundSelectorTitle, { color: colors.navyBlue }]}>
              Select Sound for {reminderTypes.find((type) => type.id === editingSoundType)?.label || "Reminders"}
            </Text>
            <SoundSelector
              selectedSoundId={
                editingSoundType === "default"
                  ? settings.defaultSoundId
                  : settings.typeSounds[editingSoundType] || settings.defaultSoundId
              }
              onSelectSound={handleSoundSelection}
            />
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header
        title="Notification Settings"
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => router.push(ROUTES.MAIN.PROFILE.MAIN as any)}>
            <X stroke={colors.navyBlue} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Bell stroke={colors.teal} width={20} height={20} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.navyBlue }]}>Enable Notifications</Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => handleToggleSetting("enabled", value)}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
            />
          </View>

          {settings.enabled && (
            <>
              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <Bell stroke={colors.teal} width={20} height={20} style={styles.settingIcon} />
                  <Text style={[styles.settingLabel, { color: colors.navyBlue }]}>Reminder Alerts</Text>
                </View>
                <Switch
                  value={settings.reminderAlerts}
                  onValueChange={(value) => handleToggleSetting("reminderAlerts", value)}
                  trackColor={{ false: colors.lightGray, true: colors.teal }}
                  thumbColor={colors.white}
                />
              </View>

              {settings.reminderAlerts && (
                <View style={styles.subsetting}>
                  <Text style={[styles.subsettingLabel, { color: colors.navyBlue }]}>Alert Time</Text>
                  {renderReminderTimeOptions()}
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <Clock stroke={colors.teal} width={20} height={20} style={styles.settingIcon} />
                  <Text style={[styles.settingLabel, { color: colors.navyBlue }]}>Daily Digest</Text>
                </View>
                <Switch
                  value={settings.dailyDigest}
                  onValueChange={(value) => handleToggleSetting("dailyDigest", value)}
                  trackColor={{ false: colors.lightGray, true: colors.teal }}
                  thumbColor={colors.white}
                />
              </View>

              {settings.dailyDigest && (
                <View style={styles.subsetting}>
                  <Text style={[styles.subsettingLabel, { color: colors.navyBlue }]}>Digest Time</Text>
                  <TouchableOpacity
                    style={[styles.timeButton, { borderColor: colors.lightGray }]}
                    onPress={showDigestTimePicker}
                  >
                    <Clock stroke={colors.teal} width={16} height={16} style={styles.timeIcon} />
                    <Text style={[styles.timeText, { color: colors.navyBlue }]}>
                      {format(parse(settings.digestTime, "HH:mm", new Date()), "h:mm a")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <Volume2 stroke={colors.teal} width={20} height={20} style={styles.settingIcon} />
                  <Text style={[styles.settingLabel, { color: colors.navyBlue }]}>Sound</Text>
                </View>
                <Switch
                  value={settings.sound}
                  onValueChange={(value) => handleToggleSetting("sound", value)}
                  trackColor={{ false: colors.lightGray, true: colors.teal }}
                  thumbColor={colors.white}
                />
              </View>

              {settings.sound && renderSoundSettings()}

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <Bell stroke={colors.teal} width={20} height={20} style={styles.settingIcon} />
                  <Text style={[styles.settingLabel, { color: colors.navyBlue }]}>Vibration</Text>
                </View>
                <Switch
                  value={settings.vibration}
                  onValueChange={(value) => handleToggleSetting("vibration", value)}
                  trackColor={{ false: colors.lightGray, true: colors.teal }}
                  thumbColor={colors.white}
                />
              </View>
            </>
          )}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.teal + "20" }]}>
          <Text style={[styles.infoText, { color: colors.navyBlue }]}>
            Notifications help you stay on track with your contraception schedule. Customize sounds to easily identify
            different types of reminders.
          </Text>
        </View>
      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={getTimePickerValue()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 8,
  },
  subsetting: {
    paddingLeft: 32,
    paddingTop: 8,
    paddingBottom: 16,
  },
  subsettingLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    margin: 4,
  },
  optionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  timeIcon: {
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  soundSettingsContainer: {
    paddingLeft: 32,
    paddingTop: 8,
    paddingBottom: 8,
  },
  soundSettingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  soundSettingsTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  soundTypesList: {
    marginTop: 8,
  },
  soundTypeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  soundTypeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  soundTypeEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  soundTypeLabel: {
    fontSize: 14,
  },
  soundTypeCurrent: {
    fontSize: 12,
  },
  soundSelectorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  soundSelectorTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
})

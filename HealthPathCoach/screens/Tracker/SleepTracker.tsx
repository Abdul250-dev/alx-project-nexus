import DateTimePicker from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"
import { AlertCircle, Clock, Moon, Sun, TrendingUp, X } from "react-native-feather"
import AnimatedButton from "../../components/AnimatedButton"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"
import { t } from "../../services/localizationService"
import { logSleep } from "../../services/trackerService"

interface SleepQualityFactors {
  stress: boolean
  caffeine: boolean
  exercise: boolean
  screenTime: boolean
  noise: boolean
  temperature: boolean
  pain: boolean
}

export default function SleepTracker() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { userData } = useUser()

  const [bedTime, setBedTime] = useState("22:00")
  const [wakeTime, setWakeTime] = useState("06:00")
  const [sleepDuration, setSleepDuration] = useState(8)
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good")
  const [qualityFactors, setQualityFactors] = useState<SleepQualityFactors>({
    stress: false,
    caffeine: false,
    exercise: false,
    screenTime: false,
    noise: false,
    temperature: false,
    pain: false,
  })
  const [loading, setLoading] = useState(false)

  // Time picker states
  const [showBedTimePicker, setShowBedTimePicker] = useState(false)
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false)
  const [bedTimeDate, setBedTimeDate] = useState(new Date().setHours(22, 0, 0, 0))
  const [wakeTimeDate, setWakeTimeDate] = useState(new Date().setHours(6, 0, 0, 0))

  // Calculate sleep duration automatically
  useEffect(() => {
    const calculateSleepDuration = () => {
      const [bedHour, bedMinute] = bedTime.split(':').map(Number)
      const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number)

      let bedMinutes = bedHour * 60 + bedMinute
      let wakeMinutes = wakeHour * 60 + wakeMinute

      // Handle overnight sleep (bed time > wake time)
      if (bedMinutes > wakeMinutes) {
        wakeMinutes += 24 * 60 // Add 24 hours
      }

      const durationHours = (wakeMinutes - bedMinutes) / 60
      setSleepDuration(Math.max(0, Math.min(24, durationHours)))
    }

    calculateSleepDuration()
  }, [bedTime, wakeTime])

  // Auto-suggest sleep quality based on duration
  useEffect(() => {
    const suggestSleepQuality = () => {
      if (sleepDuration < 6) {
        setSleepQuality("poor")
      } else if (sleepDuration < 7) {
        setSleepQuality("fair")
      } else if (sleepDuration < 9) {
        setSleepQuality("good")
      } else {
        setSleepQuality("excellent")
      }
    }

    suggestSleepQuality()
  }, [sleepDuration])

  const handleBedTimeChange = (event: any, selectedDate?: Date) => {
    setShowBedTimePicker(false)
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0')
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0')
      const timeString = `${hours}:${minutes}`
      setBedTime(timeString)
      setBedTimeDate(selectedDate.getTime())
    }
  }

  const handleWakeTimeChange = (event: any, selectedDate?: Date) => {
    setShowWakeTimePicker(false)
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0')
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0')
      const timeString = `${hours}:${minutes}`
      setWakeTime(timeString)
      setWakeTimeDate(selectedDate.getTime())
    }
  }

  const toggleQualityFactor = (factor: keyof SleepQualityFactors) => {
    setQualityFactors(prev => ({
      ...prev,
      [factor]: !prev[factor]
    }))
  }

  const getSleepQualitySuggestion = () => {
    const negativeFactors = Object.values(qualityFactors).filter(Boolean).length

    if (sleepDuration < 6) {
      return {
        title: "Insufficient Sleep",
        message: "You slept less than 6 hours. This can affect your reproductive health and hormone balance.",
        color: colors.error || "#FF6B6B"
      }
    } else if (sleepDuration > 10) {
      return {
        title: "Excessive Sleep",
        message: "You slept more than 10 hours. While occasional long sleep is fine, consistent oversleeping may indicate underlying health issues.",
        color: colors.warning || "#FFA726"
      }
    } else if (negativeFactors > 3) {
      return {
        title: "Multiple Sleep Disruptors",
        message: "Several factors may have affected your sleep quality. Consider addressing these for better sleep.",
        color: colors.warning || "#FFA726"
      }
    } else if (sleepDuration >= 7 && sleepDuration <= 9 && negativeFactors <= 2) {
      return {
        title: "Good Sleep Pattern",
        message: "Great sleep duration! You're within the optimal 7-9 hour range for reproductive health.",
        color: colors.success || "#4CAF50"
      }
    } else {
      return {
        title: "Moderate Sleep",
        message: "Your sleep duration is acceptable, but there's room for improvement.",
        color: colors.teal
      }
    }
  }

  const getSleepTips = () => {
    const tips = []

    if (sleepDuration < 7) {
      tips.push("• Aim for 7-9 hours of sleep for optimal reproductive health")
      tips.push("• Try going to bed 30 minutes earlier")
    }

    if (qualityFactors.caffeine) {
      tips.push("• Avoid caffeine after 2 PM")
    }

    if (qualityFactors.screenTime) {
      tips.push("• Reduce screen time 1 hour before bed")
    }

    if (qualityFactors.stress) {
      tips.push("• Practice relaxation techniques before bed")
    }

    if (qualityFactors.temperature) {
      tips.push("• Keep bedroom temperature between 65-68°F (18-20°C)")
    }

    if (qualityFactors.noise) {
      tips.push("• Use white noise or earplugs to block noise")
    }

    if (qualityFactors.pain) {
      tips.push("• Consider using a heating pad for menstrual cramps")
    }

    return tips.length > 0 ? tips : ["• Maintain a consistent sleep schedule", "• Create a cool, dark, and quiet sleep environment"]
  }

  const handleSaveLog = async () => {
    if (!userData) return

    const sessionId = Math.random().toString(36).substr(2, 9);
    console.log(`[SleepTracker] 🚀 Starting sleep save [Session: ${sessionId}]`);
    console.log(`[SleepTracker] 😴 Sleep data:`, {
      userId: userData.id,
      date: new Date().toISOString().split('T')[0],
      hours: sleepDuration,
      quality: sleepQuality,
      bedTime,
      wakeTime,
      qualityFactors
    });

    setLoading(true)

    try {
      const today = new Date()
      const dateString = today.toISOString().split('T')[0] // Format as YYYY-MM-DD

      const startTime = Date.now();
      const result = await logSleep(userData.id, {
        date: dateString,
        hours: sleepDuration,
        quality: sleepQuality,
        bedTime,
        wakeTime,
      })
      const duration = Date.now() - startTime;

      console.log(`[SleepTracker] ✅ Sleep saved to Firebase [Session: ${sessionId}] [Duration: ${duration}ms]`);
      console.log(`[SleepTracker] 📡 Sleep save result:`, result);

      navigation.goBack()
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[SleepTracker] ❌ Error logging sleep [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
      console.error(`[SleepTracker] ❌ Sleep error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        sleepData: {
          date: new Date().toISOString().split('T')[0],
          hours: sleepDuration,
          quality: sleepQuality,
          bedTime,
          wakeTime
        }
      });
    } finally {
      setLoading(false)
    }
  }

  const suggestion = getSleepQualitySuggestion()
  const tips = getSleepTips()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('tracker.sleep_tracker', 'Sleep Tracker')}
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X stroke={colors.text} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sleep Duration Display */}
        <View style={[styles.durationCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.durationHeader}>
            <Clock stroke={colors.teal} width={24} height={24} />
            <Text style={[styles.durationTitle, { color: colors.text }]}>
              {t('tracker.sleep_duration', 'Sleep Duration')}
            </Text>
          </View>

          <View style={styles.durationDisplay}>
            <Text style={[styles.durationHours, { color: colors.teal }]}>
              {sleepDuration.toFixed(1)}
            </Text>
            <Text style={[styles.durationUnit, { color: colors.textSecondary }]}>
              {t('tracker.hours', 'hours')}
            </Text>
          </View>

          <Text style={[styles.durationSubtext, { color: colors.textSecondary }]}>
            {bedTime} - {wakeTime}
          </Text>
        </View>

        {/* Bed Time Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('tracker.bed_time', 'Bed Time')}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('tracker.when_did_you_sleep', 'When did you go to bed?')}
          </Text>

          <TouchableOpacity
            style={[styles.timePickerButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => setShowBedTimePicker(true)}
          >
            <View style={styles.timePickerContent}>
              <Moon stroke={colors.teal} width={24} height={24} />
              <Text style={[styles.timePickerText, { color: colors.text }]}>{bedTime}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Wake Time Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('tracker.wake_time', 'Wake Time')}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('tracker.when_did_you_wake', 'When did you wake up?')}
          </Text>

          <TouchableOpacity
            style={[styles.timePickerButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => setShowWakeTimePicker(true)}
          >
            <View style={styles.timePickerContent}>
              <Sun stroke={colors.teal} width={24} height={24} />
              <Text style={[styles.timePickerText, { color: colors.text }]}>{wakeTime}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sleep Quality */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('tracker.sleep_quality', 'Sleep Quality')}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('tracker.rate_sleep_quality', 'How would you rate your sleep quality?')}
          </Text>

          <View style={styles.qualityContainer}>
            {(["poor", "fair", "good", "excellent"] as const).map((quality) => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.qualityButton,
                  {
                    backgroundColor: sleepQuality === quality ? colors.teal : colors.cardBackground,
                    borderWidth: sleepQuality === quality ? 0 : 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSleepQuality(quality)}
              >
                <Text style={[
                  styles.qualityText,
                  {
                    color: sleepQuality === quality ? colors.white : colors.text
                  }
                ]}>
                  {t(`tracker.${quality}`, quality.charAt(0).toUpperCase() + quality.slice(1))}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sleep Quality Factors */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('tracker.sleep_factors', 'Sleep Factors')}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('tracker.what_affected_sleep', 'What affected your sleep last night?')}
          </Text>

          <View style={styles.factorsContainer}>
            {[
              { key: 'stress', label: t('tracker.stress', 'Stress') },
              { key: 'caffeine', label: t('tracker.caffeine', 'Caffeine') },
              { key: 'exercise', label: t('tracker.exercise', 'Exercise') },
              { key: 'screenTime', label: t('tracker.screen_time', 'Screen Time') },
              { key: 'noise', label: t('tracker.noise', 'Noise') },
              { key: 'temperature', label: t('tracker.temperature', 'Temperature') },
              { key: 'pain', label: t('tracker.pain', 'Pain/Cramps') },
            ].map(({ key, label }) => (
              <View key={key} style={styles.factorRow}>
                <Text style={[styles.factorLabel, { color: colors.text }]}>{label}</Text>
                <Switch
                  value={qualityFactors[key as keyof SleepQualityFactors]}
                  onValueChange={() => toggleQualityFactor(key as keyof SleepQualityFactors)}
                  trackColor={{ false: colors.border, true: colors.teal }}
                  thumbColor={colors.white}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Sleep Quality Suggestion */}
        <View style={[styles.suggestionCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.suggestionHeader}>
            <AlertCircle stroke={suggestion.color} width={20} height={20} />
            <Text style={[styles.suggestionTitle, { color: suggestion.color }]}>
              {suggestion.title}
            </Text>
          </View>
          <Text style={[styles.suggestionMessage, { color: colors.textSecondary }]}>
            {suggestion.message}
          </Text>
        </View>

        {/* Sleep Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.tipsHeader}>
            <TrendingUp stroke={colors.teal} width={20} height={20} />
            <Text style={[styles.tipsTitle, { color: colors.teal }]}>
              {t('tracker.sleep_tips', 'Sleep Tips')}
            </Text>
          </View>
          {tips.map((tip, index) => (
            <Text key={index} style={[styles.tipText, { color: colors.textSecondary }]}>
              {tip}
            </Text>
          ))}
        </View>

        <AnimatedButton
          title={t('tracker.save_sleep_log', 'Save Sleep Log')}
          onPress={handleSaveLog}
          loading={loading}
          style={styles.saveButton}
        />
      </ScrollView>

      {/* Time Pickers */}
      {showBedTimePicker && (
        <DateTimePicker
          value={new Date(bedTimeDate)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleBedTimeChange}
        />
      )}

      {showWakeTimePicker && (
        <DateTimePicker
          value={new Date(wakeTimeDate)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleWakeTimeChange}
        />
      )}
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  qualityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  durationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  durationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  durationTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  durationDisplay: {
    alignItems: "center",
    marginBottom: 8,
  },
  durationHours: {
    fontSize: 48,
    fontWeight: "bold",
  },
  durationUnit: {
    fontSize: 16,
  },
  durationSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  factorsContainer: {
    marginTop: 16,
  },
  factorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  factorLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  suggestionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  suggestionTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  suggestionMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  timePickerButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timePickerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  timePickerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
})
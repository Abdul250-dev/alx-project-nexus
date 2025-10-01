import { differenceInDays, format, isAfter, isSameDay, startOfDay } from "date-fns"
import { doc, getDoc } from "firebase/firestore"
import { useCallback, useEffect, useState } from "react"
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { ChevronLeft, ChevronRight } from "react-native-feather"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useToast } from "../../components/ui/use-toast"
import { useTracker } from "../../context/TrackerContext"
import { useUser } from "../../context/UserContext"
import { db } from "../../services/firebase"; // adjust path if needed
import { canLogPeriod, type DayData } from "../../services/trackerService"


const { width } = Dimensions.get("window")

// Constants for better maintainability
const MIN_CYCLE_LENGTH_DAYS = 21
const SYMPTOM_CHECK_DAYS = 7
const DEFAULT_PERIOD_LENGTH = 5

const BLEEDING_OPTIONS = [
  { value: "light", label: "Light", color: "#FFB6C1" },
  { value: "medium", label: "Medium", color: "#FF69B4" },
  { value: "heavy", label: "Heavy", color: "#DC143C" },
  { value: "spotting", label: "Spotting", color: "#FFA07A" },
]

const SYMPTOMS_OPTIONS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Mood Swings",
  "Fatigue",
  "Nausea",
  "Back Pain",
  "Breast Tenderness",
  "Acne",
  "Constipation",
  "Diarrhea",
  "Insomnia",
]

const MOOD_OPTIONS = [
  "Happy",
  "Sad",
  "Anxious",
  "Energetic",
  "Calm",
  "Stressed",
  "Irritable",
  "Content",
  "Excited",
  "Depressed",
]

export default function MenstrualTracker() {
  const { colors } = useTheme()
  const { userData } = useUser()
  const {
    fertileWindow,
    periodHistory,
    loggedDayData,
    loading,
    refreshData,
    logPeriodData,
    deletePeriodData,
    saveDayData,
    deleteDayDataForDate,
    getDayDataForDate,
    loadDayDataForDateRange,
  } = useTracker()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dayData, setDayData] = useState<DayData>({
    date: format(new Date(), "yyyy-MM-dd"),
    userId: userData?.id || "",
    period: {
      isStart: false,
      isEnd: false,
      flow: undefined,
      symptoms: [],
    },
  })
  const [activeTab, setActiveTab] = useState<"view" | "log">("view")
  const [periodWarning, setPeriodWarning] = useState<string | null>(null)
  const { toast } = useToast()

  // Check if user can view/edit cycle data
  const canViewCycleData = useCallback(() => {
    if (userData?.gender === "female") return true
    if (userData?.gender === "male" && userData?.partnerId) return true
    return false
  }, [userData?.gender, userData?.partnerId])

  const canEditCycleData = useCallback(() => {
    return userData?.gender === "female"
  }, [userData?.gender])

  // Calendar utility functions
  const createDateOnly = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const selectDate = (date: Date) => {
    setSelectedDate(date)
    setActiveTab("view")
    // Use consistent date formatting without timezone conversion
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateKey = `${year}-${month}-${day}`
    const existingData = getDayDataForDate(dateKey)

    // Fix type safety issue: properly handle undefined existingData
    setDayData({
      date: dateKey,
      userId: userData?.id || "",
      period: undefined,
      mood: "",
      sexualActivity: false,
      notes: "",
      ...(existingData || {}), // Safely spread existingData
    })
  }

  const isToday = (date: Date) => {
    const today = createDateOnly(new Date())
    const dateOnly = createDateOnly(date)
    return isSameDate(dateOnly, today)
  }

  const isSelected = (date: Date) => {
    return selectedDate && isSameDate(createDateOnly(date), createDateOnly(selectedDate))
  }

  const isDateInFertileWindow = (date: Date) => {
    if (!fertileWindow?.fertileStart || !fertileWindow?.fertileEnd) return false

    try {
      const fertileStart = new Date(fertileWindow.fertileStart)
      const fertileEnd = new Date(fertileWindow.fertileEnd)

      if (isNaN(fertileStart.getTime()) || isNaN(fertileEnd.getTime())) return false

      const dateOnly = createDateOnly(date)
      const startOnly = createDateOnly(fertileStart)
      const endOnly = createDateOnly(fertileEnd)

      return dateOnly >= startOnly && dateOnly <= endOnly
    } catch (error) {
      console.warn("Error checking fertile window:", error)
      return false
    }
  }

  const isOvulationDate = (date: Date) => {
    if (!fertileWindow?.ovulationDate) return false

    try {
      const ovulationDate = new Date(fertileWindow.ovulationDate)
      if (isNaN(ovulationDate.getTime())) return false

      return isSameDate(createDateOnly(date), createDateOnly(ovulationDate))
    } catch (error) {
      console.warn("Error checking ovulation date:", error)
      return false
    }
  }

  const isPeriodDay = (date: Date): boolean => {
    if (!periodHistory || periodHistory.length === 0) return false

    return periodHistory.some((period) => {
      try {
        const startDate = new Date(period.startDate)
        if (isNaN(startDate.getTime())) return false

        const endDate = period.endDate
          ? new Date(period.endDate)
          : new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + DEFAULT_PERIOD_LENGTH - 1)

        if (isNaN(endDate.getTime())) return false

        const dateOnly = createDateOnly(date)
        const startOnly = createDateOnly(startDate)
        const endOnly = createDateOnly(endDate)

        return dateOnly >= startOnly && dateOnly <= endOnly
      } catch (error) {
        console.warn("Error checking period day:", error)
        return false
      }
    })
  }

  const isPredictedPeriodDay = (date: Date): boolean => {
    if (!fertileWindow?.nextPeriodStart) return false

    try {
      const nextPeriodStart = new Date(fertileWindow.nextPeriodStart)
      if (isNaN(nextPeriodStart.getTime())) return false

      const periodLength = fertileWindow.periodLength || DEFAULT_PERIOD_LENGTH
      const nextPeriodEnd = new Date(
        nextPeriodStart.getFullYear(),
        nextPeriodStart.getMonth(),
        nextPeriodStart.getDate() + (periodLength - 1),
      )

      const dateOnly = createDateOnly(date)
      const startOnly = createDateOnly(nextPeriodStart)
      const endOnly = createDateOnly(nextPeriodEnd)

      return dateOnly >= startOnly && dateOnly <= endOnly
    } catch (error) {
      console.warn("Error checking predicted period day:", error)
      return false
    }
  }

  const hasData = (date: Date) => {
    // Use consistent date formatting without timezone conversion
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateKey = `${year}-${month}-${day}`
    return !!getDayDataForDate(dateKey)
  }

  // Memoize expensive calculations
  const hasDataForDate = useCallback(
    (date: Date): boolean => {
      // Use consistent date formatting without timezone conversion
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const dateKey = `${year}-${month}-${day}`
      return !!getDayDataForDate(dateKey)
    },
    [getDayDataForDate],
  )

  // Memoize expensive period day calculations
  const isPeriodDayMemoized = useCallback(
    (date: Date): boolean => {
      return isPeriodDay(date)
    },
    [periodHistory]
  )

  const isPredictedPeriodDayMemoized = useCallback(
    (date: Date): boolean => {
      return isPredictedPeriodDay(date)
    },
    [fertileWindow?.nextPeriodStart, fertileWindow?.periodLength]
  )

  const isDateInFertileWindowMemoized = useCallback(
    (date: Date): boolean => {
      return isDateInFertileWindow(date)
    },
    [fertileWindow?.fertileStart, fertileWindow?.fertileEnd]
  )

  const isOvulationDateMemoized = useCallback(
    (date: Date): boolean => {
      return isOvulationDate(date)
    },
    [fertileWindow?.ovulationDate]
  )

  useEffect(() => {
    let isMounted = true

    if (!userData?.id || !selectedDate) return

    const loadDayData = async () => {
      try {
        const dateKey = format(selectedDate, "yyyy-MM-dd")
        const existingData = getDayDataForDate(dateKey)

        if (!isMounted) return

        if (existingData) {
          setDayData({
            userId: userData.id,
            date: dateKey,
            ...existingData,
          })
        } else {
          setDayData({
            userId: userData.id,
            date: dateKey,
            period: undefined,
            mood: "",
            sexualActivity: false,
            notes: "",
          })
        }
      } catch (error) {
        console.error("Error loading day data:", error)
        if (!isMounted) return
        // Set default data on error
        setDayData({
          userId: userData.id,
          date: format(selectedDate, "yyyy-MM-dd"),
          period: undefined,
          mood: "",
          sexualActivity: false,
          notes: "",
        })
      }
    }

    loadDayData()

    return () => {
      isMounted = false
    }
  }, [selectedDate, getDayDataForDate, userData?.id])

  useEffect(() => {
    // Load day data for the current month when month changes
    if (canViewCycleData() && userData?.id) {
      try {
        const monthDays = getDaysInMonth(currentMonth)
        const validDates = monthDays.filter((date) => date !== null) as Date[]

        // Fix array access issue: check if validDates has elements before accessing
        if (validDates.length > 0) {
          const startDate = validDates[0]
          const endDate = validDates[validDates.length - 1]
          loadDayDataForDateRange(startDate, endDate)
        }
      } catch (error) {
        console.error("Error loading month data:", error)
      }
    }
  }, [currentMonth, userData?.id, canViewCycleData, loadDayDataForDateRange])

  // Validation function for period logging (follows specification)
  const validatePeriodLogging = (dateToLog: Date): { isValid: boolean; message: string } => {
    const today = startOfDay(new Date())
    const logDate = startOfDay(dateToLog)

    // ❌ Cannot save period in the future (per specification)
    if (isAfter(logDate, today)) {
      return {
        isValid: false,
        message: "You cannot record a period for a future date. Please select today or a past date.",
      }
    }

    // Check for minimum cycle length
    if ((periodHistory?.length || 0) > 0) {
      const lastPeriod = periodHistory[0] // Most recent period
      const lastPeriodStart = new Date(lastPeriod.startDate)
      const daysSinceLastPeriod = differenceInDays(logDate, lastPeriodStart)

      if (daysSinceLastPeriod < MIN_CYCLE_LENGTH_DAYS && daysSinceLastPeriod > 0) {
        return {
          isValid: false,
          message: `Your last period was only ${daysSinceLastPeriod} days ago. Cycles shorter than ${MIN_CYCLE_LENGTH_DAYS} days may indicate a medical condition. Please consult with a healthcare provider.`,
        }
      }
    }

    return { isValid: true, message: "" }
  }

  // Fixed handler for logging period with 7-day rule
  const handleLogPeriod = async () => {
    if (!selectedDate || !userData?.id) return

    const sessionId = Math.random().toString(36).substr(2, 9);
    console.log(`[MenstrualTracker] 🚀 Starting period log [Session: ${sessionId}]`);
    console.log(`[MenstrualTracker] 📅 Period data:`, {
      userId: userData.id,
      selectedDate: selectedDate.toISOString(),
      userGender: userData.gender
    });

    const userId = userData.id // Fix type safety: ensure userId is not undefined
    let adjustedStartDate = selectedDate

    // Check 1-7 days before selectedDate for period symptoms
    // FIXED: Find the earliest date with symptoms, not the last
    for (let i = 1; i <= SYMPTOM_CHECK_DAYS; i++) {
      const checkDate = new Date(selectedDate)
      checkDate.setDate(selectedDate.getDate() - i)
      const dateKey = format(checkDate, "yyyy-MM-dd")
      const dayDataForCheck = getDayDataForDate(dateKey)

      if (dayDataForCheck?.period?.symptoms?.some((s: string) => SYMPTOMS_OPTIONS.includes(s))) {
        adjustedStartDate = checkDate
        console.log(`[MenstrualTracker] 🔍 Found symptoms on ${dateKey}, adjusted start date [Session: ${sessionId}]`);
        break // Exit loop when we find the earliest date with symptoms
      }
    }

    const dateStr = format(adjustedStartDate, "yyyy-MM-dd")
    console.log(`[MenstrualTracker] 📝 Final period start date: ${dateStr} [Session: ${sessionId}]`);

    const check = await canLogPeriod(userId, dateStr)
    console.log(`[MenstrualTracker] ✅ Period validation result:`, check);

    if (!check.allowed) {
      console.log(`[MenstrualTracker] ❌ Period validation failed: ${check.message} [Session: ${sessionId}]`);
      setPeriodWarning(check.message || "You already recorded your period recently.")
      return
    }

    setPeriodWarning(null)

    // Log period start to Firestore period collection
    const startTime = Date.now();
    const result = await logPeriodData(adjustedStartDate)
    const duration = Date.now() - startTime;

    console.log(`[MenstrualTracker] 📡 Period log result [Session: ${sessionId}] [Duration: ${duration}ms]:`, result);

    if (result.success) {
      console.log(`[MenstrualTracker] ✅ Period logged successfully [Session: ${sessionId}]`);

      // Get the day data for the adjusted start date, not the selected date
      const adjustedDateKey = format(adjustedStartDate, "yyyy-MM-dd")
      const adjustedDayData = getDayDataForDate(adjustedDateKey) || {
        date: adjustedDateKey,
        userId: userData.id,
        period: undefined,
        mood: "",
        sexualActivity: false,
        notes: "",
      }

      console.log(`[MenstrualTracker] 📊 Adjusted day data:`, adjustedDayData);

      // Update the current dayData state to reflect the adjusted date
      setDayData((prev) => ({
        ...prev,
        date: adjustedDateKey,
        period: {
          ...(prev.period || {}),
          isStart: true,
          isEnd: false,
          symptoms: adjustedDayData.period?.symptoms || [],
        },
      }))

      // Save the adjusted day data
      await saveDayData(adjustedDateKey, {
        ...adjustedDayData,
        date: adjustedDateKey,
        period: {
          ...(adjustedDayData.period || {}),
          isStart: true,
          isEnd: false,
        },
      })

      await refreshData()

      // Debug log and toast
      const logData = {
        startDate: dateStr,
        symptoms: Array.isArray(adjustedDayData?.period?.symptoms) ? adjustedDayData.period.symptoms : [],
        flow: adjustedDayData?.period?.flow || null,
      }
      console.log(`[MenstrualTracker] 📝 Final period log data [Session: ${sessionId}]:`, logData)
      toast({
        title: "Period logged",
        description: `Start: ${logData.startDate}, Flow: ${logData.flow}, Symptoms: ${logData.symptoms.join(", ")}`,
        variant: "default"
      })
    } else {
      console.error(`[MenstrualTracker] ❌ Period log failed [Session: ${sessionId}]:`, result.message);
      toast({
        title: "Failed to log period",
        description: result.message || "Unknown error",
        variant: "destructive"
      })
      return
    }

    // After logging, check for irregular cycle
    if (periodHistory && periodHistory.length > 0) {
      const lastPeriod = periodHistory[0]
      const lastStart = new Date(lastPeriod.startDate)
      const daysBetween = differenceInDays(adjustedStartDate, lastStart)
      if (daysBetween < MIN_CYCLE_LENGTH_DAYS) {
        console.log(`[MenstrualTracker] ⚠️ Irregular cycle detected: ${daysBetween} days [Session: ${sessionId}]`);
        Alert.alert(
          "Irregular Cycle",
          `Your new period was detected less than ${MIN_CYCLE_LENGTH_DAYS} days after your previous cycle. This may indicate an irregular cycle. Please consult a healthcare provider.`
        )
      }
    }
  }

  // ✅ Primary form for saving logs (only one place to save per specification)
  const handleSaveDayData = async () => {
    if (!userData?.id || !canEditCycleData()) return

    const sessionId = Math.random().toString(36).substr(2, 9);
    console.log(`[MenstrualTracker] 🚀 Starting day data save [Session: ${sessionId}]`);
    console.log(`[MenstrualTracker] 📅 Day data:`, {
      userId: userData.id,
      date: dayData.date,
      period: dayData.period,
      mood: dayData.mood,
      sexualActivity: dayData.sexualActivity,
      notes: dayData.notes,
      selectedDate: selectedDate?.toISOString()
    });

    // Validate that at least one field is filled
    const hasPeriodData = dayData.period && (
      dayData.period.isStart ||
      dayData.period.isEnd ||
      dayData.period.flow ||
      (dayData.period.symptoms && dayData.period.symptoms.length > 0)
    )

    const hasContent =
      hasPeriodData ||
      dayData.mood ||
      dayData.sexualActivity ||
      (dayData.notes?.trim()?.length || 0) > 0

    if (!hasContent) {
      console.log(`[MenstrualTracker] ⚠️ No content to save [Session: ${sessionId}]`);
      Alert.alert("No Data", "Please fill in at least one field before saving.")
      return
    }

    // Special validation for period data
    if (dayData.period && selectedDate) {
      const validation = validatePeriodLogging(selectedDate)
      if (!validation.isValid) {
        console.log(`[MenstrualTracker] ❌ Period validation failed [Session: ${sessionId}]:`, validation.message);
        Alert.alert("Cannot Save Period", validation.message)
        return
      }
    }

    const startTime = Date.now();
    try {
      const dataToSave = {
        ...dayData,
        createdAt: new Date(),
      }

      console.log(`[MenstrualTracker] 📊 Data to save:`, JSON.stringify(dataToSave, null, 2));

      const success = await saveDayData(dayData.date, dataToSave)
      const duration = Date.now() - startTime;

      if (success) {
        console.log(`[MenstrualTracker] ✅ Day data saved successfully [Session: ${sessionId}] [Duration: ${duration}ms]`);
        Alert.alert("Success", "Data saved successfully!")
        await refreshData()
        // Debug log and toast
        const logData = {
          date: dayData.date,
          symptoms: dayData?.period?.symptoms || [],
          flow: dayData?.period?.flow || null,
        }
        console.log(`[MenstrualTracker] 📝 Final log data:`, logData)
        toast({
          title: "Day data saved",
          description: `Date: ${logData.date}, Flow: ${logData.flow}, Symptoms: ${logData.symptoms.join(", ")}`,
          variant: "default"
        })
      } else {
        console.error(`[MenstrualTracker] ❌ Day data save failed [Session: ${sessionId}] [Duration: ${duration}ms]`);
        Alert.alert("Error", "Failed to save data")
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[MenstrualTracker] ❌ Error saving day data [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
      console.error(`[MenstrualTracker] ❌ Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        dayData: dayData
      });
      Alert.alert("Error", "Failed to save data. Please try again.")
    }
  }

  const handleDeleteDayData = async (date: Date) => {
    if (!canEditCycleData()) return

    // Use consistent date formatting
    const dateKey = format(date, "yyyy-MM-dd")
    const hasData = hasDataForDate(date)

    if (!hasData) {
      Alert.alert("No Data", "No data found for this date.")
      return
    }

    // Debug log
    console.log("[Delete] Attempting to delete key:", dateKey, "for user:", userData?.id)
    Alert.alert("Delete Data", `Delete all logged data for ${format(date, "MMM d, yyyy")}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Debug log before deletion
            const existing = await (async () => {
              try {
                // Try to access AsyncStorage directly for debugging
                if (userData?.id) {
                  const key = dateKey
                  const value = await (await import("@react-native-async-storage/async-storage")).default.getItem(key)
                  console.log("[Delete] Existing data for key:", key, value)
                  return value
                }
              } catch (e) { console.log("[Delete] Error reading AsyncStorage", e) }
              return null
            })()
            // Ensure userData and userData.id are not null before calling deleteDayDataForDate
            if (!userData || !userData.id) {
              Alert.alert("Error", "User not found.")
              return
            }
            const success = await deleteDayDataForDate(dateKey)
            if (success) {
              // Debug: Check if the document still exists in Firestore
              const targetUserId = userData?.id // or use getTargetUserId() if you want to match context logic
              const docRef = doc(db, "users", targetUserId, "dayLogs", dateKey)
              const docSnap = await getDoc(docRef)
              if (!docSnap.exists()) {
                console.log(`[DEBUG] Firestore document for ${dateKey} successfully deleted.`)
              } else {
                console.log(`[DEBUG] Firestore document for ${dateKey} still exists:`, docSnap.data())
              }

              // Also delete period entry if this date is a period start
              const periodToDelete = periodHistory.find(
                (period) => period.startDate === dateKey
              )
              if (periodToDelete) {
                const periodDeleted = await deletePeriodData(periodToDelete.id)
                if (periodDeleted) {
                  console.log(`[DEBUG] Period entry for ${dateKey} deleted from period history.`)
                } else {
                  console.log(`[DEBUG] Failed to delete period entry for ${dateKey} from period history.`)
                }
              }

              Alert.alert("Success", "Data deleted successfully!")
              await refreshData()
            } else {
              Alert.alert("Error", "Failed to delete data")
              console.log("[Delete] Failed to delete data for key:", dateKey, "user:", userData?.id, "existing:", existing)
            }
          } catch (error) {
            console.error("Error deleting data:", error)
            Alert.alert("Error", "Failed to delete data. Please try again.")
          }
        },
      },
    ])
  }

  const updateDayData = (field: string, value: any) => {
    if (!canEditCycleData()) return
    setDayData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleSymptom = (symptom: string) => {
    if (!canEditCycleData()) return
    const currentSymptoms = dayData.period?.symptoms || []
    const newSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter((s: string) => s !== symptom)
      : [...currentSymptoms, symptom]
    updateDayData("period", {
      ...dayData.period,
      symptoms: newSymptoms,
    })
  }

  const renderMiniCalendar = () => {
    if (!canViewCycleData()) {
      return (
        <View style={[styles.miniCalendarContainer, { backgroundColor: colors.white }]}>
          <View style={styles.noAccessContainer}>
            <Text style={[styles.noAccessTitle, { color: colors.navyBlue }]}>Cycle Tracking</Text>
            <Text style={[styles.noAccessText, { color: colors.gray }]}>
              {userData?.gender === "male"
                ? "Connect with your partner to view their cycle data"
                : "Cycle tracking is available for female users"}
            </Text>
            {userData?.gender === "male" && (
              <TouchableOpacity
                style={[styles.connectPartnerButton, { backgroundColor: colors.teal }]}
                onPress={() => {
                  /* Navigate to partner connection */
                }}
                accessibilityLabel="Connect Partner"
                accessibilityHint="Navigate to partner connection screen"
              >
                <Text style={[styles.connectPartnerText, { color: colors.white }]}>Connect Partner</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )
    }

    const days = ["S", "M", "T", "W", "T", "F", "S"]
    const today = new Date()
    const monthDays = getDaysInMonth(currentMonth)

    const monthName = currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

    return (
      <View style={[styles.miniCalendarContainer, { backgroundColor: colors.white }]}>
        {/* Header */}
        <View style={styles.miniCalendarHeader}>
          <View style={styles.dateHeaderContainer}>
            <Text style={[styles.dateText, { color: colors.navyBlue }]}>
              {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </Text>
            <Text style={[styles.dateRangeText, { color: colors.gray }]}>{monthName}</Text>
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.lightBlue || "#E3F2FD" }]}
            onPress={() => {
              const prevMonth = new Date(currentMonth)
              prevMonth.setMonth(currentMonth.getMonth() - 1)
              setCurrentMonth(prevMonth)
            }}
            activeOpacity={0.7}
          >
            <ChevronLeft stroke={colors.teal} width={18} height={18} />
          </TouchableOpacity>

          <View style={styles.weekRangeContainer}>
            <Text style={[styles.weekRangeText, { color: colors.navyBlue }]}>{monthName}</Text>
          </View>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.lightBlue || "#E3F2FD" }]}
            onPress={() => {
              const nextMonth = new Date(currentMonth)
              nextMonth.setMonth(currentMonth.getMonth() + 1)
              setCurrentMonth(nextMonth)
            }}
            activeOpacity={0.7}
          >
            <ChevronRight stroke={colors.teal} width={18} height={18} />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeadersContainer}>
          {days.map((day, index) => (
            <View key={index} style={styles.dayHeaderMini}>
              <Text style={[styles.dayTextMini, { color: colors.gray }]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {monthDays.map((date, index) => {
            if (!date) {
              return <View key={index} style={styles.emptyDay} />
            }

            const isToday = isSameDay(date, today)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isPeriod = isPeriodDayMemoized(date)
            const isPredictedPeriod = isPredictedPeriodDayMemoized(date)
            const isFertile = isDateInFertileWindowMemoized(date)
            const isOvulation = isOvulationDateMemoized(date)
            const hasData = hasDataForDate(date)
            const isPastDate = createDateOnly(date) < createDateOnly(today)

            // Check if this date has logged flow data
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const day = String(date.getDate()).padStart(2, "0")
            const dateKey = `${year}-${month}-${day}`
            const dayDataForDate = getDayDataForDate(dateKey)
            const hasLoggedFlow = dayDataForDate?.period?.flow

            let backgroundColor = "transparent"
            let textColor = colors.black

            if (isSelected) {
              backgroundColor = colors.teal
              textColor = colors.white
            } else if (isToday) {
              backgroundColor = colors.teal
              textColor = colors.white
            } else if (hasLoggedFlow) {
              backgroundColor = colors.error
              textColor = colors.white
            } else if (isPeriod) {
              backgroundColor = colors.error
              textColor = colors.white
            } else if (isPredictedPeriod) {
              backgroundColor = "#FFB6C1"
              textColor = colors.white
            } else if (isOvulation) {
              backgroundColor = "#4169E1"
              textColor = colors.white
            } else if (isFertile) {
              backgroundColor = colors.lightBlue || "#E3F2FD"
              textColor = colors.navyBlue
            } else if (isPastDate) {
              textColor = colors.gray
            }

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCircleMini,
                  { backgroundColor },
                  isPastDate &&
                  !isToday &&
                  !hasLoggedFlow &&
                  !isPeriod &&
                  !isPredictedPeriod &&
                  !isFertile &&
                  !isOvulation && { opacity: 0.5 },
                ]}
                onPress={() => selectDate(date)}
                onLongPress={() => {
                  if (canEditCycleData() && hasData) {
                    handleDeleteDayData(date)
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateNumberMini, { color: textColor }]}>{date.getDate()}</Text>
                {hasData && !hasLoggedFlow && !isSelected && !isToday && (
                  <View
                    style={[
                      styles.dataIndicatorMini,
                      {
                        backgroundColor: isPeriod || isPredictedPeriod || isOvulation ? colors.white : colors.teal,
                      },
                    ]}
                  />
                )}
                {hasLoggedFlow && !isSelected && !isToday && (
                  <View style={[styles.flowIndicatorMini, { backgroundColor: colors.white }]} />
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.teal }]} />
              <Text style={[styles.legendText, { color: colors.gray }]}>Today</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={[styles.legendText, { color: colors.gray }]}>Period</Text>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FFB6C1" }]} />
              <Text style={[styles.legendText, { color: colors.gray }]}>Predicted</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.lightBlue || "#E3F2FD" }]} />
              <Text style={[styles.legendText, { color: colors.gray }]}>Fertile</Text>
            </View>
          </View>
          <View style={styles.legendRowCenter}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#4169E1" }]} />
              <Text style={[styles.legendText, { color: colors.gray }]}>Ovulation</Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        {canEditCycleData() && (
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsText, { color: colors.gray }]}>
              💡 Long press on dates to delete logged data
            </Text>
          </View>
        )}
      </View>
    )
  }

  const renderLogSection = () => {
    if (!canEditCycleData()) {
      return (
        <View style={styles.noEditContainer}>
          <Text style={[styles.noEditTitle, { color: colors.navyBlue }]}>View Only Mode</Text>
          <Text style={[styles.noEditText, { color: colors.gray }]}>
            You can view cycle data but cannot make changes. Only the account owner can log and edit cycle information.
          </Text>
        </View>
      )
    }

    if (!selectedDate) {
      return (
        <View style={styles.noDateContainer}>
          <Text style={[styles.noDateText, { color: colors.gray }]}>
            Select a date from the calendar to start logging
          </Text>
        </View>
      )
    }

    const today = new Date()
    const isPastOrToday = selectedDate <= today

    return (
      <View style={styles.logSection}>
        <View style={styles.logHeader}>
          <Text style={[styles.logTitle, { color: colors.navyBlue }]}>Daily Log</Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.teal }]} onPress={handleSaveDayData}>
            <Text style={[styles.saveButtonText, { color: colors.white }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.selectedDateText, { color: colors.gray }]}>
          {selectedDate?.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>

        {periodWarning && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>{periodWarning}</Text>
          </View>
        )}

        {/* Period Category */}
        <View style={[styles.categoryContainer, { backgroundColor: colors.white }]}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryDot, { backgroundColor: colors.error }]} />
            <Text style={[styles.categoryTitle, { color: colors.navyBlue }]}>PERIOD</Text>
          </View>

          {isPastOrToday ? (
            <View style={styles.buttonGrid}>
              {BLEEDING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.miniButton,
                    {
                      backgroundColor: dayData.period?.flow === option.value ? option.color : colors.lightBlue || "#E3F2FD",
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() =>
                    updateDayData("period", {
                      isStart: true,
                      isEnd: false,
                      flow: option.value,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.miniButtonText,
                      {
                        color: dayData.period?.flow === option.value ? colors.white : colors.navyBlue,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.disabledContainer}>
              <Text style={[styles.disabledText, { color: colors.gray }]}>❌ Cannot log period for future dates</Text>
            </View>
          )}
        </View>

        {/* Symptoms Category */}
        <View style={[styles.categoryContainer, { backgroundColor: colors.white }]}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryDot, { backgroundColor: "#A78BFA" }]} />
            <Text style={[styles.categoryTitle, { color: colors.navyBlue }]}>SYMPTOMS</Text>
          </View>

          <View style={styles.buttonGrid}>
            {SYMPTOMS_OPTIONS.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.miniButton,
                  {
                    backgroundColor: dayData.period?.symptoms?.includes(symptom) ? "#A78BFA" : colors.lightBlue || "#E3F2FD",
                    borderColor: "#A78BFA",
                  },
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text
                  style={[
                    styles.miniButtonText,
                    {
                      color: dayData.period?.symptoms?.includes(symptom) ? colors.white : colors.navyBlue,
                    },
                  ]}
                >
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood Category */}
        <View style={[styles.categoryContainer, { backgroundColor: colors.white }]}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={[styles.categoryTitle, { color: colors.navyBlue }]}>MOOD</Text>
          </View>

          <View style={styles.buttonGrid}>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.miniButton,
                  {
                    backgroundColor: dayData.mood === mood ? "#F59E0B" : colors.lightBlue || "#E3F2FD",
                    borderColor: "#F59E0B",
                  },
                ]}
                onPress={() => updateDayData("mood", mood)}
              >
                <Text
                  style={[
                    styles.miniButtonText,
                    {
                      color: dayData.mood === mood ? colors.white : colors.navyBlue,
                    },
                  ]}
                >
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sexual Activity */}
        <View style={[styles.categoryContainer, { backgroundColor: colors.white }]}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryDot, { backgroundColor: "#EC4899" }]} />
            <Text style={[styles.categoryTitle, { color: colors.navyBlue }]}>SEXUAL ACTIVITY</Text>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: dayData.sexualActivity ? "#EC4899" : colors.lightBlue || "#E3F2FD",
                  borderColor: "#EC4899",
                },
              ]}
              onPress={() => updateDayData("sexualActivity", !dayData.sexualActivity)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  {
                    color: dayData.sexualActivity ? colors.white : colors.navyBlue,
                  },
                ]}
              >
                {dayData.sexualActivity ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.categoryContainer, { backgroundColor: colors.white }]}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryDot, { backgroundColor: colors.gray }]} />
            <Text style={[styles.categoryTitle, { color: colors.navyBlue }]}>NOTES</Text>
            <Text style={[styles.optionalText, { color: colors.gray }]}>(Optional)</Text>
          </View>

          <TextInput
            style={[styles.notesInput, { borderColor: colors.gray, color: colors.black }]}
            placeholder="Add any additional notes..."
            placeholderTextColor={colors.gray}
            value={dayData.notes || ""}
            onChangeText={(text) => updateDayData("notes", text)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.offWhite }]}>
        <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
          <Header title="Cycle Tracking" showBackButton />
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.gray }]}>Loading cycle data...</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (!canViewCycleData()) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.offWhite }]}>
        <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
          <Header title="Cycle Tracking" showBackButton />
          <View style={styles.notAvailableContainer}>
            <Text style={[styles.notAvailableText, { color: colors.navyBlue }]}>
              {userData?.gender === "male"
                ? "Connect with your partner to view their cycle data"
                : "Cycle tracking is available for female users only."}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.offWhite }]}>
      <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
        <Header
          title="Cycle Tracking"
          showBackButton
          rightComponent={
            canEditCycleData() ? (
              <View style={styles.viewOnlyBadge}>
                <Text style={[styles.viewOnlyText, { color: colors.teal }]}>Edit Mode</Text>
              </View>
            ) : (
              <View style={styles.viewOnlyBadge}>
                <Text style={[styles.viewOnlyText, { color: colors.gray }]}>View Only</Text>
              </View>
            )
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderMiniCalendar()}
          {renderLogSection()}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  notAvailableContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notAvailableText: {
    fontSize: 18,
    textAlign: "center",
  },
  // Mini Calendar Styles (from MiniCalendar.tsx)
  miniCalendarContainer: {
    borderRadius: 15,
    padding: 18,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noAccessContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noAccessTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noAccessText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 20,
  },
  connectPartnerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  connectPartnerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  miniCalendarHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  dateHeaderContainer: {
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  dateRangeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  weekRangeContainer: {
    flex: 1,
    alignItems: "center",
  },
  weekRangeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dayHeadersContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeaderMini: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayTextMini: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  emptyDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  dateCircleMini: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 4,
  },
  dateNumberMini: {
    fontSize: 15,
    fontWeight: "bold",
  },
  dataIndicatorMini: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: "absolute",
    bottom: 6,
  },
  flowIndicatorMini: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    bottom: 6,
  },
  legendContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  legendRowCenter: {
    flexDirection: "row",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "center",
  },
  instructionsText: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  // Log Section Styles
  logSection: {
    margin: 16,
    marginTop: 0,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectedDateText: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "500",
  },
  noDateContainer: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noDateText: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  noEditContainer: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noEditTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  noEditText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  warningContainer: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  warningText: {
    color: "#856404",
    fontSize: 14,
  },
  viewOnlyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  viewOnlyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Category Styles
  categoryContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
  },
  optionalText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  disabledContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  disabledText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  // Button Styles
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  miniButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 60,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  miniButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  toggleContainer: {
    alignItems: "flex-start",
  },
  toggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Notes Input
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    backgroundColor: "#f9f9f9",
  },
})
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Activity, BarChart, Coffee, Droplet, Heart, Moon } from "react-native-feather"
import CycleInfoCard from "../../components/CycleInfoCard"
import MiniCalendar from "../../components/MiniCalendar"
import RemindersSection from "../../components/RemindersSection"
import { useTheme } from "../../components/theme-provider"
import { useTracker } from "../../context/TrackerContext"
import { useUser } from "../../context/UserContext"
import { t } from "../../services/localizationService"

// Import refactored components and hooks
import useCycleData from "../../hooks/useCycleData"
import useDayData from "../../hooks/useDayData"
import useReminders from "../../hooks/useReminders"

export default function HomeScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { userData } = useUser()
  const {
    fertileWindow,
    periodHistory,
    loggedDayData,
    saveDayData,
    deleteDayDataForDate,
    getDayDataForDate,
    loadDayDataForDateRange,
    refreshData,
  } = useTracker()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [daysToOvulation, setDaysToOvulation] = useState<number | null>(null)
  const [showLMPBanner, setShowLMPBanner] = useState(true)
  const [lastBannerDismissal, setLastBannerDismissal] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<"view" | "log">("view")
  const [twoWeekStartDate, setTwoWeekStartDate] = useState(new Date())

  // Memoize the cycle data functions to prevent recreation on every render
  const { canViewCycleData, canEditCycleData } = useCycleData({
    fertileWindow,
    periodHistory,
    userData,
    getDayDataForDate,
  })

  // Memoize these functions to prevent infinite loops
  const memoizedCanViewCycleData = useCallback(() => {
    if (userData?.gender === "female") return true
    if (userData?.gender === "male" && userData?.partnerId) return true
    return false
  }, [userData?.gender, userData?.partnerId])

  const memoizedCanEditCycleData = useCallback(() => {
    return userData?.gender === "female"
  }, [userData?.gender])

  // Custom Hooks with memoized dependencies
  const { upcomingReminders } = useReminders({ userData })
  const { dayData, setDayData } = useDayData({
    getDayDataForDate,
    saveDayData,
    deleteDayDataForDate,
    refreshData,
    userData,
    canEditCycleData: memoizedCanEditCycleData,
  })

  // Memoize the getTwoWeekDates function
  const getTwoWeekDates = useCallback(() => {
    const dates = []
    for (let i = 0; i < 14; i++) {
      const date = new Date(twoWeekStartDate)
      date.setDate(twoWeekStartDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [twoWeekStartDate])

  // Initialize two-week view - only run once
  useEffect(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
    const startOfCurrentWeek = new Date(today)
    startOfCurrentWeek.setDate(today.getDate() + mondayOffset)
    setTwoWeekStartDate(startOfCurrentWeek)
  }, []) // Keep this to run only once on mount for calendar setup

  // **NEW**: Use useFocusEffect to refresh data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      // Load a full year of day data for seamless sync
      if (memoizedCanViewCycleData()) {
        const today = new Date()
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(today.getFullYear() - 1)

        // Refresh primary data (period history, fertile window)
        refreshData()

        // Refresh detailed day-by-day data
        loadDayDataForDateRange(oneYearAgo, today)
      }
    }, [memoizedCanViewCycleData, refreshData, loadDayDataForDateRange])
  )

  // Calculate days to ovulation - only when fertileWindow changes
  useEffect(() => {
    if (fertileWindow?.ovulationDate) {
      const today = new Date()
      const ovulationDate = new Date(fertileWindow.ovulationDate)
      const diffTime = ovulationDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysToOvulation(diffDays)
    } else {
      setDaysToOvulation(null)
    }
  }, [fertileWindow?.ovulationDate]) // Only depend on the specific property

  // Check if user is female and has no period data
  useEffect(() => {
    const checkLmpBanner = async () => {
      if (userData?.gender !== "female") {
        setShowLMPBanner(false)
        return
      }
      // Check if any period data is logged
      let hasPeriodData = false
      const today = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(today.getFullYear() - 1)
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split("T")[0]
        const dayData = getDayDataForDate?.(dateKey)
        if (dayData?.period?.flow && dayData.period.isStart) {
          hasPeriodData = true
          break
        }
      }
      if (hasPeriodData) {
        setShowLMPBanner(false)
        return
      }
      // Check last shown time
      const lastShown = await AsyncStorage.getItem("lmpBannerLastShown")
      const now = Date.now()
      if (!lastShown || now - parseInt(lastShown, 10) > 2 * 24 * 60 * 60 * 1000) {
        setShowLMPBanner(true)
        await AsyncStorage.setItem("lmpBannerLastShown", now.toString())
      } else {
        setShowLMPBanner(false)
      }
    }
    checkLmpBanner()
  }, [userData, getDayDataForDate])

  const handleDismissLmpBanner = async () => {
    setShowLMPBanner(false)
    await AsyncStorage.setItem("lmpBannerLastShown", Date.now().toString())
  }

  const handleLogPeriod = () => {
    router.push("/main/tracker/menstrual")
    setShowLMPBanner(false)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.offWhite }]}>
      {/* App Title Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.offWhite }]}>
        <Text style={[styles.appTitle, { color: colors.navyBlue }]}>
          HealthPath Coach
        </Text>
        <Text style={[styles.welcomeText, { color: colors.gray }]}>
          Welcome back, {userData?.displayName?.split(' ')[0] || 'User'}!
        </Text>
      </View>

      {/* LMP Prompt Banner */}
      {showLMPBanner && (
        <View style={{ backgroundColor: colors.teal, padding: 16, margin: 15, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: colors.white, fontWeight: "bold", flex: 1 }}>
            {t("tracker.lmp_prompt", "To get accurate predictions, please log the first day of your last period.")}
          </Text>
          <TouchableOpacity
            onPress={handleLogPeriod}
            style={{ backgroundColor: colors.white, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14, marginLeft: 12 }}
          >
            <Text style={{ color: colors.teal, fontWeight: "bold", fontSize: 14 }}>{t("tracker.log_period_button", "Log Period")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDismissLmpBanner} style={{ marginLeft: 12 }}>
            <Text style={{ color: colors.white, fontWeight: "bold", fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mini Calendar - At the top */}
        <MiniCalendar
          currentDate={currentDate}
          twoWeekStartDate={twoWeekStartDate}
          setTwoWeekStartDate={setTwoWeekStartDate}
          fertileWindow={fertileWindow}
          periodHistory={periodHistory}
          loggedDayData={loggedDayData}
          getDayDataForDate={getDayDataForDate}
          canViewCycleData={memoizedCanViewCycleData}
          canEditCycleData={memoizedCanEditCycleData}
          router={router}
          colors={{
            white: colors.white,
            navyBlue: colors.navyBlue,
            gray: colors.gray,
            teal: colors.teal,
            black: colors.black,
            error: colors.error,
            lightBlue: colors.lightBlue || "#B3E5FC"
          }}
          userData={userData}
        />

        {/* Cycle Info Card */}
        <CycleInfoCard
          fertileWindow={fertileWindow}
          periodHistory={periodHistory}
          userData={userData}
          colors={colors}
          router={router}
          daysToOvulation={daysToOvulation}
          getDayDataForDate={getDayDataForDate}
        />

        {/* Tracker Cards */}
        <View style={styles.trackerCardsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>
            {t("tracker.health_trackers", "Health Trackers")}
          </Text>
          <View style={styles.trackerGrid}>
            {/* Only show Cycle Tracking card for female users */}
            {userData?.gender === 'female' && (
              <TouchableOpacity
                style={[styles.trackerCard, { backgroundColor: colors.white }]}
                onPress={() => router.push({ pathname: '/main/tracker/menstrual' })}
              >
                <View style={[styles.trackerIcon, { backgroundColor: colors.lightBlue || "#B3E5FC" }]}>
                  <Droplet stroke={colors.teal} width={24} height={24} />
                </View>
                <Text style={[styles.trackerTitle, { color: colors.navyBlue }]}>
                  {t("tracker.cycle_tracking", "Cycle Tracking")}
                </Text>
                <Text style={[styles.trackerSubtitle, { color: colors.gray }]}>
                  {t("tracker.track_period", "Log your period and symptoms")}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.trackerCard, { backgroundColor: colors.white }]}
              onPress={() => router.push("/main/tracker/nutrition")}
            >
              <View style={[styles.trackerIcon, { backgroundColor: colors.lightBlue || "#B3E5FC" }]}>
                <Coffee stroke={colors.teal} width={24} height={24} />
              </View>
              <Text style={[styles.trackerTitle, { color: colors.navyBlue }]}>
                {t("tracker.nutrition_tracker", "Nutrition")}
              </Text>
              <Text style={[styles.trackerSubtitle, { color: colors.gray }]}>
                {t("tracker.track_nutrition", "Track your daily nutrition")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.trackerCard, { backgroundColor: colors.white }]}
              onPress={() => router.push("/main/tracker/mood")}
            >
              <View style={[styles.trackerIcon, { backgroundColor: colors.lightBlue || "#B3E5FC" }]}>
                <Heart stroke={colors.teal} width={24} height={24} />
              </View>
              <Text style={[styles.trackerTitle, { color: colors.navyBlue }]}>
                {t("tracker.mood_tracker", "Mood")}
              </Text>
              <Text style={[styles.trackerSubtitle, { color: colors.gray }]}>
                {t("tracker.track_mood", "Track your mood patterns")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.trackerCard, { backgroundColor: colors.white }]}
              onPress={() => router.push("/main/tracker/sleep")}
            >
              <View style={[styles.trackerIcon, { backgroundColor: colors.lightBlue || "#B3E5FC" }]}>
                <Moon stroke={colors.teal} width={24} height={24} />
              </View>
              <Text style={[styles.trackerTitle, { color: colors.navyBlue }]}>
                {t("tracker.sleep_tracker", "Sleep")}
              </Text>
              <Text style={[styles.trackerSubtitle, { color: colors.gray }]}>
                {t("tracker.track_sleep", "Track your sleep quality")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.trackerCard, { backgroundColor: colors.white }]}
              onPress={() => router.push("/main/tracker/activities")}
            >
              <View style={[styles.trackerIcon, { backgroundColor: colors.lightBlue || "#B3E5FC" }]}>
                <Activity stroke={colors.teal} width={24} height={24} />
              </View>
              <Text style={[styles.trackerTitle, { color: colors.navyBlue }]}>
                {t("tracker.activities_tracker", "Activities")}
              </Text>
              <Text style={[styles.trackerSubtitle, { color: colors.gray }]}>
                {t("tracker.track_activities", "Track your physical activities")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.trackerCard, { backgroundColor: colors.white }]}
              onPress={() => router.push("/main/tracker/progress")}
            >
              <View style={[styles.trackerIcon, { backgroundColor: colors.lightBlue || "#B3E5FC" }]}>
                <BarChart stroke={colors.teal} width={24} height={24} />
              </View>
              <Text style={[styles.trackerTitle, { color: colors.navyBlue }]}>Progress</Text>
              <Text style={[styles.trackerSubtitle, { color: colors.gray }]}>View your progress charts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminders Section */}
        <RemindersSection
          colors={{
            white: colors.white,
            navyBlue: colors.navyBlue,
            gray: colors.gray,
            teal: colors.teal,
            black: colors.black,
            error: colors.error,
            lightBlue: colors.lightBlue || "#B3E5FC"
          }}
          upcomingReminders={upcomingReminders}
          router={router}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  scrollContent: {
    padding: 15,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.8,
  },
  trackerCardsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  trackerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  trackerCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trackerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  trackerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trackerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
})

import type { useRouter } from "expo-router"
import type React from "react"
import { useMemo } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ChevronLeft, ChevronRight } from "react-native-feather"
import { ROUTES } from "../utils/constants"

interface FertileWindow {
  fertileStart?: string | Date
  fertileEnd?: string | Date
  ovulationDate?: string | Date
  nextPeriodStart?: string | Date
  periodLength?: number
}

interface PeriodHistory {
  startDate: string | Date
  endDate?: string | Date
}

interface Colors {
  white: string
  navyBlue: string
  gray: string
  teal: string
  black: string
  error: string
  lightBlue: string
}

interface UserData {
  gender?: string
  partnerId?: string
}

interface MiniCalendarProps {
  currentDate: Date
  twoWeekStartDate: Date
  setTwoWeekStartDate: (date: Date) => void
  fertileWindow: FertileWindow | null
  periodHistory: PeriodHistory[]
  loggedDayData: any
  canViewCycleData: () => boolean
  canEditCycleData: () => boolean
  router: ReturnType<typeof useRouter>
  colors: Colors
  userData: UserData | null
  getDayDataForDate: (dateKey: string) => any
}

// ✅ MiniCalendar is READ-ONLY per specification
const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  twoWeekStartDate,
  setTwoWeekStartDate,
  fertileWindow,
  periodHistory,
  loggedDayData,
  canViewCycleData,
  canEditCycleData,
  router,
  colors,
  userData,
  getDayDataForDate,
}) => {
  const safeTwoWeekStartDate = twoWeekStartDate && !isNaN(twoWeekStartDate.getTime()) ? twoWeekStartDate : new Date();

  const createDateOnly = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return new Date()
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const twoWeekDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 14; i++) {
      const date = new Date(safeTwoWeekStartDate.getFullYear(), safeTwoWeekStartDate.getMonth(), safeTwoWeekStartDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [safeTwoWeekStartDate])

  const today = useMemo(() => createDateOnly(new Date()), [])

  const navigateTwoWeeks = (direction: "prev" | "next") => {
    const newStartDate = new Date(
      safeTwoWeekStartDate.getFullYear(),
      safeTwoWeekStartDate.getMonth(),
      safeTwoWeekStartDate.getDate(),
    )
    if (direction === "prev") {
      newStartDate.setDate(newStartDate.getDate() - 14)
    } else {
      newStartDate.setDate(newStartDate.getDate() + 14)
    }
    setTwoWeekStartDate(newStartDate)
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
          : new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 5)

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

      const periodLength = fertileWindow.periodLength || 5
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

  const hasDataForDate = (date: Date) => {
    try {
      // Use consistent date formatting without timezone conversion
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      return !!getDayDataForDate(dateKey)
    } catch (error) {
      console.warn("Error checking data for date:", error)
      return false
    }
  }

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
              onPress={() => router.push(ROUTES.MAIN.PROFILE.PARTNER)}
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

  const firstWeekDates = twoWeekDates.slice(0, 7)
  const secondWeekDates = twoWeekDates.slice(7, 14)

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const startMonth = monthNames[safeTwoWeekStartDate.getMonth()]
  const endDate = new Date(safeTwoWeekStartDate.getFullYear(), safeTwoWeekStartDate.getMonth(), safeTwoWeekStartDate.getDate() + 13)
  const endMonth = monthNames[endDate.getMonth()]

  const dateRangeText =
    startMonth === endMonth
      ? `${startMonth} ${safeTwoWeekStartDate.getFullYear()}`
      : `${startMonth} - ${endMonth} ${safeTwoWeekStartDate.getFullYear()}`

  const renderWeekRow = (weekDates: Date[], isFirstWeek: boolean) => (
    <View style={styles.weekRow}>
      {weekDates.map((date, index) => {
        const dateOnly = createDateOnly(date)
        const isToday = isSameDate(dateOnly, today)
        const isFertile = isDateInFertileWindow(date)
        const isOvulation = isOvulationDate(date)
        const isPeriod = isPeriodDay(date)
        const isPredictedPeriod = isPredictedPeriodDay(date)
        const hasData = hasDataForDate(date)
        const isPastDate = dateOnly < today

        // Check if this date has logged flow data
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateKey = `${year}-${month}-${day}`
        const dayDataForDate = getDayDataForDate(dateKey)
        const hasLoggedFlow = dayDataForDate?.period?.flow

        const dayOfWeek = ["S", "M", "T", "W", "T", "F", "S"][date.getDay()]

        let backgroundColor = "transparent"
        let textColor = colors.black

        // ✅ Displays colored indicators per specification
        if (isToday) {
          backgroundColor = colors.teal
          textColor = colors.white
        } else if (hasLoggedFlow) {
          // ✅ Red background for logged flow data
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
          backgroundColor = colors.lightBlue
          textColor = colors.navyBlue
        } else if (isPastDate) {
          textColor = colors.gray
        }

        return (
          <View key={dateKey} style={styles.dayColumnMini}>
            {isFirstWeek && <Text style={[styles.dayTextMini, { color: colors.gray }]}>{dayOfWeek}</Text>}
            <TouchableOpacity
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
              onPress={() => {
                // ✅ Shows log details on tap per specification
                setTwoWeekStartDate(date)
              }}
              activeOpacity={0.7}
              accessibilityLabel={`${date.getDate()} ${monthNames[date.getMonth()]}`}
              accessibilityHint="Open calendar modal for this date"
            >
              <Text style={[styles.dateNumberMini, { color: textColor }]}>{date.getDate()}</Text>
              {/* ✅ Data indicators for mood/symptoms/sexual activity */}
              {hasData && !hasLoggedFlow && (
                <View
                  style={[
                    styles.dataIndicatorMini,
                    {
                      backgroundColor:
                        isToday || isPeriod || isPredictedPeriod || isOvulation ? colors.white : colors.teal,
                    },
                  ]}
                />
              )}
              {/* Flow indicator */}
              {hasLoggedFlow && (
                <View
                  style={[
                    styles.flowIndicatorMini,
                    {
                      backgroundColor: isToday ? colors.white : colors.white,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          </View>
        )
      })}
    </View>
  )

  return (
    <View style={[styles.miniCalendarContainer, { backgroundColor: colors.white }]}>
      {/* Header - Simplified without icons */}
      <View style={styles.miniCalendarHeader}>
        <View style={styles.dateHeaderContainer}>
          <Text style={[styles.dateText, { color: colors.navyBlue }]}>
            {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </Text>
          <Text style={[styles.dateRangeText, { color: colors.gray }]}>{dateRangeText}</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.lightBlue }]}
          onPress={() => navigateTwoWeeks("prev")}
          activeOpacity={0.7}
          accessibilityLabel="Previous two weeks"
          accessibilityHint="Navigate to previous two weeks"
        >
          <ChevronLeft stroke={colors.teal} width={18} height={18} />
        </TouchableOpacity>

        <View style={styles.weekRangeContainer}>
          <Text style={[styles.weekRangeText, { color: colors.navyBlue }]}>
            {safeTwoWeekStartDate.getDate()} - {endDate.getDate()}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.lightBlue }]}
          onPress={() => navigateTwoWeeks("next")}
          activeOpacity={0.7}
          accessibilityLabel="Next two weeks"
          accessibilityHint="Navigate to next two weeks"
        >
          <ChevronRight stroke={colors.teal} width={18} height={18} />
        </TouchableOpacity>
      </View>

      {/* Two Week Calendar */}
      <View style={styles.twoWeekContainer}>
        {renderWeekRow(firstWeekDates, true)}
        {renderWeekRow(secondWeekDates, false)}
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
            <View style={[styles.legendDot, { backgroundColor: colors.lightBlue }]} />
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
    </View>
  )
}

const styles = StyleSheet.create({
  miniCalendarContainer: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 20,
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
  twoWeekContainer: {
    flexDirection: "column",
    marginBottom: 15,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  dayColumnMini: {
    alignItems: "center",
  },
  dayTextMini: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  dateCircleMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
  flowIndicatorMini: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    bottom: 6,
  },
})

export default MiniCalendar
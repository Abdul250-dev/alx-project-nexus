import type { useRouter } from "expo-router"
import type React from "react"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Calendar, Heart } from "react-native-feather"
import { t } from "../services/localizationService"
import type { FertileWindow } from "../services/trackerService"
import { calculateCycleInfo } from "../services/trackerService"
import type { UserProfile } from "../services/userService"
import type { ThemeColors } from "../utils/theme"
import Card from "./Card"

interface CycleInfoCardProps {
  fertileWindow: FertileWindow | null
  periodHistory: any[]
  userData: UserProfile | null
  daysToOvulation: number | null
  router: ReturnType<typeof useRouter>
  colors: ThemeColors
  getDayDataForDate?: (dateKey: string) => any
}

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const CIRCLE_SIZE = SCREEN_WIDTH < 350 ? 70 : SCREEN_WIDTH < 400 ? 85 : 100
const CIRCLE_MARGIN = SCREEN_WIDTH < 350 ? 10 : 20
const FONT_SCALE = SCREEN_WIDTH < 350 ? 0.85 : 1

const CycleInfoCard: React.FC<CycleInfoCardProps> = ({
  fertileWindow,
  periodHistory,
  userData,
  daysToOvulation,
  router,
  colors,
  getDayDataForDate,
}) => {
  // Determine next event and countdown
  const getNextEventInfo = () => {
    const cycleInfo = calculateCycleInfo(periodHistory)
    
    if (!cycleInfo.isDataAvailable) {
      return {
        eventType: 'period',
        countdown: 28,
        isToday: false,
        isPast: false,
        message: t("tracker.start_tracking_cycle"),
        subMessage: t("tracker.log_period_flow_message"),
        emoji: '📅',
        color: colors.teal
      }
    }

    const ovulationDays = daysToOvulation ?? 0
    const periodDays = cycleInfo.daysUntilNextPeriod

    // Check if we're in the ovulation window (5 days before to 3 days after)
    const isInOvulationWindow = ovulationDays >= -3 && ovulationDays <= 5
    
    // Priority 1: Handle ovulation window (5 days before to 3 days after)
    if (isInOvulationWindow) {
      // Currently ovulating (day 0)
      if (ovulationDays === 0) {
        return {
          eventType: 'ovulation',
          countdown: 0,
          isToday: true,
          isPast: false,
          message: t("tracker.ovulation_today"),
          subMessage: "Peak fertility window",
          emoji: '🌸',
          color: '#FF69B4'
        }
      }
      
      // Pre-ovulation window (1-5 days before)
      if (ovulationDays > 0) {
        return {
          eventType: 'ovulation',
          countdown: ovulationDays,
          isToday: false,
          isPast: false,
          message: ovulationDays === 1 
            ? "Ovulation predicted tomorrow"
            : `Ovulation predicted in ${ovulationDays} days`,
          subMessage: "You are in your ovulation window",
          emoji: '🥚',
          color: '#FF69B4'
        }
      }
      
      // Post-ovulation window (1-3 days after)
      if (ovulationDays < 0) {
        const daysPastOvulation = Math.abs(ovulationDays)
        return {
          eventType: 'ovulation',
          countdown: daysPastOvulation,
          isToday: false,
          isPast: true,
          message: daysPastOvulation === 1 
            ? "Ovulated yesterday"
            : `Ovulated ${daysPastOvulation} days ago`,
          subMessage: "Still in your ovulation window",
          emoji: '🌸',
          color: '#FF69B4'
        }
      }
    }

    // Priority 2: Handle period events
    
    // Period is today
    if (periodDays === 0) {
      return {
        eventType: 'period',
        countdown: 0,
        isToday: true,
        isPast: false,
        message: t("tracker.next_period_expected_today"),
        subMessage: "Track your flow today",
        emoji: '🩸',
        color: colors.error
      }
    }

    // Period is overdue
    if (periodDays < 0) {
      const daysOverdue = Math.abs(periodDays)
      return {
        eventType: 'period',
        countdown: daysOverdue,
        isToday: false,
        isPast: true,
        message: daysOverdue === 1 
          ? "Your period was expected 1 day ago"
          : `Your period was expected ${daysOverdue} days ago`,
        subMessage: "Log your period data when it starts",
        emoji: '⏰',
        color: colors.error
      }
    }

    // Period is coming up
    return {
      eventType: 'period',
      countdown: periodDays,
      isToday: false,
      isPast: false,
      message: periodDays === 1 
        ? "Next period expected tomorrow"
        : `Next period in ${periodDays} days`,
      subMessage: `${cycleInfo.averageCycleLength} day average cycle`,
      emoji: '🩸',
      color: colors.error
    }
  }

  const cycleInfo = calculateCycleInfo(periodHistory)
  const eventInfo = getNextEventInfo()
  
  // Determine if user is viewing their own or partner's data
  const isMaleUser = userData?.gender === "male"
  const hasPartner = !!userData?.partnerId
  const isPartnerView = isMaleUser && hasPartner

  // Show nothing if user data is not available
  if (!userData) {
    return null
  }

  // Don't show cycle info for users who can't view cycle data
  if (!((userData.gender === "female") || isPartnerView)) {
    return (
      <Card style={styles.cycleInfoCard}>
        <View style={styles.noAccessContainer}>
          <Text style={[styles.noAccessTitle, { color: colors.navyBlue }]}>{t("tracker.cycle_information")}</Text>
          <Text style={[styles.noAccessText, { color: colors.gray }]}>
            {t("tracker.cycle_tracking_available")}
          </Text>
        </View>
      </Card>
    )
  }

  // Main countdown card UI
  return (
    <Card style={styles.cycleInfoCard}>
      {/* Header */}
      <View style={styles.cycleInfoHeader}>
        <View style={styles.cycleInfoTitleContainer}>
          <Heart stroke={colors.teal} width={20} height={20} style={styles.cycleInfoIcon} />
          <Text style={[styles.cycleInfoTitle, { color: colors.navyBlue }]}> 
            {isPartnerView ? t("tracker.partners_cycle_information") : t("tracker.cycle_information")}
          </Text>
        </View>
        {cycleInfo.isDataAvailable && router && (
          <TouchableOpacity onPress={() => router.push({ pathname: '/main/tracker/menstrual' })}>
            <Text style={[styles.viewDetailsText, { color: colors.teal }]}>{t("tracker.view_details")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Countdown Display */}
      <View style={styles.countdownContainer}>
        <View style={[styles.countdownCircle, {
          borderColor: eventInfo.color,
          backgroundColor: eventInfo.color + '10',
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          marginRight: CIRCLE_MARGIN,
        }]}
        >
          <Text style={[styles.countdownEmoji, { fontSize: 20 * FONT_SCALE }]}>{eventInfo.emoji}</Text>
          <Text style={[styles.countdownNumber, { color: eventInfo.color, fontSize: 24 * FONT_SCALE }]}>
            {eventInfo.isToday ? '0' : eventInfo.countdown}
          </Text>
          <Text style={[styles.countdownLabel, { color: eventInfo.color, fontSize: 10 * FONT_SCALE }]}>
            {eventInfo.isToday ? 'TODAY' : eventInfo.isPast ? 'OVERDUE' : 'DAYS'}
          </Text>
        </View>
        
        <View style={styles.countdownTextContainer}>
          <Text style={[styles.countdownTitle, { color: colors.navyBlue, fontSize: 16 * FONT_SCALE }]}>
            {eventInfo.message}
          </Text>
          <Text style={[styles.countdownSubtitle, { color: colors.gray, fontSize: 14 * FONT_SCALE }]}>
            {eventInfo.subMessage}
          </Text>
        </View>
      </View>

      {/* Cycle Details - Collapsible */}
      {cycleInfo.isDataAvailable && (
        <View style={styles.cycleDetailsContainer}>
          <View style={[styles.divider, { backgroundColor: colors.lightGray }]} />
          
          <View style={styles.cycleStatsRow}>
            {/* Current Phase */}
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Calendar stroke={colors.teal} width={14} height={14} />
                <Text style={[styles.statLabel, { color: colors.gray }]}>Phase</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.navyBlue }]}>
                {cycleInfo.cyclePhase}
              </Text>
              <Text style={[styles.statSubtext, { color: colors.gray }]}>
                Day {cycleInfo.daysSinceLastPeriod}
              </Text>
            </View>

            {/* Cycle Length */}
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.cycleLengthIcon, { backgroundColor: colors.lightBlue }]}>
                  <Text style={[styles.cycleLengthText, { color: colors.teal }]}>
                    {cycleInfo.averageCycleLength}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.gray }]}>Cycle</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.navyBlue }]}>
                {cycleInfo.averageCycleLength} days
              </Text>
              <Text style={[styles.statSubtext, { color: colors.gray }]}>
                Average
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* No Data State */}
      {!cycleInfo.isDataAvailable && (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: colors.gray }]}> 
            {isPartnerView
              ? t("tracker.partner_needs_log_data")
              : t("tracker.start_tracking_cycle")}
          </Text>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  cycleInfoCard: {
    marginBottom: 20,
    marginHorizontal: 15,
  },
  noAccessContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noAccessTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noAccessText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  cycleInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cycleInfoTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cycleInfoIcon: {
    marginRight: 8,
  },
  cycleInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
  },
  
  // Main Countdown Display
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  countdownEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  countdownTextContainer: {
    flex: 1,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 22,
  },
  countdownSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Cycle Details
  cycleDetailsContainer: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  cycleStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: 'wrap',
    gap: SCREEN_WIDTH < 400 ? 8 : 0,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
  },
  cycleLengthIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cycleLengthText: {
    fontSize: 8,
    fontWeight: "bold",
  },

  // No Data State
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  noDataText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
})

export default CycleInfoCard
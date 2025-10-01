import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { Dimensions } from "react-native"
import { useToast } from "../components/ui/use-toast"
import {
  calculateCycleInfo,
  calculateFertileWindow,
  deleteDayData,
  deletePeriodEntry,
  getDayData,
  getPeriodHistory,
  logDayData,
  logPeriod,
  migratePeriodDataToFirestore
} from "../services/trackerService"
import { useUser } from "./UserContext"

import type { ApiResponse, CycleInfo, PeriodEntry } from "../services/trackerService"


interface FertileWindow {
  ovulationDate: string
  fertileStart: string
  fertileEnd: string
  nextPeriodStart?: string
  cycleLength: number
  periodLength: number
}

interface TrackerContextType {
  fertileWindow: FertileWindow | null
  periodHistory: PeriodEntry[]
  loggedDayData: Record<string, any>
  loading: boolean
  dayDataLoading: boolean
  refreshData: () => Promise<void>
  logPeriodData: (date: Date, adjustedStartDate?: Date) => Promise<ApiResponse>
  deletePeriodData: (periodId: string) => Promise<boolean>
  saveDayData: (date: string, data: any) => Promise<boolean>
  deleteDayDataForDate: (date: string) => Promise<boolean>
  getDayDataForDate: (date: string) => any
  loadDayDataForDateRange: (startDate: Date, endDate: Date) => Promise<void>
  getCycleInfo: () => CycleInfo
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined)

export const useTracker = () => {
  const context = useContext(TrackerContext)
  if (!context) {
    throw new Error("useTracker must be used within a TrackerProvider")
  }
  return context
}

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const CIRCLE_SIZE = SCREEN_WIDTH < 350 ? 70 : SCREEN_WIDTH < 400 ? 85 : 100
const CIRCLE_MARGIN = SCREEN_WIDTH < 350 ? 10 : 20
const FONT_SCALE = SCREEN_WIDTH < 350 ? 0.85 : 1

export const TrackerProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useUser()
  const { toast } = useToast()
  const [fertileWindow, setFertileWindow] = useState<FertileWindow | null>(null)
  const [periodHistory, setPeriodHistory] = useState<PeriodEntry[]>([])
  const [loggedDayData, setLoggedDayData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [dayDataLoading, setDayDataLoading] = useState(false)

  // Helper to get the correct userId for all data fetches
  const getTargetUserId = () => {
    if (!userData) return ''
    return userData.gender === 'male' && userData.partnerId ? userData.partnerId : userData.id
  }

  // Add this to your TrackerProvider component

  const refreshData = useCallback(async () => {
    if (!userData) {
      setLoading(false)
      return
    }
    const canView = userData.gender === "female" || (userData.gender === "male" && userData.partnerId)
    if (!canView) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const targetUserId = getTargetUserId()
      console.log("[TrackerContext] Refreshing tracker data for user:", targetUserId)

      // First, try to get period history
      let history = await getPeriodHistory(targetUserId)
      console.log("[TrackerContext] Initial periodHistory:", history)

      // If no periods found in Firestore, try migration
      if (history.length === 0) {
        console.log("[TrackerContext] No periods in Firestore, attempting migration...")
        const migrationResult = await migratePeriodDataToFirestore(targetUserId)
        console.log("[TrackerContext] Migration result:", migrationResult)

        if (migrationResult.success) {
          // Refetch after migration
          history = await getPeriodHistory(targetUserId)
          console.log("[TrackerContext] Post-migration periodHistory:", history)
        }
      }

      const fertile = await calculateFertileWindow(targetUserId)
      console.log("[TrackerContext] New fertileWindow:", fertile)

      setPeriodHistory(history)
      setFertileWindow(fertile)
    } catch (error) {
      console.error("Error refreshing tracker data:", error)
    } finally {
      setLoading(false)
    }
  }, [userData])

  const loadDayDataForDateRange = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!userData) return
      const canView = userData.gender === "female" || (userData.gender === "male" && userData.partnerId)
      if (!canView) return
      setDayDataLoading(true)
      try {
        const targetUserId = getTargetUserId()

        // Limit the date range to avoid loading too much data
        const maxDays = 366 // Allow up to a year of data for cycle calculations
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff > maxDays) {
          console.warn(`Date range too large (${daysDiff} days), limiting to ${maxDays} days`)
          endDate = new Date(startDate.getTime() + maxDays * 24 * 60 * 60 * 1000)
        }
        const dates = []
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate))
          currentDate.setDate(currentDate.getDate() + 1)
        }
        const batchSize = 10
        const newLoggedData: Record<string, any> = {}
        for (let i = 0; i < dates.length; i += batchSize) {
          const batch = dates.slice(i, i + batchSize)
          const batchPromises = batch.map(async (date) => {
            const dateKey = date.toISOString().split("T")[0]
            const data = await getDayData(targetUserId, dateKey)
            return { dateKey, data }
          })
          const batchResults = await Promise.all(batchPromises)
          batchResults.forEach(({ dateKey, data }) => {
            if (data) {
              newLoggedData[dateKey] = data
            }
          })
        }
        setLoggedDayData((prev) => ({ ...prev, ...newLoggedData }))
      } catch (error) {
        console.error("Error loading day data for date range:", error)
      } finally {
        setDayDataLoading(false)
      }
    },
    [userData],
  )

  const logPeriodData = useCallback(
    async (date: Date, adjustedStartDate?: Date): Promise<ApiResponse> => {
      if (!userData) return { success: false, message: "User not logged in" }
      try {
        const targetUserId = getTargetUserId()
        const result = await logPeriod(targetUserId, date, undefined, [], adjustedStartDate)
        if (result.success) {
          console.log("[TrackerContext] Period logged successfully, refreshing data...")
          await refreshData()
          return result
        } else {
          toast({
            title: "Failed to log period",
            description: result.message || "Unknown error",
            variant: "destructive"
          })
        }
        return result
      } catch (error) {
        console.error("Error logging period:", error)
        toast({
          title: "Error logging period",
          description: error instanceof Error ? error.message : String(error),
          variant: "destructive"
        })
        return { success: false, message: "Failed to log period" }
      }
    },
    [userData, refreshData, toast],
  )

  const deletePeriodData = useCallback(
    async (periodId: string): Promise<boolean> => {
      if (!userData) return false
      try {
        const targetUserId = getTargetUserId()
        const result = await deletePeriodEntry(targetUserId, periodId)
        if (result.success) {
          await refreshData()
          return true
        }
        return false
      } catch (error) {
        console.error("Error deleting period:", error)
        return false
      }
    },
    [userData, refreshData],
  )

  const saveDayData = useCallback(
    async (date: string, data: any): Promise<boolean> => {
      const sessionId = Math.random().toString(36).substr(2, 9);
      console.log(`[TrackerContext] 🚀 Starting saveDayData [Session: ${sessionId}]`);
      console.log(`[TrackerContext] 📅 Date: ${date}`);
      console.log(`[TrackerContext] 👤 UserData:`, { id: userData?.id, gender: userData?.gender });
      console.log(`[TrackerContext] 📊 Data to save:`, JSON.stringify(data, null, 2));

      if (!userData) {
        console.error(`[TrackerContext] ❌ No user data available [Session: ${sessionId}]`);
        return false;
      }

      try {
        const targetUserId = getTargetUserId();
        console.log(`[TrackerContext] 🎯 Target User ID: ${targetUserId} [Session: ${sessionId}]`);

        const startTime = Date.now();
        const result = await logDayData(targetUserId, { ...data, date });
        const duration = Date.now() - startTime;

        console.log(`[TrackerContext] 📡 logDayData result [Session: ${sessionId}]:`, {
          success: result.success,
          message: result.message,
          duration: `${duration}ms`
        });

        if (result.success) {
          console.log(`[TrackerContext] ✅ Day data saved successfully [Session: ${sessionId}]`);

          setLoggedDayData((prev) => ({
            ...prev,
            [date]: { ...data, date },
          }));

          // --- NEW: If period start, also log to Firestore period collection ---
          let shouldLogPeriod = false;
          let periodStartDate = date;

          if (data.period?.isStart) {
            shouldLogPeriod = true;
            console.log(`[TrackerContext] 🔴 Period start detected, will log to Firestore [Session: ${sessionId}]`);
          }

          if (shouldLogPeriod) {
            console.log(`[TrackerContext] 📝 Logging period to Firestore from saveDayData: ${periodStartDate} [Session: ${sessionId}]`);
            const periodResult = await logPeriodData(new Date(periodStartDate));
            console.log(`[TrackerContext] 📝 Period logging result:`, periodResult);
          }

          console.log(`[TrackerContext] 🔄 Refreshing data and calculating fertile window [Session: ${sessionId}]`);
          const fertile = await calculateFertileWindow(targetUserId);
          setFertileWindow(fertile);
          await refreshData();

          console.log(`[TrackerContext] 🎉 saveDayData completed successfully [Session: ${sessionId}]`);
          return true;
        } else {
          console.error(`[TrackerContext] ❌ logDayData failed [Session: ${sessionId}]:`, result.message);
          return false;
        }
      } catch (error) {
        console.error(`[TrackerContext] ❌ Error saving day data [Session: ${sessionId}]:`, error);
        console.error(`[TrackerContext] ❌ Error details:`, {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          date,
          userData: { id: userData?.id, gender: userData?.gender }
        });
        return false;
      }
    },
    [userData, refreshData, logPeriodData],
  );

  const deleteDayDataForDate = useCallback(
    async (date: string): Promise<boolean> => {
      if (!userData) return false
      try {
        const targetUserId = getTargetUserId()
        const result = await deleteDayData(targetUserId, date)
        if (result.success) {
          setLoggedDayData((prev) => {
            const newData = { ...prev }
            delete newData[date]
            return newData
          })
          return true
        }
        return false
      } catch (error) {
        console.error("Error deleting day data:", error)
        return false
      }
    },
    [userData],
  )

  const getDayDataForDate = useCallback(
    (date: string) => {
      return loggedDayData[date] || null
    },
    [loggedDayData],
  )

  const getCycleInfo = useCallback(() => {
    return calculateCycleInfo(periodHistory)
  }, [periodHistory])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const contextValue: TrackerContextType = {
    fertileWindow,
    periodHistory,
    loggedDayData,
    loading,
    dayDataLoading,
    refreshData,
    logPeriodData,
    deletePeriodData,
    saveDayData,
    deleteDayDataForDate,
    getDayDataForDate,
    loadDayDataForDateRange,
    getCycleInfo,
  }

  return <TrackerContext.Provider value={contextValue}>{children}</TrackerContext.Provider>
}

// Export the context itself for advanced use cases
export { TrackerContext }

// Default export for the provider
export default TrackerProvider

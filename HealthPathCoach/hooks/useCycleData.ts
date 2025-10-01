"use client"

import { useMemo, useCallback } from "react"

interface UseCycleDataProps {
  fertileWindow: any
  periodHistory: any[]
  userData: any
  getDayDataForDate: (dateKey: string) => any
}

const useCycleData = ({ fertileWindow, periodHistory, userData, getDayDataForDate }: UseCycleDataProps) => {
  // Create date-only utility function - memoized to prevent recreation
  const createDateOnly = useCallback((date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return new Date()
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }, [])

  const isSameDate = useCallback((date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }, [])

  // Memoize these functions to prevent recreation on every render
  const canViewCycleData = useCallback(() => {
    if (userData?.gender === "female") return true
    if (userData?.gender === "male" && userData?.partnerId) return true
    return false
  }, [userData?.gender, userData?.partnerId])

  const canEditCycleData = useCallback(() => {
    return userData?.gender === "female"
  }, [userData?.gender])

  const isDateInFertileWindow = useCallback(
    (date: Date) => {
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
    },
    [fertileWindow?.fertileStart, fertileWindow?.fertileEnd, createDateOnly],
  )

  const isOvulationDate = useCallback(
    (date: Date) => {
      if (!fertileWindow?.ovulationDate) return false

      try {
        const ovulationDate = new Date(fertileWindow.ovulationDate)
        if (isNaN(ovulationDate.getTime())) return false

        return isSameDate(createDateOnly(date), createDateOnly(ovulationDate))
      } catch (error) {
        console.warn("Error checking ovulation date:", error)
        return false
      }
    },
    [fertileWindow?.ovulationDate, createDateOnly, isSameDate],
  )

  const isPeriodDay = useCallback(
    (date: Date): boolean => {
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
    },
    [periodHistory, createDateOnly],
  )

  const isPredictedPeriodDay = useCallback(
    (date: Date): boolean => {
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
    },
    [fertileWindow?.nextPeriodStart, fertileWindow?.periodLength, createDateOnly],
  )

  const hasDataForDate = useCallback(
    (date: Date) => {
      try {
        const dateKey = date.toISOString().split("T")[0]
        return !!getDayDataForDate(dateKey)
      } catch (error) {
        console.warn("Error checking data for date:", error)
        return false
      }
    },
    [getDayDataForDate],
  )

  const getDaysInMonth = useCallback((date: Date) => {
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
  }, [])

  const isToday = useCallback(
    (date: Date) => {
      const today = createDateOnly(new Date())
      const dateOnly = createDateOnly(date)
      return isSameDate(dateOnly, today)
    },
    [createDateOnly, isSameDate],
  )

  const isSelected = useCallback(
    (date: Date, selectedDate: Date | null) => {
      return selectedDate && isSameDate(createDateOnly(date), createDateOnly(selectedDate))
    },
    [createDateOnly, isSameDate],
  )

  // Return memoized object to prevent recreation
  return useMemo(
    () => ({
      canViewCycleData,
      canEditCycleData,
      isDateInFertileWindow,
      isOvulationDate,
      isPeriodDay,
      isPredictedPeriodDay,
      hasDataForDate,
      getDaysInMonth,
      isToday,
      isSelected,
    }),
    [
      canViewCycleData,
      canEditCycleData,
      isDateInFertileWindow,
      isOvulationDate,
      isPeriodDay,
      isPredictedPeriodDay,
      hasDataForDate,
      getDaysInMonth,
      isToday,
      isSelected,
    ],
  )
}

export default useCycleData

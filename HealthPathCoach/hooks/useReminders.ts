import { useState, useEffect, useCallback } from "react"
import { getUserReminders } from "../services/reminderService"

interface UseRemindersProps {
  userData: any;
}

const useReminders = ({ userData }: UseRemindersProps) => {
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([])

  const fetchReminders = useCallback(async () => {
    if (userData) {
      try {
        const reminders = await getUserReminders(userData.id)
        const today = new Date()
        const threeDaysLater = new Date(today)
        threeDaysLater.setDate(today.getDate() + 3)

        const upcoming = reminders
          .filter((r) => {
            if (!r.nextDue) return false
            const nextDue = new Date(r.nextDue)
            return nextDue >= today && nextDue <= threeDaysLater
          })
          .sort((a, b) => {
            if (!a.nextDue || !b.nextDue) return 0
            return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime()
          })
          .slice(0, 3)

        setUpcomingReminders(upcoming)
      } catch (error) {
        console.error("Error fetching reminders:", error)
      }
    }
  }, [userData]) // Add userData as dependency for useCallback

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders]) // Now depend on fetchReminders which is memoized

  return { upcomingReminders, refreshReminders: fetchReminders }
}

export default useReminders
import { useState } from "react"
import { Alert } from "react-native"

interface UseDayDataProps {
  getDayDataForDate: (dateKey: string) => any;
  saveDayData: (dateKey: string, data: any) => Promise<boolean>;
  deleteDayDataForDate: (dateKey: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  userData: any;
  canEditCycleData: () => boolean;
}

const useDayData = ({
  getDayDataForDate,
  saveDayData,
  deleteDayDataForDate,
  refreshData,
  userData,
  canEditCycleData,
}: UseDayDataProps) => {
  const [dayData, setDayData] = useState<any>({})

  const toggleSymptom = (symptom: string) => {
    const currentSymptoms = dayData.symptoms ?? []
    if (currentSymptoms.includes(symptom)) {
      setDayData({
        ...dayData,
        symptoms: currentSymptoms.filter((s: string) => s !== symptom),
      })
    } else {
      setDayData({
        ...dayData,
        symptoms: [...currentSymptoms, symptom],
      })
    }
  }

  const saveDayDataHandler = async (selectedDate: Date | null) => {
    const dateKey = selectedDate?.toISOString().split("T")[0]
    if (dateKey && userData) {
      try {
        const success = await saveDayData(dateKey, dayData)
        if (success) {
          Alert.alert("Success", "Data saved successfully!")
          await refreshData()
        } else {
          Alert.alert("Error", "Failed to save data")
        }
      } catch (error) {
        console.error("Error saving day data:", error)
        Alert.alert("Error", "Failed to save data. Please try again.")
      }
    }
  }

  const deleteDayDataHandler = async (date: Date) => {
    if (!userData || !canEditCycleData()) return

    const dateKey = date.toISOString().split("T")[0]
    const hasData = !!getDayDataForDate(dateKey)

    if (!hasData) {
      Alert.alert("No Data", "No data found for this date.")
      return
    }

    Alert.alert("Delete Data", `Are you sure you want to delete all logged data for ${date.toLocaleDateString()}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const success = await deleteDayDataForDate(dateKey)
            if (success) {
              Alert.alert("Success", "Data deleted successfully!")
            } else {
              Alert.alert("Error", "Failed to delete data")
            }
          } catch (error) {
            console.error("Error deleting day data:", error)
            Alert.alert("Error", "Failed to delete data. Please try again.")
          }
        },
      },
    ])
  }

  return {
    dayData,
    setDayData,
    toggleSymptom,
    saveDayDataHandler,
    deleteDayDataHandler,
  }
}

export default useDayData



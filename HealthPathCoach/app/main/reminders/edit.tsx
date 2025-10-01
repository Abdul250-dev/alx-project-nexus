import { useLocalSearchParams } from "expo-router"
import { View } from "react-native"
import AddEditReminderScreen from "../../../screens/Reminders/AddEditReminderScreen"

export default function EditReminder() {
  const { mode, id, contraceptionMethod } = useLocalSearchParams<{
    mode: "add" | "edit" | "view"
    id?: string
    contraceptionMethod?: string
  }>()

  return (
    <View style={{ flex: 1 }}>
      <AddEditReminderScreen mode={mode || "add"} reminderId={id} contraceptionMethod={contraceptionMethod} />
    </View>
  )
}

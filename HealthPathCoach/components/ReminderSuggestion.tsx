import { useRouter } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Bell, ChevronRight } from "react-native-feather"
import { ROUTES } from "../utils/constants"
import { useTheme } from "./theme-provider"

type ReminderSuggestionProps = {
  contraceptionMethod: string
  methodName: string
}

export default function ReminderSuggestion({ contraceptionMethod, methodName }: ReminderSuggestionProps) {
  const router = useRouter()
  const { colors } = useTheme()

  const getSuggestionText = () => {
    switch (contraceptionMethod) {
      case "combined-pill":
      case "progestin-only-pill":
        return "Set a daily reminder to take your pill at the same time each day."
      case "patch":
        return "Set a weekly reminder to change your patch every 7 days."
      case "vaginal-ring":
        return "Set a monthly reminder to remove your old ring and insert a new one."
      case "injection":
        return "Set a reminder for your next injection in 3 months."
      case "iud-hormonal":
      case "iud-copper":
        return "Set a reminder for your annual IUD check-up."
      case "implant":
        return "Set a reminder for when your implant needs to be replaced."
      default:
        return "Set reminders to help you stay on track with your contraception."
    }
  }

  const handleAddReminder = () => {
    router.push(`${ROUTES.MAIN.REMINDERS.ADD}&contraceptionMethod=${contraceptionMethod}`)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.lightBlue }]}>
      <View style={styles.iconContainer}>
        <Bell stroke={colors.teal} width={24} height={24} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.navyBlue }]}>Stay on track with {methodName}</Text>
        <Text style={[styles.description, { color: colors.navyBlue }]}>{getSuggestionText()}</Text>
      </View>
      <TouchableOpacity style={styles.actionContainer} onPress={handleAddReminder}>
        <ChevronRight stroke={colors.teal} width={20} height={20} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    marginLeft: 8,
  },
})

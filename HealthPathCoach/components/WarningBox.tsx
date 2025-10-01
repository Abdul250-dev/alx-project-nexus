import { StyleSheet, Text, View } from "react-native"
import { AlertTriangle } from "react-native-feather"
import { useTheme } from "./theme-provider"

type WarningBoxProps = {
  title: string
  message: string
}

export default function WarningBox({ title, message }: WarningBoxProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: "#FFF3CD", borderColor: "#FFE69C" }]}>
      <AlertTriangle stroke="#856404" width={24} height={24} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: "#856404" }]}>{title}</Text>
        <Text style={[styles.message, { color: "#856404" }]}>{message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
})

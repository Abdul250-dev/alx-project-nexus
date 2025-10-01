import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Plus } from "react-native-feather"
import { useTheme } from "./theme-provider"

interface TrackerInputProps {
  title: string
  value?: string
  onPress: () => void
  showAddButton?: boolean
}

export default function TrackerInput({ title, value, onPress, showAddButton = true }: TrackerInputProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.offWhite }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.navyBlue }]}>{title}</Text>
        {value && <Text style={[styles.value, { color: colors.gray }]}>{value}</Text>}
      </View>

      {showAddButton && (
        <View style={[styles.addButton, { backgroundColor: colors.teal }]}>
          <Plus stroke={colors.white} width={16} height={16} />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
})

import type { ReactNode } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useTheme } from "./theme-provider"

type CardProps = {
  title?: string
  children: ReactNode
  onPress?: () => void
  style?: object
}

export default function Card({ title, children, onPress, style }: CardProps) {
  const { colors } = useTheme()

  const CardComponent = onPress ? TouchableOpacity : View

  return (
    <CardComponent
      style={[
        styles.container,
        {
          backgroundColor: colors.white,
          borderColor: colors.lightGray,
        },
        style,
      ]}
      onPress={onPress}
    >
      {title && <Text style={[styles.title, { color: colors.navyBlue }]}>{title}</Text>}
      <View style={styles.content}>{children}</View>
    </CardComponent>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
})

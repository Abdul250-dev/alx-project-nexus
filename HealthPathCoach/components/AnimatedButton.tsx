import React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, Easing } from "react-native"
import { useTheme } from "./theme-provider"

type AnimatedButtonProps = {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "primary" | "secondary" | "outline"
  style?: object
}

export default function AnimatedButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: AnimatedButtonProps) {
  const { colors } = useTheme()
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  const getBackgroundColor = () => {
    if (disabled) return colors.lightGray

    switch (variant) {
      case "primary":
        return colors.teal
      case "secondary":
        return colors.navyBlue
      case "outline":
        return "transparent"
      default:
        return colors.teal
    }
  }

  const getTextColor = () => {
    if (disabled) return colors.gray

    switch (variant) {
      case "outline":
        return colors.teal
      default:
        return colors.white
    }
  }

  const getBorderColor = () => {
    if (disabled) return colors.lightGray

    switch (variant) {
      case "outline":
        return colors.teal
      default:
        return "transparent"
    }
  }

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start()
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant === "outline" ? 2 : 0,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={[styles.buttonText, { color: getTextColor() }]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})

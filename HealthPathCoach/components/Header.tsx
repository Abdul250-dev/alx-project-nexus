import { useRouter } from "expo-router"
import type React from "react"
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ArrowLeft } from "react-native-feather"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "./theme-provider"

interface HeaderProps {
  title: string
  showBackButton?: boolean
  rightComponent?: React.ReactNode
  onBackPress?: () => void
  variant?: "default" | "gradient" | "minimal"
  showShadow?: boolean
}

export default function Header({
  title,
  showBackButton = false,
  rightComponent,
  onBackPress,
  variant = "default",
  showShadow = true,
}: HeaderProps) {
  const router = useRouter()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  const getHeaderStyle = () => {
    switch (variant) {
      case "gradient":
        return {
          backgroundColor: colors.teal,
          shadowColor: colors.teal,
        }
      case "minimal":
        return {
          backgroundColor: "transparent",
          borderBottomWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        }
      default:
        return {
          backgroundColor: colors.white,
          shadowColor: "#000",
        }
    }
  }

  const getTitleColor = () => {
    return variant === "gradient" ? colors.white : colors.navyBlue
  }

  const getBackButtonStyle = () => {
    if (variant === "gradient") {
      return {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
      }
    }
    return {
      backgroundColor: colors.offWhite,
      borderRadius: 12,
    }
  }

  const getBackIconColor = () => {
    return variant === "gradient" ? colors.white : colors.navyBlue
  }

  return (
    <View
      style={[
        styles.safeArea,
        getHeaderStyle(),
        { paddingTop: insets.top }, // Use safe area insets
      ]}
    >
      <StatusBar
        barStyle={variant === "gradient" ? "light-content" : "dark-content"}
        backgroundColor={variant === "gradient" ? colors.teal : colors.white}
      />

      <View style={[styles.headerContainer, getHeaderStyle(), showShadow && variant !== "minimal" && styles.shadow]}>
        {variant === "gradient" && <View style={[styles.gradientOverlay, { backgroundColor: colors.teal }]} />}

        <View style={styles.headerContent}>
          <View style={styles.leftContainer}>
            {showBackButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                style={[styles.backButton, getBackButtonStyle()]}
                activeOpacity={0.7}
              >
                <ArrowLeft stroke={getBackIconColor()} width={20} height={20} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, { color: getTitleColor() }, variant === "gradient" && styles.gradientTitle]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {variant === "gradient" && <View style={styles.titleUnderline} />}
          </View>

          <View style={styles.rightContainer}>
            {rightComponent && <View style={styles.rightComponentWrapper}>{rightComponent}</View>}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white",
  },
  headerContainer: {
    position: "relative",
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    zIndex: 1,
  },
  leftContainer: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  gradientTitle: {
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleUnderline: {
    width: 30,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
    borderRadius: 1,
  },
  rightContainer: {
    width: 48,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightComponentWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
})

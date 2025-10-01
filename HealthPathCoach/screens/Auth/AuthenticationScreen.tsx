"use client"

import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Lock } from "react-native-feather"
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from "../../components/theme-provider"
import { useSecurity } from "../../context/SecurityContext"
import * as securityService from "../../services/securityService"


interface AuthenticationScreenProps {
  onAuthSuccess?: () => void
}

export default function AuthenticationScreen({ onAuthSuccess }: AuthenticationScreenProps) {
  const router = useRouter()
  const { colors } = useTheme()
  const { authenticate, securityMethod } = useSecurity()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [biometricType, setBiometricType] = useState<string[]>([])
  const [promptMessage, setPromptMessage] = useState("")

  useEffect(() => {
    checkBiometricType()
    getPromptMessage()
  }, [])

  useEffect(() => {
    if (securityMethod === "biometric") {
      handleAuthenticate()
    }
  }, [securityMethod])

  const checkBiometricType = async () => {
    const types = await securityService.getAvailableBiometricTypes()
    setBiometricType(types)
  }

  const getPromptMessage = async () => {
    const message = await securityService.getBiometricPromptMessage()
    setPromptMessage(message)
  }

  const handleAuthenticate = async () => {
    setLoading(true)
    setError(null)

    try {
      const success = await authenticate()

      if (success) {
        if (onAuthSuccess) {
          onAuthSuccess()
        } else {
          router.replace("/main/dashboard")
        }
      } else {
        setError("Authentication failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Authentication error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getBiometricIcon = () => {
    if (biometricType.includes("facial")) {
      return (
        <Image
          source={require("../../assets/images/face-id-icon.png")}
          style={styles.biometricIcon}
          resizeMode="contain"
        />
      )
    } else {
      return <Icon name="fingerprint" size={60} color={colors.teal} />
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={styles.content}>
        <View style={[styles.lockIconContainer, { backgroundColor: colors.teal + "20" }]}>
          {securityMethod === "biometric" ? getBiometricIcon() : <Lock stroke={colors.teal} width={60} height={60} />}
        </View>

        <Text style={[styles.title, { color: colors.navyBlue }]}>Authentication Required</Text>

        <Text style={[styles.description, { color: colors.gray }]}>
          Please authenticate to access your health information
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.authButton, { backgroundColor: colors.teal }]}
          onPress={handleAuthenticate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              {securityMethod === "biometric" && (
                <Icon name="fingerprint" size={20} color={colors.white} style={styles.buttonIcon} />
              )}
              <Text style={[styles.authButtonText, { color: colors.white }]}>{promptMessage}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  biometricIcon: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  errorText: {
    color: "#E53935",
    marginBottom: 16,
    textAlign: "center",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
  },
  buttonIcon: {
    marginRight: 8,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})

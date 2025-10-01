"use client"

import { View } from "react-native"
import { useRouter } from "expo-router"
import AuthenticationScreen from "../../screens/Auth/AuthenticationScreen"

export default function Authenticate() {
  const router = useRouter()

  const handleAuthSuccess = () => {
    router.replace("/main/dashboard")
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthenticationScreen onAuthSuccess={handleAuthSuccess} />
    </View>
  )
}


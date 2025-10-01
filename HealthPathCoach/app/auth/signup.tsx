"use client"

import { View } from "react-native"
import { useRouter } from "expo-router"
import SignUpScreen from "../../screens/Auth/SignUpScreen"

export default function SignUp() {
  const router = useRouter()

  const handleSignUpSuccess = () => {
    router.replace("/main/dashboard")
  }

  return (
    <View style={{ flex: 1 }}>
      <SignUpScreen onSignUpSuccess={handleSignUpSuccess} />
    </View>
  )
}

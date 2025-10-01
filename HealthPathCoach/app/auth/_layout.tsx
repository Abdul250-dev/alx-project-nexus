import { Stack } from "expo-router"
import { ThemeProvider } from "../../components/theme-provider"

export default function AuthLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="authenticate" />
      </Stack>
    </ThemeProvider>
  )
}

import { Stack } from "expo-router"
import { ThemeProvider } from "../components/theme-provider"
import { AuthProvider } from "../context/AuthContext"
import { SecurityProvider } from "../context/SecurityContext"
import { TrackerProvider } from "../context/TrackerContext"
import { UserProvider } from "../context/UserContext"

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SecurityProvider>
          <UserProvider>
            <TrackerProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="main" options={{ headerShown: false }} />
              </Stack>
            </TrackerProvider>
          </UserProvider>
        </SecurityProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
 
import { Stack } from "expo-router"
import { ThemeProvider } from "../../../components/theme-provider"

export default function TrackerLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  )
}

import AsyncStorage from "@react-native-async-storage/async-storage"
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Appearance } from "react-native"
import { darkTheme, lightTheme, type ThemeColors } from "../utils/theme"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colors: ThemeColors
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(storageKey)
        if (storedTheme) {
          setTheme(storedTheme as Theme)
        }
      } catch (error) {
        console.error("Error loading theme:", error)
      }
    }

    loadTheme()
  }, [storageKey])

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (Appearance.getColorScheme?.() ?? "light") : theme

  const colors = resolvedTheme === "dark" ? darkTheme : lightTheme

  const value = useMemo<ThemeProviderState>(() => ({
    theme,
    setTheme: async (newTheme: Theme) => {
      try {
        await AsyncStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      } catch (error) {
        console.error("Error saving theme:", error)
      }
    },
    colors,
  }), [theme, colors, storageKey])

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

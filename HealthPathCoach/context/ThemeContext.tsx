import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Fix 1: Create type alias for theme union type
type ThemeMode = "dark" | "light" | "system";

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  white: string;
  black: string;
  gray: string;
  lightGray: string;
  darkGray: string;
  teal: string;
  navyBlue: string;
  errorLight: string;
  offWhite: string;
  lightBlue?: string;
  red?: string;
  coral?: string; // Optional, can be used for error states
}

interface ThemeContextType {
  colors: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const lightColors: ThemeColors = {
  primary: "#008080",
  secondary: "#20B2AA",
  background: "#FFFFFF",
  surface: "#F8F9FA",
  text: "#212529",
  textSecondary: "#6C757D",
  border: "#DEE2E6",
  error: "#DC3545",
  success: "#28A745",
  warning: "#FFC107",
  info: "#17A2B8",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#6C757D",
  lightGray: "#E9ECEF",
  darkGray: "#495057",
  teal: "#008080",
  navyBlue: "#003366",
  errorLight: "#F8D7DA",
  offWhite: "#F5F5F5",
  lightBlue: "#A8DADC",
  red: "#FF6347", // Optional, can be used for error states
  coral: "#FF7F50", // Optional, can be used for error states

};

const darkColors: ThemeColors = {
  primary: "#20B2AA",
  secondary: "#008080",
  background: "#121212",
  surface: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  border: "#333333",
  error: "#FF6B6B",
  success: "#51CF66",
  warning: "#FFD43B",
  info: "#74C0FC",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#B0B0B0",
  lightGray: "#333333",
  darkGray: "#666666",
  teal: "#20B2AA",
  navyBlue: "#4A90E2",
  errorLight: "#2D1B1B",
  offWhite: "#1A1A1A",
  lightBlue: "#1A3A3D",
  red: "#FF6347", // Optional, can be used for error states
  coral: "#FF7F50", // Optional, can be used for error states
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}> = ({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
}) => {
  const [theme, setTheme] = useState<ThemeMode>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fix 2: Use useCallback to memoize loadTheme function
  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(storageKey);
      if (savedTheme !== null) {
        setTheme(savedTheme as ThemeMode);
        setIsDarkMode(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  }, [storageKey]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]); // Fix 2: Include loadTheme in dependency array

  // Fix 3: Use useCallback to memoize toggleTheme function
  const toggleTheme = useCallback(async () => {
    try {
      const newIsDark = !isDarkMode;
      const newTheme: ThemeMode = newIsDark ? "dark" : "light";
      setIsDarkMode(newIsDark);
      setTheme(newTheme);
      await AsyncStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }, [isDarkMode, storageKey]);

  // Fix 3: Use useCallback to memoize setThemeValue function
  const setThemeValue = useCallback(async (newTheme: ThemeMode) => {
    try {
      setTheme(newTheme);
      setIsDarkMode(newTheme === "dark");
      await AsyncStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }, [storageKey]);

  const colors = isDarkMode ? darkColors : lightColors;

  const contextValue = useMemo(
    () => ({
      colors,
      isDarkMode,
      toggleTheme,
      theme,
      setTheme: setThemeValue,
    }),
    [colors, isDarkMode, theme, toggleTheme, setThemeValue] // Fix 3: Include all dependencies
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useAppTheme = useTheme;
export const useIsDarkMode = () => {
  const { isDarkMode } = useTheme();
  return isDarkMode;
};
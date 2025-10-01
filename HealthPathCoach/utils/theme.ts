export type ThemeColors = {
  primary: string
  secondary: string
  teal: string
  navyBlue: string
  lightBlue: string
  red: string
  green: string
  yellow: string
  orange: string
  purple: string
  black: string
  white: string
  offWhite: string
  gray: string
  lightGray: string
  darkGray: string
  error: string
  success: string
  warning: string
  info: string
  transparent: string
  background: string
  cardBackground: string
  accent: string
  accentLight: string
  surface: string
  text: string
  textSecondary: string
  border: string
  errorLight: string
  blue: string
  pink?: string
  cyan?: string
  indigo?: string
  lime?: string
  amber?: string
  deepOrange?: string
  deepPurple?: string
  lightGreen?: string
  mutedText?: string
  darkText?: string
  lightText?: string
  modalBackground?: string
  overlayBackground?: string
  inputBackground?: string
  placeholderText?: string
  divider?: string
  shadow?: string
  [key: string]: string | undefined
}

export const lightTheme: ThemeColors = {
  primary: "#0066CC",
  secondary: "#5AC8FA",
  teal: "#5AC8B0",
  navyBlue: "#1D3557",
  lightBlue: "#A8DADC",
  red: "#E63946",
  green: "#2A9D8F",
  yellow: "#FFD166",
  orange: "#F4A261",
  purple: "#9B5DE5",
  black: "#000000",
  white: "#FFFFFF",
  offWhite: "#F8F9FA",
  gray: "#6C757D",
  lightGray: "#E9ECEF",
  darkGray: "#495057", // Lightened from #343A40
  error: "#DC3545",
  success: "#28A745",
  warning: "#FFC107",
  info: "#17A2B8",
  transparent: "transparent",
  background: "#FFFFFF",
  cardBackground: "#F8F9FA",
  accent: "#0066CC",
  accentLight: "#D6EFFF",
  surface: "#F8F9FA",
  text: "#212529",
  textSecondary: "#6C757D",
  border: "#DEE2E6",
  errorLight: "#F8D7DA",
  blue: "#007BFF",
  pink: "#FF69B4",
  cyan: "#00BFFF",
  indigo: "#6610F2",
  lime: "#32CD32",
  amber: "#FFC107",
  deepOrange: "#FF5722",
  deepPurple: "#673AB7",
  lightGreen: "#8BC34A",
  mutedText: "#6C757D",
  darkText: "#212529",
  lightText: "#FFFFFF",
  modalBackground: "rgba(0, 0, 0, 0.5)",
  overlayBackground: "rgba(0, 0, 0, 0.3)",
  inputBackground: "#F8F9FA",
  placeholderText: "#6C757D",
  divider: "#E0E0E0",
  shadow: "rgba(0, 0, 0, 0.1)",
}

export const darkTheme: ThemeColors = {
  primary: "#0A84FF",
  secondary: "#64D2FF",
  teal: "#64D2B5",
  navyBlue: "#4A90E2", // Fixed: was inverted light color
  lightBlue: "#5DADE2", // Fixed: was too dark
  red: "#FF453A",
  green: "#32D74B",
  yellow: "#FFD60A",
  orange: "#FF9F0A",
  purple: "#BF5AF2",
  black: "#FFFFFF", // Semantic: represents "dark" text in dark mode
  white: "#181A20", // Updated: use modern dark background instead of pure black
  offWhite: "#23272F", // Updated: use a slightly lighter dark for cards/surfaces
  gray: "#8E8E93",
  lightGray: "#2C2C2E",
  darkGray: "#F5F5F7", // Fixed: was inverted
  error: "#FF453A",
  success: "#32D74B",
  warning: "#FFD60A",
  info: "#64D2FF",
  transparent: "transparent",
  background: "#181A20", // Updated: modern dark background
  cardBackground: "#23272F", // Updated: modern dark card background
  accent: "#0A84FF",
  accentLight: "#1C3D63",
  surface: "#23272F", // Updated: modern dark surface
  text: "#FFFFFF",
  textSecondary: "#8E8E93", // Fixed: more consistent with gray
  border: "#38383A", // Lightened from #333333
  errorLight: "#FF6B6B", // Lightened from #FFB4B4
  blue: "#0A84FF", // Consistent with primary
  pink: "#FF69B4",
  cyan: "#00BFFF",
  indigo: "#7B68EE", // Lightened from #6610F2
  lime: "#50E3C2", // Lightened from #32CD32
  amber: "#FFD60A", // Consistent with warning
  deepOrange: "#FF7043", // Lightened from #FF5722
  deepPurple: "#9575CD", // Lightened from #673AB7
  lightGreen: "#A5D6A7", // Lightened from #8BC34A
  mutedText: "#8E8E93", // Consistent with gray
  darkText: "#FFFFFF",
  lightText: "#181A20", // Updated: matches new background
  modalBackground: "#23272F", // Updated: modern dark modal background
  overlayBackground: "rgba(24, 26, 32, 0.85)", // Updated: modern dark overlay
  inputBackground: "#23272F", // Updated: modern dark input background
  placeholderText: "#8E8E93", // Consistent with gray
  divider: "#38383A", // Consistent with border
  shadow: "rgba(0, 0, 0, 0.3)", // Darker shadow for dark theme
}

// Additional utility colors for better theming
export const semanticColors = {
  light: {
    // Status colors with better contrast
    successBackground: "#D4EDDA",
    errorBackground: "#F8D7DA",
    warningBackground: "#FFF3CD",
    infoBackground: "#D1ECF1",

    // Interactive states
    hoverBackground: "#F5F5F5",
    activeBackground: "#E9ECEF",
    focusRing: "#0066CC40",

    // Content hierarchy
    primaryText: "#212529",
    secondaryText: "#6C757D",
    tertiaryText: "#9CA3AF",
    disabledText: "#CED4DA",
  },
  dark: {
    // Status colors with better contrast
    successBackground: "#1B4332",
    errorBackground: "#5A1A1A",
    warningBackground: "#4A3728",
    infoBackground: "#1A3A4A",

    // Interactive states
    hoverBackground: "#2C2C2E",
    activeBackground: "#3A3A3C",
    focusRing: "#0A84FF40",

    // Content hierarchy
    primaryText: "#FFFFFF",
    secondaryText: "#8E8E93",
    tertiaryText: "#6D6D70",
    disabledText: "#48484A",
  }
}
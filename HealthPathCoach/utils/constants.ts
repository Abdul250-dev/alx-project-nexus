// App constants
export const APP_NAME = "HealthPath Coach"
export const APP_VERSION = "v1.0.0"

// API endpoints
export const API_BASE_URL = "https://api.healthpathcoach.com"

// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: "user_data",
  AUTH_TOKEN: "auth_token",
  THEME_PREFERENCE: "theme_preference",
  LANGUAGE_PREFERENCE: "language_preference",
  SECURITY_SETTINGS: "security_settings",
  NOTIFICATION_SETTINGS: "notification_settings",
  ENCRYPTION_KEY: "encryption_key",
  ENCRYPTION_ENABLED: "encryption_enabled",
  MIGRATION_COMPLETE: "migration_complete",
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  AUTH_ERROR: "Authentication failed. Please check your credentials and try again.",
  GENERAL_ERROR: "Something went wrong. Please try again later.",
}

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  SIGNUP_SUCCESS: "Account created successfully!",
  DATA_SAVED: "Your data has been saved successfully.",
}

// Validation regex
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
}

// App routes - Updated for Expo Router
export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    EXPLORE: "/auth/explore",
  },
  MAIN: {
    DASHBOARD: "/main/dashboard",
    EDUCATION: {
      TOPICS: "/main/education/topics",
      TOPIC_DETAIL: (id: string) => `/main/education/topic/${id}`,
      ARTICLE: (id: string) => `/main/education/article/${id}`,
      VIDEO: (id: string) => `/main/education/video/${id}`,
      QUIZ: (id: string) => `/main/education/quiz/${id}`,
      CONTRACEPTION: {
        COMPARISON: "/main/education/contraception/comparison",
        DETAIL: (id: string) => `/main/education/contraception/${id}`,
        GUIDE: "/main/education/contraception/guide",
      },
    },
    TRACKER: {
      MENSTRUAL: "/main/tracker/menstrual",
      CYCLE: "/main/tracker/cycleTrack",
      NUTRITION: "/main/tracker/nutrition",
      MOOD: "/main/tracker/mood",
      SLEEP: "/main/tracker/sleep",
      PROGRESS: "/main/tracker/progress",
    },
    CHATBOT: "/main/chatbot",
    PROFILE: {
      MAIN: "/main/profile",
      PARTNER: "/main/profile/partner",
      MEDICAL_ASSESSMENT: "/main/profile/medical-assessment",
    },
    REMINDERS: {
      LIST: "/main/reminders",
      ADD: "/main/reminders/edit?mode=add",
      EDIT: (id: string) => `/main/reminders/edit?id=${id}&mode=edit`,
    },
    SETTINGS: {
      NOTIFICATIONS: "/main/settings/notifications",
      SECURITY: "/main/settings/security",
      LANGUAGE: "/main/settings/language",
      ACCOUNT_SETTINGS: "/main/settings/account-settings",
      CHANGE_PASSWORD: "/main/settings/change-password",
    },
  },
}

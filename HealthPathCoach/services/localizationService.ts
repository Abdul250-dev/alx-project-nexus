import * as Localization from "expo-localization"
import * as SecureStore from "expo-secure-store"
import { I18n } from "i18n-js"
import { STORAGE_KEYS } from "../utils/constants"

// Import translations
import en from "../locales/en.json"
import fr from "../locales/fr.json"
import rw from "../locales/rw.json"

// Define supported and future languages
export const supportedLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
]

export const futureLanguages = [
  { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
]

// Create i18n instance
const i18n = new I18n({
  en,
  fr,
  rw,
})

// Set the locale once at the beginning of your app
export const initLocalization = async () => {
  try {
    // Try to get saved language preference
    const savedLanguage = await SecureStore.getItemAsync(STORAGE_KEYS.LANGUAGE_PREFERENCE)

    if (savedLanguage) {
      i18n.locale = savedLanguage
    } else {
      // FIXED: Add null check before splitting
      const deviceLocale = Localization.locale ? Localization.locale.split("-")[0] : "en" // Default fallback

      if (["en", "fr", "rw"].includes(deviceLocale)) {
        i18n.locale = deviceLocale
      } else {
        i18n.locale = "en" // Default to English
      }

      // Save the selected language
      await SecureStore.setItemAsync(STORAGE_KEYS.LANGUAGE_PREFERENCE, i18n.locale)
    }

    // Set fallback locale
    i18n.defaultLocale = "en"
    i18n.enableFallback = true

    return i18n.locale
  } catch (error) {
    console.error("Error initializing localization:", error)
    i18n.locale = "en"
    return "en"
  }
}

// Change language
export const changeLanguage = async (languageCode: string) => {
  try {
    if (["en", "fr", "rw"].includes(languageCode)) {
      i18n.locale = languageCode
      await SecureStore.setItemAsync(STORAGE_KEYS.LANGUAGE_PREFERENCE, languageCode)
      return true
    }
    return false
  } catch (error) {
    console.error("Error changing language:", error)
    return false
  }
}

// Get current language
export const getCurrentLanguage = () => {
  return i18n.locale
}

// Translate function
export const t = (key: string, options = {}) => {
  return i18n.t(key, options)
}

export default i18n

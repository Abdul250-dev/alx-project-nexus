import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Check, Info, X } from "react-native-feather"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import {
  changeLanguage,
  futureLanguages,
  getCurrentLanguage,
  supportedLanguages,
  t,
} from "../../services/localizationService"
import { ROUTES } from "../../utils/constants"

export default function LanguageSettingsScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const { colors } = useTheme()
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get the current language when the component mounts
    const currentLang = getCurrentLanguage()
    setSelectedLanguage(currentLang)
  }, [])

  const handleLanguageChange = async (languageCode: string) => {
    if (selectedLanguage === languageCode) return

    setIsLoading(true)
    const success = await changeLanguage(languageCode)
    setIsLoading(false)

    if (success) {
      setSelectedLanguage(languageCode)
      Alert.alert(t("language.language_changed"), t("language.restart_required"), [{ text: t("common.ok") }])
    }
  }

  const renderLanguageOption = (
    languageCode: string,
    languageName: string,
    nativeName: string,
    isSupported: boolean,
  ) => {
    const isSelected = selectedLanguage === languageCode

    return (
      <TouchableOpacity
        key={languageCode}
        style={[
          styles.languageOption,
          {
            backgroundColor: isSelected ? colors.teal : colors.white,
            borderColor: colors.lightGray,
          },
        ]}
        onPress={() => (isSupported ? handleLanguageChange(languageCode) : null)}
        disabled={!isSupported || isLoading}
      >
        <View style={styles.languageInfo}>
          <Text style={[styles.languageName, { color: isSelected ? colors.white : colors.navyBlue }]}>
            {languageName}
          </Text>
          <Text style={[styles.nativeName, { color: isSelected ? colors.white : colors.gray }]}>{nativeName}</Text>
        </View>

        {isSelected && <Check stroke={colors.white} width={24} height={24} />}

        {!isSupported && (
          <View style={[styles.comingSoonBadge, { backgroundColor: colors.lightBlue }]}>
            <Text style={[styles.comingSoonText, { color: colors.navyBlue }]}>{t("language.coming_soon")}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header
        title={t("language.language_settings")}
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => router.push(ROUTES.MAIN.PROFILE.MAIN as any)}>
            <X stroke={colors.navyBlue} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>{t("language.select_language")}</Text>

        <View style={styles.languagesContainer}>
          {supportedLanguages?.map((lang) => renderLanguageOption(lang.code, lang.name, lang.nativeName, true)) || []}

          {futureLanguages?.map((lang) => renderLanguageOption(lang.code, lang.name, lang.nativeName, false)) || []}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.lightBlue }]}>
          <Info stroke={colors.navyBlue} width={20} height={20} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: colors.navyBlue }]}>{t("language.restart_required")}</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  languagesContainer: {
    marginBottom: 24,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
})

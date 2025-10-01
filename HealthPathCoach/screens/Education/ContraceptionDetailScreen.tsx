import { useRoute } from "@react-navigation/native"
import { Image, ScrollView, StyleSheet, Text, View } from "react-native"
import { AlertCircle, CheckCircle } from "react-native-feather"
import Header from "../../components/Header"
import ReminderSuggestion from "../../components/ReminderSuggestion"
import WarningBox from "../../components/WarningBox"
import { useTheme } from "../../components/theme-provider"
import { getContraceptionMethodById } from "../../services/contraceptionDataService"
import { t } from "../../services/localizationService"

export default function ContraceptionDetailScreen({ methodId }: { methodId?: string }) {
  const route = useRoute()
  const { colors } = useTheme()
  const { method } = route.params as { method: any }

  // Get method data from service if not provided via route params
  const currentMethod = method || getContraceptionMethodById(methodId || "")

  if (!currentMethod) {
    return (
      <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
        <Header title="Contraception" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.gray }]}>
            Method not found. Please try again.
          </Text>
        </View>
      </View>
    )
  }

  const getWarningMessage = (methodId: string) => {
    switch (methodId) {
      case "combined-pill":
        return {
          title: t("contraception.medical_considerations_title"),
          message: t("contraception.combined_pill_warning"),
        }
      case "emergency-pill":
        return {
          title: t("contraception.not_for_regular_use_title"),
          message: t("contraception.emergency_pill_warning"),
        }
      case "withdrawal":
        return {
          title: t("contraception.limited_effectiveness_title"),
          message: t("contraception.withdrawal_warning"),
        }
      case "sterilization-female":
      case "sterilization-male":
        return {
          title: t("contraception.permanent_method_title"),
          message: t("contraception.sterilization_warning"),
        }
      default:
        return null
    }
  }

  const warningMessage = getWarningMessage(currentMethod.id)

  // Determine if this method needs reminders
  const needsReminders = [
    "combined-pill",
    "progestin-only-pill",
    "patch",
    "vaginal-ring",
    "injection",
    "hormonal-iud",
    "copper-iud",
    "implant",
  ].includes(currentMethod.id)

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header title={currentMethod.name || "Contraception"} showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentMethod.image && (
          <View style={[styles.imageContainer, { backgroundColor: colors.white }]}>
            <Image source={currentMethod.image} style={styles.methodImage} resizeMode="contain" />
          </View>
        )}

        {warningMessage && <WarningBox title={warningMessage.title} message={warningMessage.message} />}

        {needsReminders && currentMethod.name && (
          <ReminderSuggestion contraceptionMethod={currentMethod.id} methodName={currentMethod.name} />
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.white }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.gray }]}>{t("contraception.type")}</Text>
            <Text style={[styles.infoValue, { color: colors.navyBlue }]}>
              {currentMethod.type ? currentMethod.type.charAt(0).toUpperCase() + currentMethod.type.slice(1) : "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.gray }]}>{t("contraception.effectiveness")}</Text>
            <Text style={[styles.infoValue, { color: colors.navyBlue }]}>{currentMethod.effectiveness || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.gray }]}>{t("contraception.sti_protection")}</Text>
            <Text style={[styles.infoValue, { color: colors.navyBlue }]}>
              {currentMethod.id === "male-condom" || currentMethod.id === "female-condom" ? "Yes (most STIs)" : "No"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.gray }]}>{t("contraception.hormonal")}</Text>
            <Text style={[styles.infoValue, { color: colors.navyBlue }]}>
              {currentMethod.type === "hormonal" ||
                currentMethod.id === "hormonal-iud" ||
                currentMethod.id === "implant" ||
                currentMethod.id === "patch" ||
                currentMethod.id === "vaginal-ring" ||
                currentMethod.id === "injection" ||
                currentMethod.id === "emergency-pill"
                ? "Yes"
                : "No"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.gray }]}>{t("contraception.prescription_required")}</Text>
            <Text style={[styles.infoValue, { color: colors.navyBlue }]}>
              {currentMethod.id === "male-condom" ||
                currentMethod.id === "female-condom" ||
                currentMethod.id === "withdrawal" ||
                currentMethod.id === "fertility-awareness" ||
                currentMethod.id === "emergency-pill"
                ? "No"
                : "Yes"}
            </Text>
          </View>
        </View>

        {currentMethod.description && (
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>{t("contraception.description")}</Text>
            <Text style={[styles.sectionText, { color: colors.gray }]}>{currentMethod.description}</Text>
          </View>
        )}

        {currentMethod.howItWorks && (
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>{t("contraception.how_it_works")}</Text>
            <Text style={[styles.sectionText, { color: colors.gray }]}>{currentMethod.howItWorks}</Text>
          </View>
        )}

        {currentMethod.benefits && currentMethod.benefits.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>{t("contraception.benefits")}</Text>
            {currentMethod.benefits.map((benefit: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <CheckCircle stroke={colors.teal} width={16} height={16} style={styles.listIcon} />
                <Text style={[styles.listText, { color: colors.gray }]}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {currentMethod.considerations && currentMethod.considerations.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>{t("contraception.considerations")}</Text>
            {currentMethod.considerations.map((consideration: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <AlertCircle stroke={colors.navyBlue} width={16} height={16} style={styles.listIcon} />
                <Text style={[styles.listText, { color: colors.gray }]}>{consideration}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.noteCard, { backgroundColor: colors.lightBlue }]}>
          <Text style={[styles.noteTitle, { color: colors.navyBlue }]}>{t("contraception.important_note_title")}</Text>
          <Text style={[styles.noteText, { color: colors.navyBlue }]}>
            {t("contraception.important_note_text")}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  imageContainer: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  methodImage: {
    width: 150,
    height: 150,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  listIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
})

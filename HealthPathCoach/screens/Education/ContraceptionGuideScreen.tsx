import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ChevronRight, Info } from "react-native-feather"
import Card from "../../components/Card"
import FAQAccordion from "../../components/FAQAccordion"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { getContraceptionMethods } from "../../services/contraceptionDataService"
import { t } from "../../services/localizationService"

export default function ContraceptionGuideScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [selectedType, setSelectedType] = useState<string>("all")
  const router = useRouter()

  const contraceptionTypes = [
    { id: "all", name: t("contraception.all_methods") },
    { id: "hormonal", name: t("contraception.hormonal") },
    { id: "barrier", name: t("contraception.barrier") },
    { id: "long-acting", name: t("contraception.long_acting") },
    { id: "natural", name: t("contraception.natural") },
    { id: "emergency", name: t("contraception.emergency") },
  ]

  const contraceptionMethods = getContraceptionMethods()

  const filteredMethods =
    selectedType === "all"
      ? contraceptionMethods
      : contraceptionMethods.filter((method) => method.type === selectedType)

  const handleMethodPress = (method: any) => {
    router.push(`/main/education/contraception/${method.id}` as any)
  }

  const renderMethodCard = (method: any) => {
    return (
      <Card
        key={method.id}
        style={[styles.methodCard, { backgroundColor: colors.white }]}
        onPress={() => handleMethodPress(method)}
      >
        <View style={styles.methodCardContent}>
          <Image source={method.image} style={styles.methodImage} resizeMode="contain" />
          <View style={styles.methodInfo}>
            <Text style={[styles.methodName, { color: colors.navyBlue }]}>{method.name}</Text>
            <Text style={[styles.methodType, { color: colors.teal }]}>
              {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
            </Text>
            <Text style={[styles.methodEffectiveness, { color: colors.gray }]}>
              Effectiveness: {method.effectiveness}
            </Text>
          </View>
          <ChevronRight stroke={colors.gray} width={20} height={20} />
        </View>
      </Card>
    )
  }

  const faqItems = [
    {
      question: "How do I choose the right contraception method?",
      answer:
        "Consider factors like effectiveness, ease of use, side effects, health conditions, STI protection needs, future pregnancy plans, and personal preferences. Discuss options with a healthcare provider who can help you make an informed decision based on your specific needs and medical history.",
    },
    {
      question: "Can I use more than one contraception method at once?",
      answer:
        "Yes, using multiple methods (like condoms plus hormonal contraception) can provide extra protection against pregnancy and STIs. This is called 'dual protection.' However, don't use two condoms together as this can increase friction and risk of breakage.",
    },
    {
      question: "What should I do if I miss a pill or other contraception failure?",
      answer:
        "If you miss a pill, check the instructions for your specific pill type or consult a healthcare provider. For other contraceptive failures (like condom breakage), consider emergency contraception if taken within the appropriate timeframe (typically 3-5 days depending on the type).",
    },
    {
      question: "Do contraceptives affect future fertility?",
      answer:
        "Most contraceptive methods are completely reversible and don't affect long-term fertility. After stopping hormonal methods, it may take a few months for your cycle to return to normal. Only sterilization procedures are designed to be permanent, though even these can sometimes be reversed with surgery.",
    },
    {
      question: "Which contraceptive methods protect against STIs?",
      answer:
        "Only barrier methods like male and female condoms provide protection against STIs. Other methods like hormonal contraceptives, IUDs, and implants are effective at preventing pregnancy but offer no protection against STIs. Consider using condoms alongside other methods if STI protection is needed.",
    },
  ]

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header title="Contraception Guide" showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Info stroke={colors.teal} width={20} height={20} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: colors.navyBlue }]}>
            This guide provides educational information about contraception methods. Consult a healthcare provider for
            personalized advice.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typesScrollContent}>
          {contraceptionTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                {
                  backgroundColor: selectedType === type.id ? colors.teal : colors.white,
                  borderColor: colors.lightGray,
                },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text style={[styles.typeText, { color: selectedType === type.id ? colors.white : colors.navyBlue }]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.methodsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>
            {selectedType === "all"
              ? "All Methods"
              : selectedType.charAt(0).toUpperCase() + selectedType.slice(1) + " Methods"}
          </Text>

          {filteredMethods.map(renderMethodCard)}
        </View>

        <View style={styles.comparisonContainer}>
          <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>Choosing a Method</Text>
          <Text style={[styles.comparisonText, { color: colors.gray }]}>
            When choosing a contraceptive method, consider these factors:
          </Text>
          <View style={[styles.factorsList, { borderColor: colors.lightGray }]}>
            <Text style={[styles.factor, { color: colors.navyBlue }]}>• Effectiveness</Text>
            <Text style={[styles.factor, { color: colors.navyBlue }]}>• Ease of use</Text>
            <Text style={[styles.factor, { color: colors.navyBlue }]}>• Side effects</Text>
            <Text style={[styles.factor, { color: colors.navyBlue }]}>• Health considerations</Text>
            <Text style={[styles.factor, { color: colors.navyBlue }]}>• STI protection needs</Text>
            <Text style={[styles.factor, { color: colors.navyBlue }]}>• Future pregnancy plans</Text>
            <Text style={[styles.factor, { color: colors.navyBlue }]}>• Personal preferences</Text>
          </View>
          <TouchableOpacity
            style={[styles.compareButton, { backgroundColor: colors.teal }]}
            onPress={() => router.push("/main/education/contraception/comparison" as any)}
          >
            <Text style={[styles.compareButtonText, { color: colors.white }]}>Compare Methods</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.faqContainer}>
          <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>Frequently Asked Questions</Text>
          <FAQAccordion items={faqItems} />
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
    paddingBottom: 32,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E6F7F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  typesScrollContent: {
    paddingBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  methodsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  methodCard: {
    marginBottom: 12,
  },
  methodCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  methodImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  methodType: {
    fontSize: 14,
    marginBottom: 4,
  },
  methodEffectiveness: {
    fontSize: 12,
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  comparisonText: {
    fontSize: 16,
    marginBottom: 12,
  },
  factorsList: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  factor: {
    fontSize: 16,
    marginBottom: 8,
  },
  compareButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  compareButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  faqContainer: {
    marginBottom: 24,
  },
})

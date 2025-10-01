import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { AlertTriangle, Check, X } from "react-native-feather"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"

type ComparisonCategory = { 
  id: string
  name: string
}

type ComparisonMethod = {
  id: string
  name: string
  effectiveness: string
  hormonal: boolean
  duration: string
  stiProtection: "none" | "partial" | "good"
  prescription: boolean
  insertion: boolean
  maintenance: "none" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "multi-year"
  reversibility: "immediate" | "delayed" | "permanent"
}

// Navigation type - adjust this based on your actual navigation structure
type NavigationScreenParams = {
  ContraceptionDetailScreen: { method: ComparisonMethod }
}

export default function ContraceptionComparisonScreen() {
  const navigation = useNavigation<any>() // Use proper type here based on your navigation setup
  const { colors } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState<string>("effectiveness")

  const categories: ComparisonCategory[] = [
    { id: "effectiveness", name: "Effectiveness" },
    { id: "hormones", name: "Hormones" },
    { id: "duration", name: "Duration" },
    { id: "sti", name: "STI Protection" },
    { id: "access", name: "Access" },
    { id: "maintenance", name: "Maintenance" },
    { id: "reversibility", name: "Reversibility" },
  ]

  const methods: ComparisonMethod[] = [
    {
      id: "combined-pill",
      name: "Combined Pill",
      effectiveness: "91-99%",
      hormonal: true,
      duration: "Daily",
      stiProtection: "none",
      prescription: true,
      insertion: false,
      maintenance: "daily",
      reversibility: "immediate",
    },
    {
      id: "progestin-only-pill",
      name: "Progestin-Only Pill",
      effectiveness: "91-99%",
      hormonal: true,
      duration: "Daily",
      stiProtection: "none",
      prescription: true,
      insertion: false,
      maintenance: "daily",
      reversibility: "immediate",
    },
    {
      id: "male-condom",
      name: "Male Condom",
      effectiveness: "85-98%",
      hormonal: false,
      duration: "Single use",
      stiProtection: "good",
      prescription: false,
      insertion: false,
      maintenance: "none",
      reversibility: "immediate",
    },
    {
      id: "female-condom",
      name: "Female Condom",
      effectiveness: "79-95%",
      hormonal: false,
      duration: "Single use",
      stiProtection: "good",
      prescription: false,
      insertion: false,
      maintenance: "none",
      reversibility: "immediate",
    },
    {
      id: "iud-hormonal",
      name: "Hormonal IUD",
      effectiveness: "99%",
      hormonal: true,
      duration: "3-8 years",
      stiProtection: "none",
      prescription: true,
      insertion: true,
      maintenance: "yearly",
      reversibility: "immediate",
    },
    {
      id: "iud-copper",
      name: "Copper IUD",
      effectiveness: "99%",
      hormonal: false,
      duration: "Up to 12 years",
      stiProtection: "none",
      prescription: true,
      insertion: true,
      maintenance: "yearly",
      reversibility: "immediate",
    },
    {
      id: "implant",
      name: "Implant",
      effectiveness: "99%",
      hormonal: true,
      duration: "Up to 5 years",
      stiProtection: "none",
      prescription: true,
      insertion: true,
      maintenance: "multi-year",
      reversibility: "immediate",
    },
    {
      id: "injection",
      name: "Injection",
      effectiveness: "94-99%",
      hormonal: true,
      duration: "3 months",
      stiProtection: "none",
      prescription: true,
      insertion: false,
      maintenance: "quarterly",
      reversibility: "delayed",
    },
    {
      id: "patch",
      name: "Patch",
      effectiveness: "91-99%",
      hormonal: true,
      duration: "Weekly",
      stiProtection: "none",
      prescription: true,
      insertion: false,
      maintenance: "weekly",
      reversibility: "immediate",
    },
    {
      id: "vaginal-ring",
      name: "Vaginal Ring",
      effectiveness: "91-99%",
      hormonal: true,
      duration: "Monthly",
      stiProtection: "none",
      prescription: true,
      insertion: false,
      maintenance: "monthly",
      reversibility: "immediate",
    },
    {
      id: "diaphragm",
      name: "Diaphragm",
      effectiveness: "88-96%",
      hormonal: false,
      duration: "Up to 2 years",
      stiProtection: "partial",
      prescription: true,
      insertion: false,
      maintenance: "none",
      reversibility: "immediate",
    },
    {
      id: "fertility-awareness",
      name: "Fertility Awareness",
      effectiveness: "76-99%",
      hormonal: false,
      duration: "Ongoing",
      stiProtection: "none",
      prescription: false,
      insertion: false,
      maintenance: "daily",
      reversibility: "immediate",
    },
    {
      id: "withdrawal",
      name: "Withdrawal",
      effectiveness: "78-96%",
      hormonal: false,
      duration: "Single use",
      stiProtection: "none",
      prescription: false,
      insertion: false,
      maintenance: "none",
      reversibility: "immediate",
    },
    {
      id: "emergency-pill",
      name: "Emergency Pill",
      effectiveness: "75-89%",
      hormonal: true,
      duration: "Single use",
      stiProtection: "none",
      prescription: false,
      insertion: false,
      maintenance: "none",
      reversibility: "immediate",
    },
    {
      id: "sterilization-female",
      name: "Female Sterilization",
      effectiveness: "99%",
      hormonal: false,
      duration: "Permanent",
      stiProtection: "none",
      prescription: true,
      insertion: true,
      maintenance: "none",
      reversibility: "permanent",
    },
    {
      id: "sterilization-male",
      name: "Vasectomy",
      effectiveness: "99%",
      hormonal: false,
      duration: "Permanent",
      stiProtection: "none",
      prescription: true,
      insertion: true,
      maintenance: "none",
      reversibility: "permanent",
    },
  ]

  const renderCategoryValue = (method: ComparisonMethod, category: string) => {
    switch (category) {
      case "effectiveness":
        return <Text style={[styles.cellText, { color: colors.navyBlue }]}>{method.effectiveness}</Text>
      case "hormones":
        return method.hormonal ? (
          <Check stroke={colors.teal} width={20} height={20} />
        ) : (
          <X stroke={colors.error} width={20} height={20} />
        )
      case "duration":
        return <Text style={[styles.cellText, { color: colors.navyBlue }]}>{method.duration}</Text>
      case "sti":
        return method.stiProtection === "good" ? (
          <Check stroke={colors.teal} width={20} height={20} />
        ) : method.stiProtection === "partial" ? (
          <AlertTriangle stroke={colors.warning} width={20} height={20} />
        ) : (
          <X stroke={colors.error} width={20} height={20} />
        )
      case "access":
        return method.prescription ? (
          <Text style={[styles.cellText, { color: colors.navyBlue }]}>Prescription</Text>
        ) : (
          <Text style={[styles.cellText, { color: colors.navyBlue }]}>OTC</Text>
        )
      case "maintenance":
        switch (method.maintenance) {
          case "none":
            return <Text style={[styles.cellText, { color: colors.navyBlue }]}>None</Text>
          case "daily":
            return <Text style={[styles.cellText, { color: colors.navyBlue }]}>Daily</Text>
          case "weekly":
            return <Text style={[styles.cellText, { color: colors.navyBlue }]}>Weekly</Text>
          case "monthly":
            return <Text style={[styles.cellText, { color: colors.navyBlue }]}>Monthly</Text>
          case "quarterly":
            return <Text style={[styles.cellText, { color: colors.navyBlue }]}>Every 3 months</Text>
          case "yearly":
            return <Text style={[styles.cellText, { color: colors.navyBlue }]}>Yearly check</Text>
          case "multi-year":
            return <Text style={[styles.cellText, { color: colors.navyBlue }]}>Every few years</Text>
          default:
            return null
        }
      case "reversibility":
        switch (method.reversibility) {
          case "immediate":
            return <Text style={[styles.cellText, { color: colors.teal }]}>Immediate</Text>
          case "delayed":
            return <Text style={[styles.cellText, { color: colors.warning }]}>Delayed</Text>
          case "permanent":
            return <Text style={[styles.cellText, { color: colors.error }]}>Permanent</Text>
          default:
            return null
        }
      default:
        return null
    }
  }

  const handleMethodPress = (method: ComparisonMethod) => {
    navigation.navigate("ContraceptionDetailScreen", { method })
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Compare Methods" showBackButton />

      <View style={[styles.categoryContainer, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category.id ? colors.teal : colors.white,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? colors.white : colors.text },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.tableContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
            <Text style={[styles.headerText, { color: colors.white }]}>Method</Text>
            <Text style={[styles.headerText, { color: colors.white }]}>
              {categories.find((c) => c.id === selectedCategory)?.name}
            </Text>
          </View>

          {methods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.tableRow, { borderBottomColor: colors.border }]}
              onPress={() => handleMethodPress(method)}
            >
              <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
              <View style={styles.valueCell}>{renderCategoryValue(method, selectedCategory)}</View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.legendContainer}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Understanding the Comparison</Text>

          {selectedCategory === "effectiveness" && (
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Effectiveness rates show the range from typical use (lower number) to perfect use (higher number). Higher
              percentages mean better protection against pregnancy.
            </Text>
          )}

          {selectedCategory === "hormones" && (
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              A checkmark indicates the method contains hormones. Hormonal methods may offer benefits beyond
              contraception but may have side effects for some users.
            </Text>
          )}

          {selectedCategory === "duration" && (
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Duration shows how long each method lasts before needing replacement or renewal. Longer durations
              generally mean less maintenance.
            </Text>
          )}

          {selectedCategory === "sti" && (
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              A checkmark indicates good protection against most STIs. A triangle indicates partial protection. An X
              means no protection against STIs. Only barrier methods provide STI protection.
            </Text>
          )}

          {selectedCategory === "access" && (
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {`"Prescription" means a healthcare provider visit is required. "OTC" (over-the-counter) means the method
              can be obtained without a prescription.`}`
            </Text>
          )}

          {selectedCategory === "maintenance" && (
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Maintenance indicates how often you need to remember to use or replace the method. Methods with less
              frequent maintenance may be easier to use consistently.
            </Text>
          )}

          {selectedCategory === "reversibility" && (
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {`"Immediate" means fertility returns quickly after stopping. "Delayed" means fertility may take time to
              return. "Permanent" means the method is not designed to be reversed.`}
            </Text>
          )}
        </View>

        <View style={[styles.noteCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.noteTitle, { color: colors.text }]}>Important Note</Text>
          <Text style={[styles.noteText, { color: colors.text }]}>
            This comparison is for educational purposes only. The best contraceptive method varies from person to
            person. Consult a healthcare provider for personalized advice.
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
  categoryContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  tableContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    padding: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  methodName: {
    fontSize: 16,
    flex: 1,
  },
  valueCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 14,
    textAlign: "center",
  },
  legendContainer: {
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  legendText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
  },
})
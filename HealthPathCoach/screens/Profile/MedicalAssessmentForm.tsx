import { useNavigation } from "@react-navigation/native"
import { useMemo, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { X } from "react-native-feather"
import AnimatedButton from "../../components/AnimatedButton"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"

type FormField = {
  id: string
  label: string
  type: "text" | "number" | "select" | "date"
  options?: string[]
  placeholder?: string
  required?: boolean
  icon?: string
  section?: string
  genderSpecific?: "female" | "male"
}

export default function MedicalAssessmentForm() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { userData, updateUser } = useUser()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const allFormFields: FormField[] = [
    // Basic Health Metrics
    {
      id: "height",
      label: "Height",
      type: "number",
      placeholder: "Enter your height in cm",
      required: true,
      icon: "📏",
      section: "Basic Metrics",
    },
    {
      id: "weight",
      label: "Weight",
      type: "number",
      placeholder: "Enter your weight in kg",
      required: true,
      icon: "⚖️",
      section: "Basic Metrics",
    },
    {
      id: "bloodType",
      label: "Blood Type",
      type: "select",
      options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      required: false,
      icon: "🩸",
      section: "Basic Metrics",
    },

    // Medical History
    {
      id: "allergies",
      label: "Allergies",
      type: "text",
      placeholder: "List any allergies (e.g., peanuts, shellfish)",
      required: false,
      icon: "⚠️",
      section: "Medical History",
    },
    {
      id: "medications",
      label: "Current Medications",
      type: "text",
      placeholder: "List medications you're currently taking",
      required: false,
      icon: "💊",
      section: "Medical History",
    },
    {
      id: "chronicConditions",
      label: "Chronic Conditions",
      type: "text",
      placeholder: "List any ongoing health conditions",
      required: false,
      icon: "🏥",
      section: "Medical History",
    },
    {
      id: "lastCheckup",
      label: "Last Medical Checkup",
      type: "date",
      placeholder: "YYYY-MM-DD",
      required: false,
      icon: "📅",
      section: "Medical History",
    },

    // Female-specific fields
    {
      id: "menarcheAge",
      label: "Age at First Period",
      type: "number",
      placeholder: "Age when you had your first period",
      required: false,
      icon: "🌸",
      section: "Reproductive Health",
      genderSpecific: "female",
    },
    {
      id: "cycleDuration",
      label: "Average Cycle Duration",
      type: "number",
      placeholder: "Days between periods (typically 21-35 days)",
      required: false,
      icon: "📅",
      section: "Reproductive Health",
      genderSpecific: "female",
    },
    {
      id: "periodDuration",
      label: "Average Period Duration",
      type: "number",
      placeholder: "Days of bleeding (typically 3-7 days)",
      required: false,
      icon: "🩸",
      section: "Reproductive Health",
      genderSpecific: "female",
    },
    {
      id: "pregnancies",
      label: "Number of Pregnancies",
      type: "number",
      placeholder: "Total number of pregnancies",
      required: false,
      icon: "🤱",
      section: "Reproductive Health",
      genderSpecific: "female",
    },
  ]

  // Filter fields based on user gender
  const formFields = useMemo(() => {
    const userGender = userData?.gender?.toLowerCase()

    return allFormFields.filter(field => {
      if (!field.genderSpecific) return true
      return field.genderSpecific === userGender
    })
  }, [userData?.gender])

  // Group fields by section
  const groupedFields = useMemo(() => {
    const groups: Record<string, FormField[]> = {}
    formFields.forEach(field => {
      const section = field.section || "Other"
      if (!groups[section]) {
        groups[section] = []
      }
      groups[section].push(field)
    })
    return groups
  }, [formFields])

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async () => {
    // Validate required fields
    const missingFields = formFields
      .filter((field) => field.required && !formData[field.id])
      .map((field) => field.label)

    if (missingFields.length > 0) {
      Alert.alert("Missing Information", `Please fill in the following fields: ${missingFields.join(", ")}`)
      return
    }

    setLoading(true)

    try {
      const success = await updateUser({
        medicalAssessment: formData,
      })

      if (success) {
        Alert.alert("Success", "Your medical assessment has been saved successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ])
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("Error saving medical assessment:", error)
      Alert.alert("Error", "Failed to save your medical assessment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "select":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.fieldIcon}>{field.icon}</Text>
              <Text style={[styles.fieldLabel, { color: colors.navyBlue }]}>
                {field.label} {field.required && <Text style={{ color: colors.error }}>*</Text>}
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: formData[field.id] === option ? colors.teal : colors.white,
                      borderColor: formData[field.id] === option ? colors.teal : colors.lightGray,
                      shadowColor: formData[field.id] === option ? colors.teal : "transparent",
                    },
                  ]}
                  onPress={() => handleInputChange(field.id, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: formData[field.id] === option ? colors.white : colors.navyBlue,
                        fontWeight: formData[field.id] === option ? "600" : "400"
                      }
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )

      default:
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.fieldIcon}>{field.icon}</Text>
              <Text style={[styles.fieldLabel, { color: colors.navyBlue }]}>
                {field.label} {field.required && <Text style={{ color: colors.error }}>*</Text>}
              </Text>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.white,
                  borderColor: formData[field.id] ? colors.teal : colors.lightGray,
                  color: colors.navyBlue,
                },
              ]}
              placeholder={field.placeholder}
              placeholderTextColor={colors.gray}
              value={formData[field.id] || ""}
              onChangeText={(value) => handleInputChange(field.id, value)}
              keyboardType={field.type === "number" ? "numeric" : "default"}
              multiline={field.type === "text" && (field.id === "allergies" || field.id === "medications" || field.id === "chronicConditions")}
              numberOfLines={field.type === "text" && (field.id === "allergies" || field.id === "medications" || field.id === "chronicConditions") ? 3 : 1}
            />
          </View>
        )
    }
  }

  const renderSection = (sectionName: string, fields: FormField[]) => (
    <View key={sectionName} style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.navyBlue }]}>
        {sectionName}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.white }]}>
        {fields.map((field) => renderField(field))}
      </View>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header
        title="Medical Assessment"
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X stroke={colors.navyBlue} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.formTitle, { color: colors.navyBlue }]}>
            📋 Health Information
          </Text>
          <Text style={[styles.formDescription, { color: colors.gray }]}>
            Help us provide personalized health insights by sharing your medical information.
            All data is kept private and secure.
          </Text>
        </View>

        {Object.entries(groupedFields).map(([sectionName, fields]) =>
          renderSection(sectionName, fields)
        )}

        <AnimatedButton
          title="💾 Save Information"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  formDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionContent: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  input: {
    minHeight: 50,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 14,
    textAlign: "center",
  },
  submitButton: {
    marginTop: 20,
    marginHorizontal: 4,
  },
})
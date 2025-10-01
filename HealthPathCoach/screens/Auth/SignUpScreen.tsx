import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Eye, EyeOff } from "react-native-feather";
import { useTheme } from "../../components/theme-provider";
import { useAuth } from "../../context/AuthContext";
import {
  validateDate,
  validateMatch,
  validateMinLength,
  validateRequired
} from "../../utils/validators";

type SignUpScreenProps = {
  onSignUpSuccess: () => void
}

export default function SignUpScreen({ onSignUpSuccess }: SignUpScreenProps) {
  const router = useRouter()
  const { colors } = useTheme()
  const { signup } = useAuth()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [gender, setGender] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errorAction, setErrorAction] = useState<string | undefined>()
  const [errorActionText, setErrorActionText] = useState<string | undefined>()

  // Field-specific errors
  const [firstNameError, setFirstNameError] = useState("")
  const [lastNameError, setLastNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [genderError, setGenderError] = useState("")
  const [birthDateError, setBirthDateError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    let isValid = true

    // Reset errors
    setFirstNameError("")
    setLastNameError("")
    setEmailError("")
    setPasswordError("")
    setConfirmPasswordError("")
    setGenderError("")
    setBirthDateError("")

    if (!validateRequired(firstName)) {
      setFirstNameError("First name is required")
      isValid = false
    }

    if (!validateRequired(lastName)) {
      setLastNameError("Last name is required")
      isValid = false
    }

    if (!validateRequired(email)) {
      setEmailError("Email is required")
      isValid = false
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      isValid = false
    }

    if (!validateRequired(password)) {
      setPasswordError("Password is required")
      isValid = false
    } else if (!validateMinLength(password, 6)) {
      setPasswordError("Password must be at least 6 characters")
      isValid = false
    }

    if (!validateRequired(confirmPassword)) {
      setConfirmPasswordError("Please confirm your password")
      isValid = false
    } else if (!validateMatch(password, confirmPassword)) {
      setConfirmPasswordError("Passwords do not match")
      isValid = false
    }

    if (!validateRequired(gender)) {
      setGenderError("Please select your gender")
      isValid = false
    }

    if (!validateRequired(birthDate)) {
      setBirthDateError("Birth date is required")
      isValid = false
    } else if (!validateDate(birthDate)) {
      setBirthDateError("Birth date must be in YYYY-MM-DD format")
      isValid = false
    }

    return isValid
  }

  const handleSignUp = async () => {
    setError("")
    setErrorAction(undefined)
    setErrorActionText(undefined)

    if (!validateForm()) {
      // Debugging for developer
      console.error("[SignUpScreen] Validation failed:", {
        firstName, lastName, email, password, confirmPassword, gender, birthDate
      })
      return
    }

    setLoading(true)

    try {
      const result = await signup({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        gender,
        birthDate,
      })

      if (result.success) {
        onSignUpSuccess()
      } else {
        setError(result.error || "Failed to create account")
        setErrorAction(result.errorAction)
        setErrorActionText(result.errorActionText)

        // Debugging for developer
        console.error("[SignUpScreen] Signup error:", {
          email,
          error: result.error,
          errorAction: result.errorAction,
          errorActionText: result.errorActionText,
          form: { firstName, lastName, gender, birthDate }
        })
      }
    } catch (error: any) {
      setError(error.message ?? "Failed to create account")
      // Debugging for developer
      console.error("[SignUpScreen] Signup error:", {
        email,
        error,
        form: { firstName, lastName, gender, birthDate }
      })
    } finally {
      setLoading(false)
    }
  }

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0]
      setBirthDate(formatted)
    }
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigateToLogin = () => {
    router.back()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.white }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: colors.navyBlue }]}>HealthPathCoach</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.welcomeText, { color: colors.navyBlue }]}>Create Account</Text>
          <Text style={[styles.subtitleText, { color: colors.gray }]}>Sign up to get started</Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              {errorAction === "signin" && errorActionText ? (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.teal }]}
                  onPress={navigateToLogin}
                >
                  <Text style={[styles.actionButtonText, { color: colors.white }]}>
                    {errorActionText}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, styles.nameInput]}>
              <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: firstNameError ? colors.error : colors.lightGray,
                    color: colors.black,
                  },
                ]}
                placeholder="Enter first name"
                placeholderTextColor={colors.gray}
                value={firstName}
                onChangeText={setFirstName}
              />
              {firstNameError ? (
                <Text style={[styles.fieldError, { color: colors.error }]}>{firstNameError}</Text>
              ) : null}
            </View>

            <View style={[styles.inputGroup, styles.nameInput]}>
              <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: lastNameError ? colors.error : colors.lightGray,
                    color: colors.black,
                  },
                ]}
                placeholder="Enter last name"
                placeholderTextColor={colors.gray}
                value={lastName}
                onChangeText={setLastName}
              />
              {lastNameError ? (
                <Text style={[styles.fieldError, { color: colors.error }]}>{lastNameError}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: emailError ? colors.error : colors.lightGray,
                  color: colors.black,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Password</Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  borderColor: passwordError ? colors.error : colors.lightGray,
                },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.black }]}
                placeholder="Create password"
                placeholderTextColor={colors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff stroke={colors.gray} width={20} height={20} />
                ) : (
                  <Eye stroke={colors.gray} width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>{passwordError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Confirm Password</Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  borderColor: confirmPasswordError ? colors.error : colors.lightGray,
                },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.black }]}
                placeholder="Confirm password"
                placeholderTextColor={colors.gray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff stroke={colors.gray} width={20} height={20} />
                ) : (
                  <Eye stroke={colors.gray} width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>{confirmPasswordError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Gender</Text>
            <View style={styles.genderContainer}>
              {[
                { value: "female", label: "Female" },
                { value: "male", label: "Male" },
              ].map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor: gender === value ? colors.teal : colors.white,
                      borderColor: gender === value ? colors.teal : colors.lightGray,
                    },
                  ]}
                  onPress={() => setGender(value)}
                >
                  <Text style={[
                    styles.genderText,
                    { color: gender === value ? colors.white : colors.black }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {genderError ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>{genderError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.navyBlue }]}>Birth Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: birthDateError ? colors.error : colors.lightGray,
                    color: colors.black,
                  },
                ]}
                placeholder="Select birth date"
                placeholderTextColor={colors.gray}
                value={formatDisplayDate(birthDate)}
                editable={false}
              />
            </TouchableOpacity>
            {birthDateError ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>{birthDateError}</Text>
            ) : null}
            {showDatePicker && (
              <DateTimePicker
                value={birthDate ? new Date(birthDate) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: colors.teal }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={[styles.signupButtonText, { color: colors.white }]}>
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.loginContainer}>
            <Text style={[styles.haveAccountText, { color: colors.gray }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={[styles.loginText, { color: colors.teal }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 44,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  genderOption: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  genderText: {
    fontSize: 16,
    fontWeight: "500",
  },
  signupButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  haveAccountText: {
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
    fontWeight: "600",
  },
})
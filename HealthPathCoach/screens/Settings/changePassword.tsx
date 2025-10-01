import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { X } from "react-native-feather"
import { SafeAreaView } from "react-native-safe-area-context"
import AnimatedButton from "../../components/AnimatedButton"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useAuth } from "../../context/AuthContext"
const { width } = Dimensions.get('window')

// ✅ Add prop type
type ChangePasswordScreenProps = {
  onPasswordChangeSuccess: () => void
}

export default function ChangePasswordScreen({ onPasswordChangeSuccess }: ChangePasswordScreenProps) {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { changePassword } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Please fill in all required fields")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long")
      return
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const success = await changePassword(currentPassword, newPassword)

      if (success) {
        setSuccess(true)
        onPasswordChangeSuccess()
        // Clear form on success
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        // Optionally navigate back or show success message
      }
    } catch (error: any) {
      setError(error.message ?? "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword)
        break
      case 'new':
        setShowNewPassword(!showNewPassword)
        break
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword)
        break
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.offWhite }]}>
        <View style={[styles.backgroundGradient, { backgroundColor: colors.offWhite }]}>
          <Header
            title="Change Password"
            showBackButton
            rightComponent={
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <X stroke={colors.navyBlue} width={24} height={24} />
              </TouchableOpacity>
            }
          />

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <View style={[styles.iconContainer, { backgroundColor: colors.teal + '15' }]}>
                <Text style={[styles.iconText, { color: colors.teal }]}>🔐</Text>
              </View>
              <Text style={[styles.title, { color: colors.navyBlue }]}>Update Password</Text>
              <Text style={[styles.subtitle, { color: colors.gray }]}>
                Keep your account secure with a strong password
              </Text>
            </View>

            {/* Form Container */}
            <View style={[styles.formCard, { backgroundColor: colors.white }]}>
              {/* Current Password */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.navyBlue }]}>Current Password *</Text>
                <View style={[styles.inputWrapper, { borderColor: currentPassword ? colors.teal : colors.lightGray }]}>
                  <Text style={[styles.inputIcon, { color: colors.gray }]}>🔒</Text>
                  <TextInput
                    style={[styles.input, styles.inputWithIcon, { color: colors.black }]}
                    placeholder="Enter your current password"
                    placeholderTextColor={colors.gray}
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('current')}
                    style={styles.eyeIcon}
                  >
                    <Text style={[styles.inputIcon, { color: colors.gray }]}>
                      {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.navyBlue }]}>New Password *</Text>
                <View style={[styles.inputWrapper, { borderColor: newPassword ? colors.teal : colors.lightGray }]}>
                  <Text style={[styles.inputIcon, { color: colors.gray }]}>🔑</Text>
                  <TextInput
                    style={[styles.input, styles.inputWithIcon, { color: colors.black }]}
                    placeholder="Create a strong new password"
                    placeholderTextColor={colors.gray}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('new')}
                    style={styles.eyeIcon}
                  >
                    <Text style={[styles.inputIcon, { color: colors.gray }]}>
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.strengthIndicator}>
                    <View style={[
                      styles.strengthBar,
                      {
                        backgroundColor: newPassword.length < 6 ? colors.error :
                          newPassword.length < 8 ? '#ff9500' : colors.teal,
                        width: `${Math.min((newPassword.length / 12) * 100, 100)}%`
                      }
                    ]} />
                  </View>
                  <Text style={[styles.strengthText, {
                    color: newPassword.length < 6 ? colors.error :
                      newPassword.length < 8 ? '#ff9500' : colors.teal
                  }]}>
                    {newPassword.length < 6 ? 'Weak' :
                      newPassword.length < 8 ? 'Medium' : 'Strong'}
                  </Text>
                </View>
              )}

              {/* Confirm New Password */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.navyBlue }]}>Confirm New Password *</Text>
                <View style={[styles.inputWrapper, { borderColor: confirmNewPassword ? colors.teal : colors.lightGray }]}>
                  <Text style={[styles.inputIcon, { color: colors.gray }]}>🔐</Text>
                  <TextInput
                    style={[styles.input, styles.inputWithIcon, { color: colors.black }]}
                    placeholder="Confirm your new password"
                    placeholderTextColor={colors.gray}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('confirm')}
                    style={styles.eyeIcon}
                  >
                    <Text style={[styles.inputIcon, { color: colors.gray }]}>
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Requirements */}
              <View style={[styles.requirementsContainer, { backgroundColor: colors.offWhite }]}>
                <Text style={[styles.requirementsTitle, { color: colors.navyBlue }]}>
                  Password Requirements:
                </Text>
                <View style={styles.requirement}>
                  <Text style={[styles.requirementIcon, {
                    color: newPassword.length >= 6 ? colors.teal : colors.gray
                  }]}>
                    {newPassword.length >= 6 ? '✅' : '⭕'}
                  </Text>
                  <Text style={[styles.requirementText, { color: colors.gray }]}>
                    At least 6 characters
                  </Text>
                </View>
                <View style={styles.requirement}>
                  <Text style={[styles.requirementIcon, {
                    color: /[A-Z]/.test(newPassword) ? colors.teal : colors.gray
                  }]}>
                    {/[A-Z]/.test(newPassword) ? '✅' : '⭕'}
                  </Text>
                  <Text style={[styles.requirementText, { color: colors.gray }]}>
                    Contains uppercase letter
                  </Text>
                </View>
                <View style={styles.requirement}>
                  <Text style={[styles.requirementIcon, {
                    color: /[0-9]/.test(newPassword) ? colors.teal : colors.gray
                  }]}>
                    {/[0-9]/.test(newPassword) ? '✅' : '⭕'}
                  </Text>
                  <Text style={[styles.requirementText, { color: colors.gray }]}>
                    Contains number
                  </Text>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
                  <Text style={[styles.errorIcon, { color: colors.error }]}>⚠️</Text>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              ) : null}

              {/* Success Message */}
              {success ? (
                <View style={[styles.successContainer, { backgroundColor: colors.teal + '10' }]}>
                  <Text style={[styles.successIcon, { color: colors.teal }]}>✅</Text>
                  <Text style={[styles.successText, { color: colors.teal }]}>Password updated successfully!</Text>
                </View>
              ) : null}

              {/* Change Password Button */}
              <View style={styles.buttonContainer}>
                <AnimatedButton
                  title="Update Password"
                  onPress={handleChangePassword}
                  loading={loading}
                  style={[styles.changeButton, { backgroundColor: colors.teal }]}
                />
              </View>

              {/* Cancel Link */}
              <View style={styles.cancelContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={[styles.cancelLink, { color: colors.gray }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#fafbfc',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  inputWithIcon: {
    marginLeft: 12,
  },
  inputIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  eyeIcon: {
    padding: 4,
  },
  passwordStrengthContainer: {
    marginBottom: 16,
    marginTop: -12,
  },
  strengthIndicator: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requirementsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  requirementText: {
    fontSize: 13,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  changeButton: {
    height: 56,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  cancelLink: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
})
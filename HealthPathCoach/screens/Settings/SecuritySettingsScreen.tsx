import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native"
import { X } from "react-native-feather"
import { SafeAreaView } from "react-native-safe-area-context"
import AnimatedButton from "../../components/AnimatedButton"
import Card from "../../components/Card"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useSecurity } from "../../context/SecurityContext"
import * as dataMigrationService from "../../services/dataMigrationService"
import * as encryptionService from "../../services/encryptionService"
import { ROUTES } from "../../utils/constants"

const SecuritySettingsScreen = () => {
  const router = useRouter();
  const { isSecurityEnabled, securityMethod } = useSecurity()

  const [encryptionEnabled, setEncryptionEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)

  useEffect(() => {
    checkEncryptionStatus()
  }, [])

  const checkEncryptionStatus = async () => {
    setIsLoading(true)
    const enabled = await encryptionService.isEncryptionEnabled()
    setEncryptionEnabled(enabled)

    const migrationStatus = await encryptionService.isMigrationComplete()
    setMigrationComplete(migrationStatus)
    setIsLoading(false)
  }

  const handleToggleEncryption = async (value: boolean) => {
    setIsLoading(true)

    try {
      if (value) {
        // Enable encryption
        const success = await encryptionService.enableEncryption()

        if (success) {
          setEncryptionEnabled(true)

          // Prompt for data migration
          if (!migrationComplete) {
            const migrationSuccess = await dataMigrationService.showMigrationPrompt()
            setMigrationComplete(migrationSuccess)
          }
        } else {
          Alert.alert("Error", "Failed to enable encryption. Please try again later.")
        }
      } else {
        // Confirm before disabling encryption
        Alert.alert(
          "Disable Encryption",
          "Disabling encryption will make your data less secure. Are you sure you want to continue?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Disable",
              style: "destructive",
              onPress: async () => {
                const success = await encryptionService.disableEncryption()

                if (success) {
                  setEncryptionEnabled(false)
                } else {
                  Alert.alert("Error", "Failed to disable encryption. Please try again later.")
                }

                setIsLoading(false)
              },
            },
          ],
        )

        // Return early as the Alert will handle the state update
        setIsLoading(false)
        return
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while updating encryption settings.")
    }

    setIsLoading(false)
  }

  const handleMigrateData = async () => {
    setIsLoading(true)

    try {
      const success = await dataMigrationService.migrateDataToEncrypted()

      if (success) {
        setMigrationComplete(true)
        Alert.alert("Success", "Your data has been successfully encrypted.")
      } else {
        Alert.alert("Error", "Failed to encrypt your data. Please try again later.")
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while encrypting your data.")
    }

    setIsLoading(false)
  }

  // Use theme colors

  const { colors } = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Security & Privacy"
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => router.push(ROUTES.MAIN.PROFILE.MAIN as any)}>
            <X stroke={colors.navyBlue} width={24} height={24} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: colors.background }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.navyBlue, marginBottom: 24, letterSpacing: 0.5 }}>
          Security & Privacy
        </Text>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>Processing...</Text>
          </View>
        ) : (
          <>
            <Card style={{ marginBottom: 20, borderRadius: 16, backgroundColor: colors.cardBackground, borderColor: colors.border }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.navyBlue, marginBottom: 10 }}>Biometric Authentication</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 16, color: colors.text, flex: 1 }}>Enable Biometric Lock</Text>
                <Switch
                  value={isSecurityEnabled && securityMethod === "biometric"}
                  onValueChange={async (value) => {
                    // Add enable/disable logic here if needed
                  }}
                  trackColor={{ false: colors.lightGray, true: colors.primary }}
                  thumbColor={isSecurityEnabled && securityMethod === "biometric" ? colors.primary : colors.gray}
                />
              </View>
            </Card>
            <Card style={{ marginBottom: 20, borderRadius: 16, backgroundColor: colors.cardBackground, borderColor: colors.border }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.navyBlue, marginBottom: 10 }}>Data Encryption</Text>
              <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 16, lineHeight: 22 }}>
                Encryption protects your sensitive health data by making it unreadable to anyone without the proper key.
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 16, color: colors.text, flex: 1 }}>Enable Encryption</Text>
                <Switch
                  value={encryptionEnabled}
                  onValueChange={handleToggleEncryption}
                  trackColor={{ false: colors.lightGray, true: colors.primary }}
                  thumbColor={encryptionEnabled ? colors.primary : colors.gray}
                />
              </View>
              {encryptionEnabled && !migrationComplete && (
                <View style={{ marginTop: 16, backgroundColor: colors.warningBackground || '#fff9c4', borderRadius: 10, padding: 14 }}>
                  <Text style={{ fontSize: 14, color: colors.warning || '#5d4037', marginBottom: 12 }}>
                    Your existing data needs to be encrypted. This process is secure and happens on your device.
                  </Text>
                  <AnimatedButton onPress={handleMigrateData} style={{ marginTop: 4 }} title="Encrypt My Data Now" />
                </View>
              )}
              {encryptionEnabled && migrationComplete && (
                <Text style={{ fontSize: 14, color: colors.success || '#2e7d32', marginTop: 12 }}>
                  Your health data is encrypted and secure.
                </Text>
              )}
            </Card>
            <Card style={{ marginBottom: 32, borderRadius: 16, backgroundColor: colors.cardBackground, borderColor: colors.border }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.navyBlue, marginBottom: 10 }}>Security Information</Text>
              <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>{`• Biometric authentication uses your device's built-in security features`}</Text>
                <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>• Data encryption secures your information even if your device is compromised</Text>
                <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>• Your encryption keys never leave your device</Text>
                <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>• For maximum security, enable both biometric authentication and encryption</Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default SecuritySettingsScreen

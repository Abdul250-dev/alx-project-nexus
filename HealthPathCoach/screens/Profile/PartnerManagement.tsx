import { useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Heart, Link, Share2, Shield, Users, X } from "react-native-feather"
import AnimatedButton from "../../components/AnimatedButton"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"
import * as userService from "../../services/userService"

export default function PartnerManagement() {
  const { colors } = useTheme()
  const { userData, updateUser, refreshUserData } = useUser()
  const navigation = useNavigation()

  const [partnerCode, setPartnerCode] = useState("")
  const [hasPartner, setHasPartner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMale, setIsMale] = useState(false)

  useEffect(() => {
    if (userData) {
      if (userData.partnerId && typeof userData.partnerId === 'string') {
        setHasPartner(true)
      } else {
        setHasPartner(false)
      }

      if (userData.gender === 'male' || userData.gender === 'Male') {
        setIsMale(true)
      }
    }
  }, [userData])

  // Poll for partnerId changes every 1 second (was 5 seconds)
  useEffect(() => {
    if (!userData || userData.partnerId) return;
    const interval = setInterval(async () => {
      const profile = await userService.getUserProfile(userData.id);
      if (profile && profile.partnerId) {
        updateUser({ partnerId: profile.partnerId });
        setHasPartner(true);
      }
    }, 1000); // 1 second interval
    return () => clearInterval(interval);
  }, [userData, updateUser]);

  if (!userData) return null

  const handleClose = () => {
    navigation.goBack()
  }

  const handleCreateCode = async () => {
    if (!userData) {
      Alert.alert("Error", "User data not available")
      return
    }
    if (userData.partnerId) {
      Alert.alert("Error", "You are already linked to a partner. Cannot generate a new partner code.")
      return
    }
    setLoading(true)
    try {
      const code = await userService.createPartnerCode(userData.id)
      await updateUser({ partnerCode: code })
      await refreshUserData()
      Alert.alert("Success", `Your partner code is: ${code}. Share this with your partner.`)
    } catch (error) {
      console.error("Error creating partner code:", error)
      Alert.alert("Error", error.message || "Failed to create partner code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinPartner = async () => {
    if (!userData) {
      Alert.alert("Error", "User data not available")
      return
    }

    if (!partnerCode.trim()) {
      Alert.alert("Error", "Please enter a partner code")
      return
    }

    setLoading(true)

    try {
      const partnerId = await userService.joinPartner(userData.id, partnerCode)
      await updateUser({ partnerId: partnerId })
      setHasPartner(true)
      setPartnerCode("")
      await refreshUserData()
      Alert.alert("Success", "You have successfully connected with your partner.")
    } catch (error) {
      console.error("Error joining partner:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to join partner. Please check the code and try again."
      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleStopSharing = async () => {
    Alert.alert("Stop Sharing", "Are you sure you want to stop sharing data with your partner?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Stop Sharing",
        style: "destructive",
        onPress: async () => {
          setLoading(true)

          try {
            await userService.disconnectFromPartner(userData.id)
            await updateUser({ partnerId: null, partnerCode: null })
            setHasPartner(false)
            await refreshUserData()
            Alert.alert("Success", "You have stopped sharing data with your partner.")
          } catch (error) {
            console.error("Error stopping sharing:", error)
            Alert.alert("Error", "Failed to stop sharing. Please try again.")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const renderPartnerView = () => {
    if (hasPartner) {
      return (
        <View style={styles.mainContainer}>
          {/* Connection Status Card */}
          <View style={[styles.statusCard, { backgroundColor: colors.white, shadowColor: colors.navyBlue }]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: colors.lightBlue }]}>
                <Link stroke={colors.navyBlue} width={24} height={24} />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusTitle, { color: colors.navyBlue }]}>Connected</Text>
                <Text style={[styles.statusSubtitle, { color: colors.gray }]}>Sharing data with your partner</Text>
              </View>
            </View>
          </View>

          {/* Partner Sharing Card */}
          <View style={[styles.partnerCard, { backgroundColor: colors.white, shadowColor: colors.navyBlue }]}>
            <View style={styles.cardHeader}>
              <Heart stroke={colors.navyBlue} width={24} height={24} fill={colors.lightBlue} />
              <Text style={[styles.cardTitle, { color: colors.navyBlue }]}>Partner Sharing</Text>
            </View>

            <View style={styles.sharingVisualization}>
              <View style={[styles.sharingIcon, { backgroundColor: colors.lightBlue }]}>
                <Image source={require("../../assets/images/user-icon.png")} style={styles.iconImage} />
              </View>
              <View style={styles.connectionLine}>
                <View style={[styles.connectionDot, { backgroundColor: colors.navyBlue }]} />
                <View style={[styles.connectionDot, { backgroundColor: colors.navyBlue }]} />
                <View style={[styles.connectionDot, { backgroundColor: colors.navyBlue }]} />
              </View>
              <View style={[styles.sharingIcon, { backgroundColor: colors.lightGray }]}>
                <Image source={require("../../assets/images/partner-icon.png")} style={styles.iconImage} />
              </View>
            </View>

            <Text style={[styles.sharingDescription, { color: colors.gray }]}>
              Your body. Your data. Your choice.
            </Text>

            <AnimatedButton
              title="Stop sharing"
              onPress={handleStopSharing}
              loading={loading}
              variant="outline"
              style={[styles.stopButton, { borderColor: colors.error }]}
            />
          </View>

          {/* Preview Section */}
          <View style={[styles.previewSection, { backgroundColor: colors.white, shadowColor: colors.navyBlue }]}>
            <View style={styles.previewHeader}>
              <Share2 stroke={colors.navyBlue} width={20} height={20} />
              <Text style={[styles.previewTitle, { color: colors.navyBlue }]}>Sharing is Caring</Text>
            </View>
            <View style={styles.previewContainer}>
              <Image
                source={require("../../assets/images/partner-preview.png")}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.mainContainer}>
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: colors.white, shadowColor: colors.navyBlue }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: colors.lightBlue }]}>
              <Users stroke={colors.navyBlue} width={28} height={28} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.navyBlue }]}>Partner Sharing</Text>
              <Text style={[styles.headerSubtitle, { color: colors.gray }]}>
                Connect with your trusted partner to share cycle information and receive helpful insights together.
              </Text>
            </View>
          </View>
        </View>

        {/* Options Container */}
        <View style={styles.optionsContainer}>
          {/* Create Partner Code - Only for females */}
          {!isMale && !hasPartner && (
            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: colors.white, borderColor: colors.lightBlue }]}
              onPress={handleCreateCode}
              disabled={loading}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.optionIcon, { backgroundColor: colors.lightBlue }]}>
                  <Shield stroke={colors.navyBlue} width={22} height={22} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.navyBlue }]}>Create Partner Code</Text>
                  <Text style={[styles.optionDescription, { color: colors.gray }]}>
                    Generate a secure code to share with your partner
                  </Text>
                </View>
              </View>
              <View style={[styles.optionArrow, { backgroundColor: colors.offWhite }]}>
                <Text style={[styles.arrowText, { color: colors.navyBlue }]}>→</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Male Advice Card */}
          {isMale && (
            <View style={[styles.adviceCard, { backgroundColor: colors.lightBlue, borderColor: colors.lightBlue }]}>
              <View style={styles.adviceHeader}>
                <Text style={styles.adviceEmoji}>💡</Text>
                <Text style={[styles.adviceTitle, { color: colors.navyBlue }]}>Partner Connection</Text>
              </View>
              <Text style={[styles.adviceText, { color: colors.gray }]}>
                Ask your partner to create a partner code from their account and share it with you to connect.
              </Text>
            </View>
          )}

          {/* Join with Partner Code - Only for males */}
          {isMale && (
            <View style={[styles.joinCard, { backgroundColor: colors.white, borderColor: colors.lightGray }]}>
              <View style={styles.joinHeader}>
                <View style={[styles.joinIcon, { backgroundColor: colors.lightBlue }]}>
                  <Link stroke={colors.navyBlue} width={22} height={22} />
                </View>
                <Text style={[styles.joinTitle, { color: colors.navyBlue }]}>Join with Partner Code</Text>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.codeInput, {
                    backgroundColor: colors.offWhite,
                    color: colors.black,
                    borderColor: partnerCode ? colors.lightBlue : colors.lightGray
                  }]}
                  placeholder="Enter partner code"
                  placeholderTextColor={colors.gray}
                  value={partnerCode}
                  onChangeText={setPartnerCode}
                  editable={!loading}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>

              <AnimatedButton
                title="Connect with Partner"
                onPress={handleJoinPartner}
                loading={loading}
                disabled={!partnerCode.trim() || loading}
                style={styles.connectButton}
              />
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <Header
        title="Partner Management"
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
        {renderPartnerView()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  mainContainer: {
    gap: 16,
  },

  // Header Section Styles
  headerSection: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Status Card Styles (for connected state)
  statusCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
  },

  // Partner Card Styles
  partnerCard: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sharingVisualization: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sharingIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  sharingDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  stopButton: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 160,
  },

  // Preview Section Styles
  previewSection: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewContainer: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
  },
  previewImage: {
    width: 200,
    height: 140,
    resizeMode: 'contain',
  },

  // Options Container Styles
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Advice Card Styles
  adviceCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  adviceEmoji: {
    fontSize: 24,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  adviceText: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Join Card Styles
  joinCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  joinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  joinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  codeInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 54,
  },
  connectButton: {
    borderRadius: 12,
    minHeight: 54,
  },
})
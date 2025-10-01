import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import {
  Bell,
  Clipboard,
  FileText,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
  X,
} from "react-native-feather"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useAuth } from "../../context/AuthContext"
import { useUser } from "../../context/UserContext"
import { t } from "../../services/localizationService"
import { ROUTES } from "../../utils/constants"

export default function ProfileScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const { colors } = useTheme()
  const { logout } = useAuth()
  const { userData } = useUser()

  const handleLogout = () => {
    Alert.alert(t("profile.logout_confirm"), "", [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.yes"),
        onPress: logout,
      },
    ])
  }

  const menuItems = [
    {
      id: "account",
      title: t("profile.account_settings"),
      icon: <User stroke={colors.teal} width={24} height={24} />,
      onPress: () => router.push(ROUTES.MAIN.SETTINGS.ACCOUNT_SETTINGS as any),
    },
    {
      id: "medical",
      title: t("profile.medical_assessment"),
      icon: <Clipboard stroke={colors.teal} width={24} height={24} />,
      onPress: () => router.push(ROUTES.MAIN.PROFILE.MEDICAL_ASSESSMENT as any),
    },
    {
      id: "partner",
      title: t("profile.partner_management"),
      icon: <Users stroke={colors.teal} width={24} height={24} />,
      onPress: () => router.push(ROUTES.MAIN.PROFILE.PARTNER as any)
    },
    {
      id: "notifications",
      title: t("profile.notification_settings"),
      icon: <Bell stroke={colors.teal} width={24} height={24} />,
      onPress: () => router.push(ROUTES.MAIN.SETTINGS.NOTIFICATIONS as any),
    },
    {
      id: "language",
      title: t("profile.language_settings"),
      icon: <Globe stroke={colors.teal} width={24} height={24} />,
      onPress: () => router.push(ROUTES.MAIN.SETTINGS.LANGUAGE as any),
    },
    {
      id: "security",
      title: t("profile.security_settings"),
      icon: <Shield stroke={colors.teal} width={24} height={24} />,
      onPress: () => router.push(ROUTES.MAIN.SETTINGS.SECURITY as any),
    },
    {
      id: "help",
      title: t("profile.help_support"),
      icon: <HelpCircle stroke={colors.teal} width={24} height={24} />,
      onPress: () => navigation.navigate("HelpSupport" as never),
    },
    {
      id: "about",
      title: t("profile.about"),
      icon: <Info stroke={colors.teal} width={24} height={24} />,
      onPress: () => navigation.navigate("About" as never),
    },
    {
      id: "terms",
      title: t("profile.terms_privacy"),
      icon: <FileText stroke={colors.teal} width={24} height={24} />,
      onPress: () => navigation.navigate("TermsPrivacy" as never),
    },
  ]

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header
        title={t("common.profile")}
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X stroke={colors.navyBlue} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileCard, { backgroundColor: colors.white }]}>
          <Image source={require("../../assets/images/user-icon.png")} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.navyBlue }]}>{userData?.displayName ?? "User"}</Text>
            <Text style={[styles.profileEmail, { color: colors.gray }]}>{userData?.email ?? "user@example.com"}</Text>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.teal }]}
            onPress={() => router.push(ROUTES.MAIN.SETTINGS.ACCOUNT_SETTINGS as any)}
          >
            <Settings stroke={colors.white} width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.white }]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>{item.icon}</View>
              <Text style={[styles.menuTitle, { color: colors.navyBlue }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
            <LogOut stroke={colors.white} width={20} height={20} />
            <Text style={[styles.logoutText, { color: colors.white }]}>{t("profile.logout")}</Text>
          </TouchableOpacity>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 40,
    alignItems: "center",
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})

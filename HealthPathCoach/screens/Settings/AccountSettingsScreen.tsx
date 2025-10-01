import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ChevronRight, Lock, User, X } from "react-native-feather"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"
import { t } from "../../services/localizationService"
import { ROUTES } from "../../utils/constants"

export default function AccountSettingsScreen() {
    const navigation = useNavigation()
    const router = useRouter()
    const { colors } = useTheme()
    const { userData } = useUser()

    const handleChangePassword = () => {
        // Navigate to change password screen
        router.push("/main/settings/change-password")
    }

    const handlePersonalInfo = () => {
        // Navigate to personal info screen (can be implemented later)
        Alert.alert("Coming Soon", "Personal information editing will be available soon!")
    }

    const handleDeleteAccount = () => {
        Alert.alert(
            t("profile.delete_account"),
            t("profile.delete_account_confirm"),
            [
                {
                    text: t("common.cancel"),
                    style: "cancel",
                },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: () => {
                        // Handle account deletion
                        Alert.alert("Account Deletion", "Account deletion functionality will be implemented soon.")
                    },
                },
            ]
        )
    }

    const menuItems = [
        {
            id: "personal-info",
            title: t("profile.personal_info"),
            subtitle: "Update your personal information",
            icon: <User stroke={colors.teal} width={24} height={24} />,
            onPress: handlePersonalInfo,
        },
        {
            id: "change-password",
            title: "Change Password",
            subtitle: "Update your account password",
            icon: <Lock stroke={colors.teal} width={24} height={24} />,
            onPress: handleChangePassword,
        },
    ]

    return (
        <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
            <Header
                title={t("profile.account_settings")}
                showBackButton
                rightComponent={
                    <TouchableOpacity onPress={() => router.push(ROUTES.MAIN.PROFILE.MAIN as any)}>
                        <X stroke={colors.navyBlue} width={24} height={24} />
                    </TouchableOpacity>
                }
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* User Info Card */}
                <View style={[styles.userCard, { backgroundColor: colors.white }]}>
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: colors.navyBlue }]}>
                            {userData?.displayName || "User"}
                        </Text>
                        <Text style={[styles.userEmail, { color: colors.gray }]}>
                            {userData?.email || "user@example.com"}
                        </Text>
                    </View>
                </View>

                {/* Settings Menu */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: colors.white }]}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuIconContainer}>
                                {item.icon}
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={[styles.menuTitle, { color: colors.navyBlue }]}>{item.title}</Text>
                                <Text style={[styles.menuSubtitle, { color: colors.gray }]}>{item.subtitle}</Text>
                            </View>
                            <ChevronRight stroke={colors.gray} width={20} height={20} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Danger Zone */}
                <View style={styles.dangerZone}>
                    <Text style={[styles.dangerTitle, { color: colors.error }]}>Danger Zone</Text>
                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: colors.error }]}
                        onPress={handleDeleteAccount}
                    >
                        <Text style={[styles.deleteButtonText, { color: colors.white }]}>
                            {t("profile.delete_account")}
                        </Text>
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
        paddingBottom: 32,
    },
    userCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    userInfo: {
        alignItems: "center",
    },
    userName: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    menuContainer: {
        marginBottom: 32,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    menuIconContainer: {
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 14,
    },
    dangerZone: {
        marginTop: 16,
    },
    dangerTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    deleteButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
}) 
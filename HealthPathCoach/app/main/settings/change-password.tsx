import { View } from "react-native"
import ChangePasswordScreen from "../../../screens/Settings/changePassword"

export default function ChangePassword() {
    return (
        <View style={{ flex: 1 }}>
            <ChangePasswordScreen onPasswordChangeSuccess={() => { }} />
        </View>
    )
} 
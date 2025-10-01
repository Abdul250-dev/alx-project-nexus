import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import LoginScreen from "../../screens/Auth/LoginScreen";

export default function Login() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.replace("/main/dashboard");
  };

  return (
    <View style={{ flex: 1 }}>
      <LoginScreen onLoginSuccess={handleLoginSuccess} />
    </View>
  );
  
}


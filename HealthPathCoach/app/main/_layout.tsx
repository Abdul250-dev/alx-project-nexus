"use client"

import { Redirect, Tabs } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { Activity, BookOpen, Home, MessageCircle, User } from "react-native-feather"
import { useTheme } from "../../components/theme-provider"
import { useAuth } from "../../context/AuthContext"

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const { colors } = useTheme()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="../auth/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home stroke={color} width={size} height={size} />,
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          tabBarIcon: ({ color, size }) => <Activity stroke={color} width={size} height={size} />,
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Education",
          tabBarIcon: ({ color, size }) => <BookOpen stroke={color} width={size} height={size} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => <MessageCircle stroke={color} width={size} height={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User stroke={color} width={size} height={size} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  )
}

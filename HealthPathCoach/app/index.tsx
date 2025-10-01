"use client"

import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import SplashScreen from "../components/SplashScreen"
import { useAuth } from "../context/AuthContext"

export default function Index() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [splashFinished, setSplashFinished] = useState(false)

  useEffect(() => {
    if (!isLoading && splashFinished) {
      if (isAuthenticated) {
        router.replace("/main/dashboard")
      } else {
        router.replace("/auth/login")
      }
    }
  }, [isAuthenticated, isLoading, splashFinished])

  const handleSplashFinish = () => {
    setSplashFinished(true)
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} isLoading={isLoading} />
  }

  return null
}

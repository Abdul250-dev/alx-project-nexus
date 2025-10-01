import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { X } from 'react-native-feather'
import Header from '../../components/Header'
import { useTheme } from '../../components/theme-provider'
import { useUser } from '../../context/UserContext'
import { t } from '../../services/localizationService'
import { getActivityHistory, logActivity } from '../../services/trackerService'
// --- Sensor imports ---
import * as Location from 'expo-location'
import { Pedometer } from 'expo-sensors'

// Define session type
interface Session {
  type: 'cycling' | 'running'
  date: string
  distance: number
  duration: number
}

export default function ActivitiesTracker() {
  const { colors } = useTheme()
  const router = useRouter()
  const { userData } = useUser()

  // --- Step Counter State ---
  const [stepCount, setStepCount] = useState(0)
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking')
  const dailyGoal = 10000 // You can make this user-configurable
  const [stepInfoMsg, setStepInfoMsg] = useState<string | null>(null)

  // --- Cycling/Running State ---
  const [activityType, setActivityType] = useState<'cycling' | 'running' | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [locations, setLocations] = useState<Location.LocationObject[]>([])
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const watchId = useRef<Location.LocationSubscription | null>(null)
  const timer = useRef<any>(null)
  const pedometerSubscription = useRef<any>(null)
  // --- Goal Setting State ---
  const [goalType, setGoalType] = useState<'distance' | 'duration'>('distance')
  const [goalValue, setGoalValue] = useState<number>(2) // default 2km or 20min
  const [goalInput, setGoalInput] = useState<string>('2')
  const [showGoalInput, setShowGoalInput] = useState(false)

  // Load existing activity data on mount
  useEffect(() => {
    const loadActivityData = async () => {
      if (!userData?.id) return;

      try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Load cycling and running sessions
        const cyclingActivities = await getActivityHistory(userData.id, startOfDay, endOfDay, 'cycling');
        const runningActivities = await getActivityHistory(userData.id, startOfDay, endOfDay, 'running');

        const sessions: Session[] = [
          ...cyclingActivities.map(activity => ({
            type: 'cycling' as const,
            date: activity.date,
            distance: activity.distance || 0,
            duration: activity.duration || 0
          })),
          ...runningActivities.map(activity => ({
            type: 'running' as const,
            date: activity.date,
            distance: activity.distance || 0,
            duration: activity.duration || 0
          }))
        ];

        setRecentSessions(sessions);
      } catch (error) {
        console.error('Error loading activity data:', error);
      }
    };

    loadActivityData();
  }, [userData?.id]);

  // --- Step Counter Effect ---
  useEffect(() => {
    let pedometerSubscription: any = null
    let lastStepCount = 0
    Pedometer.isAvailableAsync().then(
      (result) => setIsPedometerAvailable(result ? 'yes' : 'no'),
      () => setIsPedometerAvailable('no')
    )
    const subscribe = async () => {
      if (Platform.OS === 'android') {
        setStepInfoMsg('Step count since opening this page (Android limitation)')
        pedometerSubscription = Pedometer.watchStepCount((result) => {
          // Throttle: only update every 10 steps
          if (result.steps - lastStepCount >= 10) {
            setStepCount((prev) => prev + (result.steps - lastStepCount))
            lastStepCount = result.steps
          }
        })
      } else {
        const end = new Date()
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        try {
          const stepsToday = await Pedometer.getStepCountAsync(start, end)
          setStepCount(stepsToday.steps)
        } catch (e) {
          setStepInfoMsg('Unable to get today\'s step count')
        }
        pedometerSubscription = Pedometer.watchStepCount((result) => {
          // Throttle: only update every 10 steps
          if (result.steps - lastStepCount >= 10) {
            setStepCount((prev) => prev + (result.steps - lastStepCount))
            lastStepCount = result.steps
          }
        })
      }
    }
    subscribe()
    return () => {
      pedometerSubscription && pedometerSubscription.remove()
    }
  }, [])

  // Save steps to Firebase periodically
  useEffect(() => {
    if (stepCount > 0 && userData?.id) {
      const saveSteps = async () => {
        const sessionId = Math.random().toString(36).substr(2, 9);
        console.log(`[ActivitiesTracker] 🚀 Starting steps save [Session: ${sessionId}]`);
        console.log(`[ActivitiesTracker] 👟 Steps data:`, {
          userId: userData.id,
          steps: stepCount,
          goal: dailyGoal,
          goalType: 'steps'
        });

        const startTime = Date.now();
        try {
          const result = await logActivity(userData.id, new Date(), 'steps', {
            steps: stepCount,
            goal: dailyGoal,
            goalType: 'steps'
          });
          const duration = Date.now() - startTime;

          console.log(`[ActivitiesTracker] ✅ Steps saved to Firebase [Session: ${sessionId}] [Duration: ${duration}ms]`);
          console.log(`[ActivitiesTracker] 📡 Steps save result:`, result);
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[ActivitiesTracker] ❌ Error saving steps [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
          console.error(`[ActivitiesTracker] ❌ Steps error details:`, {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            stepsData: {
              steps: stepCount,
              goal: dailyGoal,
              goalType: 'steps'
            }
          });
        }
      };

      // Save every 100 steps
      if (stepCount % 100 === 0) {
        saveSteps();
      }
    }
  }, [stepCount, userData?.id]);

  // --- Activity Tracking (Cycling/Running) ---
  useEffect(() => {
    if (isTracking) {
      setDistance(0)
      setDuration(0)
      setLocations([])
      setStartTime(Date.now())
      const startLocationTracking = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert(
              t('common.error'),
              t('tracker.location_permission_denied', 'Location permission denied.')
            )
            setIsTracking(false)
            return
          }
          watchId.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 1000,
              distanceInterval: 1
            },
            (loc) => {
              setLocations((prev) => {
                const newArr = [...prev, loc]
                if (newArr.length > 500) return newArr.slice(newArr.length - 500)

                // Calculate current total distance in real-time
                if (newArr.length > 1) {
                  let total = 0
                  for (let i = 1; i < newArr.length; i++) {
                    const prev = newArr[i - 1].coords
                    const curr = newArr[i].coords
                    total += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
                  }
                  setDistance(total)
                }

                return newArr
              })
            }
          )
          timer.current = setInterval(() => {
            setDuration((d) => d + 1)
          }, 1000)
        } catch (error) {
          console.warn('Location tracking error:', error)
          Alert.alert(
            t('common.error'),
            'Failed to start location tracking'
          )
          setIsTracking(false)
        }
      }
      startLocationTracking()
    } else {
      if (watchId.current) {
        watchId.current.remove()
        watchId.current = null
      }
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }
      if (locations.length > 1 && activityType && duration > 0) {
        let total = 0
        for (let i = 1; i < locations.length; i++) {
          const prev = locations[i - 1].coords
          const curr = locations[i].coords
          total += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
        }
        const finalDistance = total
        setDistance(finalDistance)

        // Save activity to Firebase
        if (userData?.id) {
          const sessionId = Math.random().toString(36).substr(2, 9);
          console.log(`[ActivitiesTracker] 🚀 Starting activity save [Session: ${sessionId}]`);
          console.log(`[ActivitiesTracker] 📊 Activity data:`, {
            userId: userData.id,
            type: activityType,
            distance: finalDistance,
            duration: duration,
            goal: goalValue,
            goalType: goalType,
            locations: locations.length
          });

          const startTime = Date.now();
          logActivity(userData.id, new Date(), activityType, {
            distance: finalDistance,
            duration: duration,
            goal: goalValue,
            goalType: goalType
          }).then((result) => {
            const duration = Date.now() - startTime;
            console.log(`[ActivitiesTracker] ✅ Activity saved to Firebase [Session: ${sessionId}] [Duration: ${duration}ms]`);
            console.log(`[ActivitiesTracker] 📡 Save result:`, result);
          }).catch((error) => {
            const duration = Date.now() - startTime;
            console.error(`[ActivitiesTracker] ❌ Error saving activity [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
            console.error(`[ActivitiesTracker] ❌ Error details:`, {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              activityData: {
                type: activityType,
                distance: finalDistance,
                duration: duration,
                goal: goalValue,
                goalType: goalType
              }
            });
          });
        }

        const newSession: Session = {
          type: activityType,
          date: new Date().toLocaleString(),
          distance: finalDistance,
          duration: duration
        }
        setRecentSessions((prev) => [newSession, ...prev.slice(0, 9)]) // Only keep last 10
      }
      setActivityType(null)
      setLocations([])
      setDuration(0)
      setStartTime(null)
    }
  }, [isTracking, locations.length, activityType, duration, userData?.id, goalValue, goalType])

  // Haversine formula for calculating distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000 // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  // --- UI Handlers ---
  const startActivity = (type: 'cycling' | 'running') => {
    setActivityType(type)
    setIsTracking(true)
  }

  const stopActivity = () => {
    setIsTracking(false)
  }

  // --- Render ---
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('tracker.activities_tracker', 'Activities Tracker')}
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <X stroke={colors.text} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 32 }}
      >
        {/* Steps Section */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <FontAwesome5 name="walking" size={40} color={colors.teal} style={{ marginBottom: 10 }} />
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20 }}>
            {t('tracker.daily_steps', 'Daily Steps')}
          </Text>

          {isPedometerAvailable === 'checking' ? (
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginVertical: 8 }}>
              Checking pedometer...
            </Text>
          ) : isPedometerAvailable === 'no' ? (
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginVertical: 8 }}>
              Pedometer not available
            </Text>
          ) : (
            <>
              <Text style={{ color: colors.teal, fontSize: 36, fontWeight: 'bold', marginVertical: 8 }}>
                {stepCount.toLocaleString()}
              </Text>
              <View style={{
                width: '100%',
                height: 10,
                backgroundColor: colors.border,
                borderRadius: 5,
                marginBottom: 8
              }}>
                <View style={{
                  width: `${Math.min(100, (stepCount / dailyGoal) * 100)}%`,
                  height: 10,
                  backgroundColor: colors.teal,
                  borderRadius: 5
                }} />
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                {t('tracker.goal', 'Goal')}: {dailyGoal.toLocaleString()} {t('tracker.steps', 'steps')}
              </Text>
              {stepInfoMsg && (
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' }}>{stepInfoMsg}</Text>
              )}
            </>
          )}
        </View>

        {/* Cycling/Running Section */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>
            {t('tracker.activities', 'Activities')}
          </Text>
          {/* Goal Setting UI */}
          <View style={{ width: '100%', marginBottom: 16 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 4 }}>
              {t('tracker.set_goal', 'Set your activity goal:')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: goalType === 'distance' ? colors.teal : colors.border,
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  marginRight: 8,
                }}
                onPress={() => {
                  setGoalType('distance')
                  // Reset goal value to default distance goal when switching
                  if (goalValue > 50) { // If current value looks like a duration goal (minutes)
                    setGoalValue(5) // Default to 5 km
                    setGoalInput('5')
                  }
                }}
                disabled={isTracking}
              >
                <Text style={{ color: goalType === 'distance' ? colors.white : colors.text }}>{t('tracker.distance', 'Distance')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: goalType === 'duration' ? colors.teal : colors.border,
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                }}
                onPress={() => {
                  setGoalType('duration')
                  // Reset goal value to default duration goal when switching
                  if (goalValue <= 50) { // If current value looks like a distance goal (km)
                    setGoalValue(30) // Default to 30 minutes
                    setGoalInput('30')
                  }
                }}
                disabled={isTracking}
              >
                <Text style={{ color: goalType === 'duration' ? colors.white : colors.text }}>{t('tracker.duration', 'Duration')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginLeft: 12 }}
                onPress={() => setShowGoalInput(true)}
                disabled={isTracking}
              >
                <Text style={{ color: colors.teal, textDecorationLine: 'underline' }}>{t('tracker.edit', 'Edit')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {t('tracker.goal', 'Goal')}: {goalType === 'distance' ? `${goalValue} km` : goalType === 'duration' ? formatDuration(goalValue * 60) : `${goalValue} min`}
            </Text>
            {/* Goal Input Modal */}
            {showGoalInput && !isTracking && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: colors.text, marginRight: 6 }}>{t('tracker.enter_goal', 'Enter goal:')}</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginRight: 6,
                    color: colors.text,
                    backgroundColor: colors.background,
                    minWidth: 60,
                    textAlign: 'center'
                  }}
                  value={goalInput}
                  onChangeText={setGoalInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity
                  onPress={() => {
                    const val = parseFloat(goalInput)
                    if (!isNaN(val) && val > 0) {
                      setGoalValue(val)
                      setShowGoalInput(false)
                    }
                  }}
                  style={{ backgroundColor: colors.teal, borderRadius: 6, padding: 6, marginRight: 4 }}
                >
                  <Text style={{ color: colors.white }}>{t('tracker.save', 'Save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowGoalInput(false)}>
                  <Text style={{ color: colors.textSecondary }}>{t('tracker.cancel', 'Cancel')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Progress Display */}
          {isTracking && (
            <View style={{ width: '100%', marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                {t('tracker.progress', 'Progress')}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.textSecondary }}>
                  {t('tracker.distance', 'Distance')}: {Math.round(distance / 10) / 100} km
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {t('tracker.duration', 'Duration')}: {formatDuration(duration)}
                </Text>
              </View>
              {/* Progress Bar */}
              <View style={{
                width: '100%',
                height: 8,
                backgroundColor: colors.border,
                borderRadius: 4,
                marginBottom: 8
              }}>
                <View style={{
                  width: `${Math.min(100, goalType === 'distance' ? (distance / 1000 / goalValue) * 100 : (duration / 60 / goalValue) * 100)}%`,
                  height: 8,
                  backgroundColor: colors.teal,
                  borderRadius: 4
                }} />
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
                {goalType === 'distance'
                  ? `${Math.round((distance / 1000 / goalValue) * 100)}% of ${goalValue} km goal`
                  : `${Math.round((duration / 60 / goalValue) * 100)}% of ${goalValue} ${t('tracker.minutes', 'min')} goal`
                }
              </Text>
            </View>
          )}

          {/* Activity Buttons */}
          {!isTracking ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
              <TouchableOpacity
                style={[styles.activityButton, { backgroundColor: colors.teal }]}
                onPress={() => startActivity('cycling')}
              >
                <MaterialCommunityIcons name="bike" size={24} color={colors.white} />
                <Text style={{ color: colors.white, fontWeight: 'bold', marginTop: 4 }}>
                  {t('tracker.start_cycling', 'Start Cycling')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.activityButton, { backgroundColor: colors.navyBlue }]}
                onPress={() => startActivity('running')}
              >
                <FontAwesome5 name="running" size={24} color={colors.white} />
                <Text style={{ color: colors.white, fontWeight: 'bold', marginTop: 4 }}>
                  {t('tracker.start_running', 'Start Running')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: colors.red }]}
              onPress={stopActivity}
            >
              <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 18 }}>
                {t('tracker.stop', 'Stop')} {activityType === 'cycling' ? t('tracker.cycling', 'Cycling') : t('tracker.running', 'Running')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Sessions */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>
            {t('tracker.recent_sessions', 'Recent Sessions')}
          </Text>
          {recentSessions.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              {t('tracker.no_sessions', 'No recent activities yet.')}
            </Text>
          ) : (
            recentSessions.slice(0, 5).map((session, index) => (
              <View key={index} style={styles.sessionItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <MaterialCommunityIcons
                    name={session.type === 'cycling' ? 'bike' : 'run'}
                    size={20}
                    color={session.type === 'cycling' ? colors.teal : colors.navyBlue}
                  />
                  <Text style={{ color: colors.text, fontWeight: 'bold', marginLeft: 8 }}>
                    {session.type === 'cycling' ? t('tracker.cycling', 'Cycling') : t('tracker.running', 'Running')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textSecondary }}>
                    {t('tracker.distance', 'Distance')}: {Math.round(session.distance / 10) / 100} km
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {t('tracker.duration', 'Duration')}: {formatDuration(session.duration)}
                  </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {session.date}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  stopButton: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  sessionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
})
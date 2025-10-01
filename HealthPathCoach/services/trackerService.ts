// trackerService.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  runTransaction,
  where,
  type DocumentData,
} from "firebase/firestore"

// ========================================
// INTERFACES & TYPES
// ========================================

export interface TrackerEntry {
  id: string
  createdAt: string
}

export interface PeriodEntry extends TrackerEntry {
  startDate: string
  endDate?: string
  symptoms: string[]
}

export interface MoodEntry extends TrackerEntry {
  date: string
  mood: string
  notes: string
}

export interface SleepEntry extends TrackerEntry {
  date: string
  hours: number
  quality: SleepQuality
  qualityScore: number
  bedTime: string
  wakeTime: string
}

export interface NutritionEntry extends TrackerEntry {
  date: string
  meals: Meal[]
  water: number
  notes: string
}

export interface ActivityEntry extends TrackerEntry {
  date: string
  type: 'cycling' | 'running' | 'steps'
  distance?: number // in meters for cycling/running, steps for steps
  duration?: number // in seconds
  steps?: number // for step tracking
  goal?: number
  goalType?: 'distance' | 'duration' | 'steps'
}

export interface Meal {
  name: string
  calories?: number
  time?: string
}

export interface FertileWindow {
  ovulationDate: string
  fertileWindowStart: string
  fertileWindowEnd: string
  fertileStart: string
  fertileEnd: string
  nextPeriodStart?: string
  cycleLength: number
  periodLength: number
}

export interface ApiResponse {
  success: boolean
  message: string
  data?: any
}

export interface DayData {
  date: string
  period?: {
    isStart: boolean
    isEnd?: boolean
    flow?: "light" | "medium" | "heavy" | "spotting"
    symptoms?: string[]
  }
  mood?: string
  sleep?: {
    hours: number
    quality: SleepQuality
    bedTime: string
    wakeTime: string
  }
  nutrition?: {
    meals: Meal[]
    water: number
    notes?: string
  }
  notes?: string
  sexualActivity?: boolean
  userId?: string
  createdAt?: Date
}

export type SleepQuality = "poor" | "fair" | "good" | "excellent"
export type TrackerType = "period" | "mood" | "sleep" | "nutrition" | "activity"

// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

const COLLECTION_MAP: Record<TrackerType, string> = {
  period: "tracker_periods",
  mood: "tracker_moods",
  sleep: "tracker_sleep",
  nutrition: "tracker_nutrition",
  activity: "tracker_activities",
}

const QUALITY_MAP: Record<SleepQuality, number> = {
  poor: 1,
  fair: 2,
  good: 3,
  excellent: 4,
}

const QUALITY_REVERSE_MAP: Record<number, SleepQuality> = {
  1: "poor",
  2: "fair",
  3: "good",
  4: "excellent",
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MIN_CYCLE_GAP_DAYS = 7
const DEFAULT_CYCLE_LENGTH = 28
const DEFAULT_PERIOD_LENGTH = 5
const DEFAULT_FERTILE_WINDOW_DAYS = 8 // 5 days before + 3 days after ovulation

// ========================================
// CACHE MANAGEMENT
// ========================================

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry || Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }

  private generateKey(userId: string, type: string, identifier: string): string {
    return `${type}:${userId}:${identifier}`
  }

  getDayDataKey(userId: string, date: string): string {
    return this.generateKey(userId, "dayData", date)
  }

  getPeriodHistoryKey(userId: string): string {
    return this.generateKey(userId, "periodHistory", "all")
  }
}

const cacheManager = new CacheManager()

// ========================================
// UTILITY FUNCTIONS
// ========================================

class DateUtils {
  /**
   * Normalize date to YYYY-MM-DD format to avoid timezone issues
   */
  static normalize(date: Date): string {
    if (!DateUtils.isValidDate(date)) {
      throw new Error("Invalid date provided")
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  /**
   * Parse normalized date string back to Date object
   */
  static parse(dateString: string): Date {
    if (!DateUtils.isValidDateString(dateString)) {
      throw new Error(`Invalid date string format: ${dateString}`)
    }

    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  /**
   * Check if date is valid
   */
  static isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * Check if date string is valid (YYYY-MM-DD format)
   */
  static isValidDateString(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) return false

    const parts = dateString.split("-")
    if (parts.length !== 3) return false

    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    return DateUtils.isValidDate(date)
  }

  /**
   * Calculate days between two dates
   */
  static daysBetween(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime())
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
}

class ErrorHandler {
  static createResponse(success: boolean, message: string, data?: any): ApiResponse {
    return { success, message, data }
  }

  static handleError(error: unknown, context: string): ApiResponse {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    console.error(`[${context}] Error:`, error)
    return ErrorHandler.createResponse(false, `${context}: ${errorMessage}`)
  }
}

// ========================================
// STORAGE LAYER (Using Firestore as primary)
// ========================================

class FirestoreService {
  private db = getFirestore()

  async addDocument(userId: string, collectionName: string, data: any): Promise<string> {
    const docRef = await addDoc(
      collection(this.db, "users", userId, collectionName),
      {
        ...data,
        createdAt: new Date().toISOString(),
      }
    )
    return docRef.id
  }

  async getDocuments(
    userId: string,
    collectionName: string,
    constraints: any[] = []
  ): Promise<DocumentData[]> {
    const q = query(
      collection(this.db, "users", userId, collectionName),
      ...constraints
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  }

  async deleteDocument(userId: string, collectionName: string, docId: string): Promise<void> {
    await deleteDoc(doc(this.db, "users", userId, collectionName, docId))
  }

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    return runTransaction(this.db, updateFunction)
  }
}

const firestoreService = new FirestoreService()

// ========================================
// CYCLE INFO CALCULATION (Unified for consistency)
// ========================================

export interface CycleInfo {
  daysUntilNextPeriod: number
  nextPeriodDate: Date
  averageCycleLength: number
  lastPeriodDate: Date | null
  cyclePhase: string
  daysSinceLastPeriod: number
  isDataAvailable: boolean
}

export const calculateCycleInfo = (periodHistory: PeriodEntry[]): CycleInfo => {
  const today = new Date()

  if (!periodHistory || periodHistory.length === 0) {
    // No logged data, use normal cycle range (28 days average)
    const averageCycleLength = DEFAULT_CYCLE_LENGTH
    const nextPeriodDate = new Date(today)
    nextPeriodDate.setDate(today.getDate() + averageCycleLength)

    return {
      daysUntilNextPeriod: averageCycleLength,
      nextPeriodDate,
      averageCycleLength,
      lastPeriodDate: null,
      cyclePhase: "Unknown",
      daysSinceLastPeriod: 0,
      isDataAvailable: false,
    }
  }

  // Use Firebase period history data (same as service predictions)
  const lastPeriod = periodHistory[0] // Most recent period
  const lastPeriodStart = DateUtils.parse(lastPeriod.startDate)
  const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate average cycle length from Firebase period history
  let totalCycleDays = 0
  let cycleCount = 0

  for (let i = 0; i < periodHistory.length - 1; i++) {
    const current = DateUtils.parse(periodHistory[i].startDate)
    const next = DateUtils.parse(periodHistory[i + 1].startDate)
    const cycleDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))

    if (cycleDays >= 21 && cycleDays <= 35) {
      // Valid cycle length
      totalCycleDays += cycleDays
      cycleCount++
    }
  }

  const averageCycleLength = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : DEFAULT_CYCLE_LENGTH

  // Calculate next period date using the same logic as service
  const nextPeriodDate = new Date(lastPeriodStart)
  nextPeriodDate.setDate(lastPeriodStart.getDate() + averageCycleLength)

  const daysUntilNextPeriod = Math.floor((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Determine cycle phase
  let cyclePhase = "Follicular"
  if (daysSinceLastPeriod <= 7) {
    cyclePhase = "Menstrual"
  } else if (daysSinceLastPeriod >= 12 && daysSinceLastPeriod <= 16) {
    cyclePhase = "Ovulation"
  } else if (daysSinceLastPeriod > 16) {
    cyclePhase = "Luteal"
  }

  return {
    daysUntilNextPeriod,
    nextPeriodDate,
    averageCycleLength,
    lastPeriodDate: lastPeriodStart,
    cyclePhase,
    daysSinceLastPeriod,
    isDataAvailable: true,
  }
}

// ========================================
// PERIOD TRACKING
// ========================================

export const getPeriodHistory = async (
  userId: string,
  limitCount = 24
): Promise<PeriodEntry[]> => {
  try {
    console.log("[getPeriodHistory] Fetching for userId:", userId)

    // Check cache first
    const cacheKey = cacheManager.getPeriodHistoryKey(userId)
    const cached = cacheManager.get<PeriodEntry[]>(cacheKey)
    if (cached) {
      console.log("[getPeriodHistory] Found cached data:", cached)
      return cached.slice(0, limitCount)
    }

    const periods = await firestoreService.getDocuments(
      userId,
      COLLECTION_MAP.period, // "tracker_periods"
      [orderBy("startDate", "desc"), limit(limitCount)]
    ) as PeriodEntry[]

    console.log("[getPeriodHistory] Fetched from Firestore:", periods)

    // Cache the results
    cacheManager.set(cacheKey, periods)
    return periods
  } catch (error) {
    console.error("Failed to fetch period history:", error)
    return []
  }
}

export const calculateFertileWindow = async (
  userId: string
): Promise<FertileWindow | null> => {
  try {
    const periodHistory = await getPeriodHistory(userId, 12)

    if (periodHistory.length === 0) {
      return calculateDefaultFertileWindow()
    }

    const { averageCycleLength, averagePeriodLength } = calculateAverages(periodHistory)
    const lastPeriod = periodHistory[0]
    const lastPeriodStart = DateUtils.parse(lastPeriod.startDate)

    // Calculate next expected period and ovulation
    const nextPeriodStart = DateUtils.addDays(lastPeriodStart, averageCycleLength)
    const ovulationDate = DateUtils.addDays(nextPeriodStart, -14) // 14 days before next period

    // Fertile window: 5 days before ovulation to 3 days after
    const fertileStart = DateUtils.addDays(ovulationDate, -5)
    const fertileEnd = DateUtils.addDays(ovulationDate, 3)

    return {
      ovulationDate: DateUtils.normalize(ovulationDate),
      fertileWindowStart: DateUtils.normalize(fertileStart),
      fertileWindowEnd: DateUtils.normalize(fertileEnd),
      fertileStart: DateUtils.normalize(fertileStart),
      fertileEnd: DateUtils.normalize(fertileEnd),
      nextPeriodStart: DateUtils.normalize(nextPeriodStart),
      cycleLength: averageCycleLength,
      periodLength: averagePeriodLength,
    }
  } catch (error) {
    return ErrorHandler.handleError(error, "calculateFertileWindow").data || null
  }
}

function calculateDefaultFertileWindow(): FertileWindow {
  const today = new Date()
  const ovulationDate = DateUtils.addDays(today, 14)
  const fertileStart = DateUtils.addDays(ovulationDate, -5)
  const fertileEnd = DateUtils.addDays(ovulationDate, 3)
  const nextPeriodStart = DateUtils.addDays(today, DEFAULT_CYCLE_LENGTH)

  return {
    ovulationDate: DateUtils.normalize(ovulationDate),
    fertileWindowStart: DateUtils.normalize(fertileStart),
    fertileWindowEnd: DateUtils.normalize(fertileEnd),
    fertileStart: DateUtils.normalize(fertileStart),
    fertileEnd: DateUtils.normalize(fertileEnd),
    nextPeriodStart: DateUtils.normalize(nextPeriodStart),
    cycleLength: DEFAULT_CYCLE_LENGTH,
    periodLength: DEFAULT_PERIOD_LENGTH,
  }
}

function calculateAverages(periodHistory: PeriodEntry[]): {
  averageCycleLength: number
  averagePeriodLength: number
} {
  let averageCycleLength = DEFAULT_CYCLE_LENGTH
  let averagePeriodLength = DEFAULT_PERIOD_LENGTH

  // Calculate average cycle length
  if (periodHistory.length >= 2) {
    const cycles = []
    for (let i = 0; i < periodHistory.length - 1; i++) {
      const current = DateUtils.parse(periodHistory[i].startDate)
      const next = DateUtils.parse(periodHistory[i + 1].startDate)
      const daysDiff = DateUtils.daysBetween(current, next)
      cycles.push(daysDiff)
    }
    averageCycleLength = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length)
  }

  // Calculate average period length
  const periodsWithEndDate = periodHistory.filter((p) => p.endDate)
  if (periodsWithEndDate.length > 0) {
    const periodLengths = periodsWithEndDate.map((p) => {
      const start = DateUtils.parse(p.startDate)
      const end = DateUtils.parse(p.endDate!)
      return DateUtils.daysBetween(start, end) + 1
    })
    averagePeriodLength = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
  }

  return { averageCycleLength, averagePeriodLength }
}

export const logPeriod = async (
  userId: string,
  startDate: Date,
  endDate?: Date,
  symptoms: string[] = []
): Promise<ApiResponse> => {
  try {
    // Validate inputs
    if (!DateUtils.isValidDate(startDate)) {
      return ErrorHandler.createResponse(false, "Invalid start date provided")
    }

    if (endDate && !DateUtils.isValidDate(endDate)) {
      return ErrorHandler.createResponse(false, "Invalid end date provided")
    }

    if (endDate && endDate < startDate) {
      return ErrorHandler.createResponse(false, "End date cannot be before start date")
    }

    const startDateStr = DateUtils.normalize(startDate)

    // Check if period can be logged (7-day rule)
    const validationResult = await canLogPeriod(userId, startDateStr)
    if (!validationResult.allowed) {
      return ErrorHandler.createResponse(false, validationResult.message || "Cannot log period")
    }

    // Use transaction to ensure atomicity
    await firestoreService.runTransaction(async (transaction) => {
      await firestoreService.addDocument(userId, COLLECTION_MAP.period, {
        startDate: startDateStr,
        endDate: endDate ? DateUtils.normalize(endDate) : null,
        symptoms,
      })
    })

    // Clear cache to ensure fresh data on next fetch
    cacheManager.clear()

    return ErrorHandler.createResponse(true, "Period logged successfully")
  } catch (error) {
    return ErrorHandler.handleError(error, "logPeriod")
  }
}

export const canLogPeriod = async (
  userId: string,
  dateStr: string
): Promise<{ allowed: boolean; message?: string }> => {
  try {
    const recentPeriods = await getPeriodHistory(userId, 5)

    if (recentPeriods.length === 0) {
      return { allowed: true }
    }

    const lastPeriod = recentPeriods[0]
    const lastPeriodDate = DateUtils.parse(lastPeriod.startDate)
    const thisDate = DateUtils.parse(dateStr)
    const daysSinceLast = DateUtils.daysBetween(lastPeriodDate, thisDate)

    if (daysSinceLast < MIN_CYCLE_GAP_DAYS) {
      return {
        allowed: false,
        message: "You already recorded your period recently. If you are experiencing other kinds of bleeding, please check with a medical professional."
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error("Error validating period log:", error)
    return { allowed: false, message: "Unable to validate period entry" }
  }
}
// Add this function to your trackerService.ts file
// Place it in the "PERIOD TRACKING" section, after the existing functions

export const migratePeriodDataToFirestore = async (userId: string): Promise<ApiResponse> => {
  try {
    console.log("[Migration] Starting period data migration for user:", userId)

    // Get all period logs from AsyncStorage
    const asyncStoragePeriods = await getAllPeriodLogs(userId)
    console.log("[Migration] Found periods in AsyncStorage:", asyncStoragePeriods)

    if (asyncStoragePeriods.length === 0) {
      return ErrorHandler.createResponse(true, "No period data found in AsyncStorage")
    }

    // Check if periods already exist in Firestore
    const existingPeriods = await getPeriodHistory(userId, 50)
    console.log("[Migration] Existing periods in Firestore:", existingPeriods)

    // Convert AsyncStorage periods to Firestore format
    const periodsToMigrate = asyncStoragePeriods.filter(asyncPeriod => {
      // Don't migrate if already exists in Firestore
      return !existingPeriods.some(existing => existing.startDate === asyncPeriod.date)
    })

    console.log("[Migration] Periods to migrate:", periodsToMigrate)

    // Migrate each period
    for (const period of periodsToMigrate) {
      try {
        // Get the full day data to extract symptoms if any
        const dayData = await getDayData(userId, period.date)
        const symptoms = dayData?.period?.symptoms || []

        // Add to Firestore
        await firestoreService.addDocument(userId, COLLECTION_MAP.period, {
          startDate: period.date,
          endDate: null, // AsyncStorage doesn't store end dates
          symptoms,
        })

        console.log("[Migration] Migrated period:", period.date)
      } catch (error) {
        console.error("[Migration] Failed to migrate period:", period.date, error)
      }
    }

    // Clear cache to force refresh
    cacheManager.clear()

    return ErrorHandler.createResponse(true, `Successfully migrated ${periodsToMigrate.length} periods`)

  } catch (error) {
    return ErrorHandler.handleError(error, "migratePeriodDataToFirestore")
  }
}
// ========================================
// OTHER TRACKING FUNCTIONS
// ========================================

export const logMood = async (
  userId: string,
  date: Date,
  mood: string,
  notes = ""
): Promise<ApiResponse> => {
  try {
    if (!DateUtils.isValidDate(date)) {
      return ErrorHandler.createResponse(false, "Invalid date provided")
    }

    if (!mood.trim()) {
      return ErrorHandler.createResponse(false, "Mood is required")
    }

    await firestoreService.addDocument(userId, COLLECTION_MAP.mood, {
      date: DateUtils.normalize(date),
      mood: mood.trim(),
      notes: notes.trim(),
    })

    return ErrorHandler.createResponse(true, "Mood logged successfully")
  } catch (error) {
    return ErrorHandler.handleError(error, "logMood")
  }
}

export const logSleep = async (
  userId: string,
  sleepData: Omit<SleepEntry, 'id' | 'createdAt' | 'qualityScore'>
): Promise<ApiResponse> => {
  try {
    const sleepDate = DateUtils.parse(sleepData.date)
    if (!DateUtils.isValidDate(sleepDate)) {
      return ErrorHandler.createResponse(false, "Invalid date provided")
    }

    if (sleepData.hours < 0 || sleepData.hours > 24) {
      return ErrorHandler.createResponse(false, "Sleep hours must be between 0 and 24")
    }

    await firestoreService.addDocument(userId, COLLECTION_MAP.sleep, {
      date: sleepData.date,
      hours: sleepData.hours,
      quality: sleepData.quality,
      qualityScore: QUALITY_MAP[sleepData.quality],
      bedTime: sleepData.bedTime,
      wakeTime: sleepData.wakeTime,
    })

    return ErrorHandler.createResponse(true, "Sleep logged successfully")
  } catch (error) {
    return ErrorHandler.handleError(error, "logSleep")
  }
}

export const logNutrition = async (
  userId: string,
  date: Date,
  meals: Meal[],
  water: number,
  notes = ""
): Promise<ApiResponse> => {
  try {
    if (!DateUtils.isValidDate(date)) {
      return ErrorHandler.createResponse(false, "Invalid date provided")
    }

    if (water < 0) {
      return ErrorHandler.createResponse(false, "Water intake cannot be negative")
    }

    await firestoreService.addDocument(userId, COLLECTION_MAP.nutrition, {
      date: DateUtils.normalize(date),
      meals: meals || [],
      water,
      notes: notes.trim(),
    })

    return ErrorHandler.createResponse(true, "Nutrition logged successfully")
  } catch (error) {
    return ErrorHandler.handleError(error, "logNutrition")
  }
}

// ========================================
// DATA RETRIEVAL
// ========================================

export const getTrackerHistory = async (
  userId: string,
  type: TrackerType,
  startDate: Date,
  endDate: Date
): Promise<TrackerEntry[]> => {
  const sessionId = Math.random().toString(36).substr(2, 9);
  console.log(`[trackerService] 🚀 Starting getTrackerHistory [Session: ${sessionId}]`);
  console.log(`[trackerService] 📊 Query params:`, {
    userId,
    type,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  const startTime = Date.now();
  try {
    if (!DateUtils.isValidDate(startDate) || !DateUtils.isValidDate(endDate)) {
      console.error(`[trackerService] ❌ Invalid date range [Session: ${sessionId}]:`, { startDate, endDate });
      throw new Error("Invalid date range provided")
    }

    if (endDate < startDate) {
      console.error(`[trackerService] ❌ End date before start date [Session: ${sessionId}]:`, { startDate, endDate });
      throw new Error("End date cannot be before start date")
    }

    const dateField = type === "period" ? "startDate" : "date"
    const startDateStr = DateUtils.normalize(startDate)
    const endDateStr = DateUtils.normalize(endDate)

    console.log(`[trackerService] 📅 Normalized dates [Session: ${sessionId}]:`, {
      dateField,
      startDateStr,
      endDateStr,
      collection: COLLECTION_MAP[type]
    });
    const entries = await firestoreService.getDocuments(
      userId,
      COLLECTION_MAP[type],
      [
        where(dateField, ">=", startDateStr),
        where(dateField, "<=", endDateStr),
        orderBy(dateField, "desc"),
      ]
    )
    const duration = Date.now() - startTime;

    console.log(`[trackerService] ✅ ${type} history fetched [Session: ${sessionId}] [Duration: ${duration}ms]:`, {
      count: entries.length,
      entries: entries.slice(0, 3) // Log first 3 entries for debugging
    });

    return entries as TrackerEntry[]
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[trackerService] ❌ Failed to fetch ${type} history [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
    console.error(`[trackerService] ❌ Error details:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      queryParams: { userId, type, startDate, endDate }
    });
    return []
  }
}

// ========================================
// DATA DELETION
// ========================================

export const deleteTrackerEntry = async (
  userId: string,
  type: TrackerType,
  entryId: string
): Promise<ApiResponse> => {
  try {
    if (!entryId.trim()) {
      return ErrorHandler.createResponse(false, "Entry ID is required")
    }

    await firestoreService.deleteDocument(userId, COLLECTION_MAP[type], entryId)

    // Clear cache to ensure fresh data
    cacheManager.clear()

    return ErrorHandler.createResponse(true, `${type} entry deleted successfully`)
  } catch (error) {
    return ErrorHandler.handleError(error, `delete${type}Entry`)
  }
}

export const deletePeriodEntry = async (
  userId: string,
  periodId: string
): Promise<ApiResponse> => {
  return deleteTrackerEntry(userId, "period", periodId)
}

// ========================================
// DAY DATA (AsyncStorage for local quick access)
// ========================================

function getDateKey(date: string): string {
  // Accepts 'YYYY-MM-DD' or Date object as string
  if (!date) return ''
  if (typeof date === 'string' && date.includes('-')) {
    const [year, month, day] = date.split('-')
    return `${year}-${month}-${day}`
  }
  return date
}

export const getDayData = async (userId: string, date: string): Promise<DayData | null> => {
  try {
    if (!DateUtils.isValidDateString(date)) {
      throw new Error("Invalid date format")
    }

    // Check cache first
    const cacheKey = cacheManager.getDayDataKey(userId, date)
    const cached = cacheManager.get<DayData>(cacheKey)
    if (cached) {
      return cached
    }

    // Get from AsyncStorage
    const dateKey = getDateKey(date)
    const stored = await AsyncStorage.getItem(dateKey)

    if (stored) {
      const data = JSON.parse(stored) as DayData
      cacheManager.set(cacheKey, data)
      return data
    }

    return null
  } catch (error) {
    console.error("Failed to fetch day data:", error)
    return null
  }
}

export const logDayData = async (userId: string, dayData: DayData): Promise<ApiResponse> => {
  try {
    if (!DateUtils.isValidDateString(dayData.date)) {
      return ErrorHandler.createResponse(false, "Invalid date format")
    }

    const dateKey = getDateKey(dayData.date)
    await AsyncStorage.setItem(dateKey, JSON.stringify(dayData))

    // Update cache
    const cacheKey = cacheManager.getDayDataKey(userId, dayData.date)
    cacheManager.set(cacheKey, dayData)

    return ErrorHandler.createResponse(true, "Day data saved successfully")
  } catch (error) {
    return ErrorHandler.handleError(error, "logDayData")
  }
}

export const deleteDayData = async (userId: string, date: string): Promise<ApiResponse> => {
  try {
    if (!DateUtils.isValidDateString(date)) {
      return ErrorHandler.createResponse(false, "Invalid date format")
    }

    const dateKey = getDateKey(date)
    const existing = await AsyncStorage.getItem(dateKey)

    if (existing) {
      await AsyncStorage.removeItem(dateKey)
      // Clear from cache
      const cacheKey = cacheManager.getDayDataKey(userId, date)
      cacheManager.set(cacheKey, null)
      return ErrorHandler.createResponse(true, "Day data deleted successfully")
    } else {
      return ErrorHandler.createResponse(false, "No data found for this date")
    }
  } catch (error) {
    return ErrorHandler.handleError(error, "deleteDayData")
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

const getDayDataKey = (userId: string, date: string): string => `dayData_${userId}_${date}`

export const getAllPeriodLogs = async (userId: string): Promise<{ date: string }[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const userDayKeys = keys.filter(k => k.startsWith(`dayData_${userId}_`))
    const all = await AsyncStorage.multiGet(userDayKeys)

    const periodLogs = all
      .map(([, value]) => {
        try {
          return value ? JSON.parse(value) : null
        } catch {
          return null
        }
      })
      .filter((item): item is DayData =>
        item && item.period && item.period.isStart
      )
      .map(item => ({ date: item.date }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return periodLogs
  } catch (error) {
    console.error("Failed to get all period logs:", error)
    return []
  }
}

// ========================================
// EXPORTS
// ========================================

export { cacheManager, DateUtils, ErrorHandler }

// ========================================
// ACTIVITY TRACKING
// ========================================

export const logActivity = async (
  userId: string,
  date: Date,
  type: 'cycling' | 'running' | 'steps',
  data: {
    distance?: number
    duration?: number
    steps?: number
    goal?: number
    goalType?: 'distance' | 'duration' | 'steps'
  }
): Promise<ApiResponse> => {
  const sessionId = Math.random().toString(36).substr(2, 9);
  console.log(`[trackerService] 🚀 Starting logActivity [Session: ${sessionId}]`);
  console.log(`[trackerService] 📊 Activity data:`, {
    userId,
    date: date.toISOString(),
    type,
    ...data
  });

  const startTime = Date.now();
  try {
    if (!DateUtils.isValidDate(date)) {
      console.error(`[trackerService] ❌ Invalid date provided [Session: ${sessionId}]:`, date);
      return ErrorHandler.createResponse(false, "Invalid date provided")
    }

    const dateStr = DateUtils.normalize(date)
    console.log(`[trackerService] 📅 Normalized date: ${dateStr} [Session: ${sessionId}]`);
    await firestoreService.addDocument(userId, COLLECTION_MAP.activity, {
      date: dateStr,
      type,
      ...data,
    })
    const duration = Date.now() - startTime;

    console.log(`[trackerService] ✅ Activity saved to Firestore [Session: ${sessionId}] [Duration: ${duration}ms]`);

    // Clear cache to ensure fresh data on next fetch
    cacheManager.clear()

    return ErrorHandler.createResponse(true, "Activity logged successfully")
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[trackerService] ❌ Error in logActivity [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
    return ErrorHandler.handleError(error, "logActivity")
  }
}

export const getActivityHistory = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  type?: 'cycling' | 'running' | 'steps'
): Promise<ActivityEntry[]> => {
  try {
    if (!DateUtils.isValidDate(startDate) || !DateUtils.isValidDate(endDate)) {
      throw new Error("Invalid date range provided")
    }

    if (endDate < startDate) {
      throw new Error("End date cannot be before start date")
    }

    const startDateStr = DateUtils.normalize(startDate)
    const endDateStr = DateUtils.normalize(endDate)

    const constraints = [
      where("date", ">=", startDateStr),
      where("date", "<=", endDateStr),
      orderBy("date", "desc"),
    ]

    if (type) {
      constraints.unshift(where("type", "==", type))
    }

    const entries = await firestoreService.getDocuments(
      userId,
      COLLECTION_MAP.activity,
      constraints
    ) as ActivityEntry[]

    return entries
  } catch (error) {
    console.error("Failed to fetch activity history:", error)
    return []
  }
}

export const getDailyActivitySummary = async (
  userId: string,
  date: Date
): Promise<{
  steps: number
  cyclingDistance: number
  runningDistance: number
  cyclingDuration: number
  runningDuration: number
}> => {
  try {
    const dateStr = DateUtils.normalize(date)
    const startOfDay = new Date(date)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const activities = await getActivityHistory(userId, startOfDay, endOfDay)

    const summary = {
      steps: 0,
      cyclingDistance: 0,
      runningDistance: 0,
      cyclingDuration: 0,
      runningDuration: 0,
    }

    activities.forEach(activity => {
      switch (activity.type) {
        case 'steps':
          summary.steps += activity.steps || 0
          break
        case 'cycling':
          summary.cyclingDistance += activity.distance || 0
          summary.cyclingDuration += activity.duration || 0
          break
        case 'running':
          summary.runningDistance += activity.distance || 0
          summary.runningDuration += activity.duration || 0
          break
      }
    })

    return summary
  } catch (error) {
    console.error("Failed to get daily activity summary:", error)
    return {
      steps: 0,
      cyclingDistance: 0,
      runningDistance: 0,
      cyclingDuration: 0,
      runningDuration: 0,
    }
  }
}

// Legacy compatibility exports
export const getRecentPeriods = getPeriodHistory
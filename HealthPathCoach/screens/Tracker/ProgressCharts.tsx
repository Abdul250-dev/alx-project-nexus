import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { X } from 'react-native-feather';

import Header from '../../components/Header';
import { useTheme } from '../../components/theme-provider';
import { useTracker } from '../../context/TrackerContext';
import { useUser } from '../../context/UserContext';
import { t } from '../../services/localizationService';
import {
  getActivityHistory,
  getTrackerHistory
} from '../../services/trackerService';

const screenWidth = Dimensions.get('window').width;

type TimePeriod = 'daily' | 'weekly' | 'monthly';

interface ChartData {
  labels: string[];
  datasets?: { data: number[] }[];
  data?: string[];
}

export default function ProgressCharts() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { periodHistory, loggedDayData } = useTracker();
  const { userData } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('weekly');
  const [activitiesData, setActivitiesData] = useState([
    { label: 'Steps', value: 0, goal: 10000 },
    { label: 'Running (km)', value: 0, goal: 5 },
    { label: 'Cycling (km)', value: 0, goal: 10 },
  ]);

  // State for Firebase data
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all tracker data from Firebase
  useEffect(() => {
    const loadAllTrackerData = async () => {
      if (!userData?.id) return;

      const sessionId = Math.random().toString(36).substr(2, 9);
      console.log(`[ProgressCharts] 🚀 Starting data load [Session: ${sessionId}]`);
      console.log(`[ProgressCharts] 👤 User: ${userData.id}, Period: ${selectedPeriod}`);

      setLoading(true);
      const startTime = Date.now();

      try {
        // Get date range for the selected period
        const ranges = getDateRange(selectedPeriod);
        const startDate = ranges[0].start;
        const endDate = ranges[ranges.length - 1].end;

        console.log(`[ProgressCharts] 📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()} [Session: ${sessionId}]`);

        // Load activity data for the selected period
        console.log(`[ProgressCharts] 🏃 Loading activity data for period [Session: ${sessionId}]`);
        const activityHistory = await getActivityHistory(userData.id, startDate, endDate);
        setActivityData(activityHistory);
        console.log(`[ProgressCharts] ✅ Activity data loaded: ${activityHistory.length} entries [Session: ${sessionId}]`);

        // Calculate activity summary for the period
        const periodActivitySummary = calculatePeriodActivitySummary(activityHistory, selectedPeriod);
        setActivitiesData([
          {
            label: 'Steps',
            value: Math.round(periodActivitySummary.steps),
            goal: selectedPeriod === 'daily' ? 10000 : selectedPeriod === 'weekly' ? 70000 : 300000
          },
          {
            label: 'Running (km)',
            value: Math.round((periodActivitySummary.runningDistance / 1000) * 10) / 10,
            goal: selectedPeriod === 'daily' ? 5 : selectedPeriod === 'weekly' ? 35 : 150
          },
          {
            label: 'Cycling (km)',
            value: Math.round((periodActivitySummary.cyclingDistance / 1000) * 10) / 10,
            goal: selectedPeriod === 'daily' ? 10 : selectedPeriod === 'weekly' ? 70 : 300
          },
        ]);

        // Load sleep data from Firebase
        console.log(`[ProgressCharts] 😴 Loading sleep data [Session: ${sessionId}]`);
        const sleepHistory = await getTrackerHistory(userData.id, 'sleep', startDate, endDate);
        setSleepData(sleepHistory);
        console.log(`[ProgressCharts] ✅ Sleep data loaded: ${sleepHistory.length} entries [Session: ${sessionId}]`);

        // Load mood data from Firebase
        console.log(`[ProgressCharts] 😊 Loading mood data [Session: ${sessionId}]`);
        const moodHistory = await getTrackerHistory(userData.id, 'mood', startDate, endDate);
        setMoodData(moodHistory);
        console.log(`[ProgressCharts] ✅ Mood data loaded: ${moodHistory.length} entries [Session: ${sessionId}]`);

        // Load nutrition data from Firebase
        console.log(`[ProgressCharts] 🍎 Loading nutrition data [Session: ${sessionId}]`);
        const nutritionHistory = await getTrackerHistory(userData.id, 'nutrition', startDate, endDate);
        setNutritionData(nutritionHistory);
        console.log(`[ProgressCharts] ✅ Nutrition data loaded: ${nutritionHistory.length} entries [Session: ${sessionId}]`);

        const duration = Date.now() - startTime;
        console.log(`[ProgressCharts] 🎉 All data loaded successfully [Session: ${sessionId}] [Duration: ${duration}ms]`);

      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[ProgressCharts] ❌ Error loading tracker data [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
        console.error(`[ProgressCharts] ❌ Error details:`, {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userData: { id: userData?.id, gender: userData?.gender }
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllTrackerData();
  }, [userData?.id, selectedPeriod]);

  // Helper function to calculate activity summary for a period
  const calculatePeriodActivitySummary = (activities: any[], period: TimePeriod) => {
    const summary = {
      steps: 0,
      runningDistance: 0,
      cyclingDistance: 0,
      runningDuration: 0,
      cyclingDuration: 0,
    };

    activities.forEach(activity => {
      switch (activity.type) {
        case 'steps':
          summary.steps += activity.steps || 0;
          break;
        case 'running':
          summary.runningDistance += activity.distance || 0;
          summary.runningDuration += activity.duration || 0;
          break;
        case 'cycling':
          summary.cyclingDistance += activity.distance || 0;
          summary.cyclingDuration += activity.duration || 0;
          break;
      }
    });

    // For weekly and monthly, calculate averages
    if (period === 'weekly') {
      summary.steps = Math.round(summary.steps / 7);
      summary.runningDistance = Math.round(summary.runningDistance / 7);
      summary.cyclingDistance = Math.round(summary.cyclingDistance / 7);
    } else if (period === 'monthly') {
      summary.steps = Math.round(summary.steps / 30);
      summary.runningDistance = Math.round(summary.runningDistance / 30);
      summary.cyclingDistance = Math.round(summary.cyclingDistance / 30);
    }

    return summary;
  };

  // Helper function to get date range based on selected period
  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    const ranges = [];

    switch (period) {
      case 'daily':
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          ranges.push({
            start: date,
            end: date,
            label: date.toLocaleDateString('en-US', { weekday: 'short' })
          });
        }
        break;
      case 'weekly':
        // Last 6 weeks
        for (let i = 5; i >= 0; i--) {
          const start = new Date(now);
          start.setDate(now.getDate() - (i * 7));
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          ranges.push({
            start,
            end,
            label: `W${6 - i}`
          });
        }
        break;
      case 'monthly':
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          end.setHours(23, 59, 59, 999);
          ranges.push({
            start,
            end,
            label: start.toLocaleDateString('en-US', { month: 'short' })
          });
        }
        break;
    }

    return ranges;
  };

  // --- Menstrual: Periods per selected period ---
  const periodChartData = useMemo(() => {
    const ranges = getDateRange(selectedPeriod);
    const data = ranges.map(({ start, end }, index) => {
      const count = periodHistory.filter(p => {
        if (!p.startDate) return false;
        const periodDate = new Date(p.startDate);
        return periodDate >= start && periodDate <= end;
      }).length;

      return { x: index + 1, y: count, label: ranges[index].label };
    });

    return data;
  }, [periodHistory, selectedPeriod]);

  // --- Sleep: Average hours per selected period (from Firebase) ---
  const sleepChartData = useMemo(() => {
    const ranges = getDateRange(selectedPeriod);
    const data = ranges.map(({ start, end }, index) => {
      const periodSleepData = sleepData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });

      let averageHours = 0;
      if (periodSleepData.length > 0) {
        const totalHours = periodSleepData.reduce((sum, entry) => sum + (entry.hours || 0), 0);
        averageHours = parseFloat((totalHours / periodSleepData.length).toFixed(1));
      }

      return { x: index + 1, y: averageHours, label: ranges[index].label };
    });

    return data;
  }, [sleepData, selectedPeriod]);

  // --- Mood: Most common mood per selected period (from Firebase) ---
  const moodChartData = useMemo(() => {
    const ranges = getDateRange(selectedPeriod);
    const data = ranges.map(({ start, end }, index) => {
      const periodMoodData = moodData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });

      let mostCommonMood = '-';
      if (periodMoodData.length > 0) {
        const moodCount: Record<string, number> = {};
        periodMoodData.forEach(entry => {
          if (entry.mood) {
            moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
          }
        });

        let maxMood = '', maxCount = 0;
        Object.entries(moodCount).forEach(([mood, count]) => {
          if (count > maxCount) {
            maxMood = mood;
            maxCount = count as number;
          }
        });

        mostCommonMood = maxMood || '-';
      }

      return { x: index + 1, y: mostCommonMood, label: ranges[index].label, mood: mostCommonMood };
    });

    return data;
  }, [moodData, selectedPeriod]);

  // --- Nutrition: Water intake per selected period (from Firebase) ---
  const nutritionChartData = useMemo(() => {
    const ranges = getDateRange(selectedPeriod);
    const data = ranges.map(({ start, end }, index) => {
      const periodNutritionData = nutritionData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });

      const totalWater = periodNutritionData.reduce((sum, entry) => sum + (entry.water || 0), 0);

      return { x: index + 1, y: totalWater, label: ranges[index].label };
    });

    return data;
  }, [nutritionData, selectedPeriod]);

  // --- Conditional rendering for period chart ---
  const showPeriodChart =
    userData?.gender?.toLowerCase() === 'female' ||
    (userData?.gender?.toLowerCase() === 'male' && userData?.partnerId);

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'daily': return t('tracker.daily', 'Daily');
      case 'weekly': return t('tracker.weekly', 'Weekly');
      case 'monthly': return t('tracker.monthly', 'Monthly');
    }
  };

  const getPeriodLabelForChart = (period: TimePeriod) => {
    switch (period) {
      case 'daily': return t('tracker.daily', 'Daily');
      case 'weekly': return t('tracker.weekly', 'Weekly');
      case 'monthly': return t('tracker.monthly', 'Monthly');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Loading progress data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('tracker.progress_charts', 'Progress Charts')}
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X stroke={colors.text} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      {/* Time Period Selector */}
      <View style={{ flexDirection: 'row', margin: 16, backgroundColor: colors.cardBackground, borderRadius: 12, padding: 4 }}>
        {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((period) => (
          <TouchableOpacity
            key={period}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: selectedPeriod === period ? colors.teal : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={{
              color: selectedPeriod === period ? colors.white : colors.text,
              fontWeight: selectedPeriod === period ? 'bold' : '500',
              fontSize: 14,
            }}>
              {getPeriodLabel(period)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', margin: 16 }}>
          {t('tracker.your_progress', 'Your Progress')}
        </Text>

        {/* Activities Progress Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginLeft: 16, marginBottom: 8 }}>
            {`${t('tracker.activities_progress', 'Activities Progress')} (${getPeriodLabelForChart(selectedPeriod)})`}
          </Text>
          {activitiesData.map((item, idx) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8 }}>
              <Text style={{ color: colors.textSecondary, width: 110 }}>{item.label}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: colors.cardBackground, borderRadius: 4, marginHorizontal: 8 }}>
                <View style={{ width: `${Math.min(100, (item.value / item.goal) * 100)}%`, height: 8, backgroundColor: colors.teal, borderRadius: 4 }} />
              </View>
              <Text style={{ color: colors.text, fontWeight: '500', width: 60, textAlign: 'right' }}>{item.value} / {item.goal}</Text>
            </View>
          ))}
        </View>

        {/* Periods Progress Section (conditional) */}
        {showPeriodChart && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginLeft: 16, marginBottom: 8 }}>
              {`${t('tracker.periods_per_period')} ${getPeriodLabelForChart(selectedPeriod)}`}
            </Text>
            <View style={{ backgroundColor: colors.cardBackground, borderRadius: 16, margin: 16, padding: 16 }}>
              <View style={{ height: 180, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end' }}>
                {periodChartData.map((item, index) => {
                  const maxValue = Math.max(...periodChartData.map(d => d.y), 1);
                  const barHeight = (item.y / maxValue) * 120;
                  return (
                    <View key={index} style={{ flex: 1, alignItems: 'center', marginHorizontal: 4 }}>
                      <View
                        style={{
                          width: 20,
                          height: barHeight,
                          backgroundColor: colors.teal,
                          borderRadius: 4,
                          marginBottom: 8,
                        }}
                      />
                      <Text style={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center' }}>
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Sleep Progress Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginLeft: 16, marginBottom: 8 }}>
            {`${t('tracker.avg_sleep_hours')} (${getPeriodLabelForChart(selectedPeriod)})`}
          </Text>
          <View style={{ backgroundColor: colors.cardBackground, borderRadius: 16, margin: 16, padding: 16 }}>
            <View style={{ height: 180, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end' }}>
              {sleepChartData.map((item, index) => {
                const maxValue = Math.max(...sleepChartData.map(d => d.y), 1);
                const barHeight = (item.y / maxValue) * 120;
                return (
                  <View key={index} style={{ flex: 1, alignItems: 'center', marginHorizontal: 4 }}>
                    <View
                      style={{
                        width: 20,
                        height: barHeight,
                        backgroundColor: colors.navyBlue,
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    <Text style={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center' }}>
                      {item.label}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 8, textAlign: 'center' }}>
                      {item.y.toFixed(1)}h
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Mood Progress Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginLeft: 16, marginBottom: 8 }}>
            {`${t('tracker.most_common_mood')} (${getPeriodLabelForChart(selectedPeriod)})`}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 }}>
            {moodChartData.map((item, idx) => (
              <View key={item.label} style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary }}>{item.label}</Text>
                <Text style={{ color: colors.teal, fontWeight: 'bold', fontSize: 16 }}>{item.mood}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nutrition Progress Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginLeft: 16, marginBottom: 8 }}>
            {`${t('tracker.water_intake')} (${getPeriodLabelForChart(selectedPeriod)})`}
          </Text>
          <View style={{ backgroundColor: colors.cardBackground, borderRadius: 16, margin: 16, padding: 16 }}>
            <View style={{ height: 180, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end' }}>
              {nutritionChartData.map((item, index) => {
                const maxValue = Math.max(...nutritionChartData.map(d => d.y), 1);
                const barHeight = (item.y / maxValue) * 120;
                return (
                  <View key={index} style={{ flex: 1, alignItems: 'center', marginHorizontal: 4 }}>
                    <View
                      style={{
                        width: 20,
                        height: barHeight,
                        backgroundColor: colors.primary,
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    <Text style={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center' }}>
                      {item.label}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 8, textAlign: 'center' }}>
                      {item.y}ml
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
import { useNavigation } from "@react-navigation/native"
import type React from "react"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Coffee, Minus, Moon, Plus, Sun, X } from "react-native-feather"
import AnimatedButton from "../../components/AnimatedButton"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"
import { logNutrition } from "../../services/trackerService"

type Meal = {
  id: string
  name: string
  icon: React.ReactNode
}

type WaterIntake = {
  amount: number
  unit: "glasses" | "ml"
}

export default function NutritionTracker() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { userData } = useUser()

  const [selectedMeal, setSelectedMeal] = useState<string>("breakfast")
  const [mealDescription, setMealDescription] = useState("")
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({ amount: 4, unit: "glasses" })
  const [loading, setLoading] = useState(false)

  const meals: Meal[] = [
    {
      id: "breakfast",
      name: "Breakfast",
      icon: <Sun stroke={colors.teal} width={20} height={20} />,
    },
    {
      id: "lunch",
      name: "Lunch",
      icon: <Sun stroke={colors.teal} width={20} height={20} />,
    },
    {
      id: "dinner",
      name: "Dinner",
      icon: <Moon stroke={colors.teal} width={20} height={20} />,
    },
    {
      id: "snack",
      name: "Snack",
      icon: <Coffee stroke={colors.teal} width={20} height={20} />,
    },
  ]

  // Fix 1: Separate methods instead of using boolean parameter
  const incrementWaterIntake = () => {
    setWaterIntake({ ...waterIntake, amount: waterIntake.amount + 1 })
  }

  const decrementWaterIntake = () => {
    if (waterIntake.amount > 0) {
      setWaterIntake({ ...waterIntake, amount: waterIntake.amount - 1 })
    }
  }

  const handleSaveLog = async () => {
    if (!userData) return

    const sessionId = Math.random().toString(36).substr(2, 9);
    console.log(`[NutritionTracker] 🚀 Starting nutrition save [Session: ${sessionId}]`);
    console.log(`[NutritionTracker] 🍎 Nutrition data:`, {
      userId: userData.id,
      selectedMeal,
      mealDescription,
      waterIntake: waterIntake.amount,
      userGender: userData.gender
    });

    setLoading(true)

    const startTime = Date.now();
    try {
      // Fix 2: Create meals array with the selected meal and description
      const mealsData = [
        {
          id: selectedMeal,
          name: meals.find(meal => meal.id === selectedMeal)?.name ?? selectedMeal,
          description: mealDescription,
          calories: 0, // You might want to add calorie tracking later
          time: new Date().toISOString(),
        }
      ]

      console.log(`[NutritionTracker] 🍽️ Meals data:`, mealsData);

      // Fix 3: Call logNutrition with correct parameters
      const result = await logNutrition(
        userData.id,
        new Date(),
        mealsData,
        waterIntake.amount,
        mealDescription // Optional notes parameter
      )
      const duration = Date.now() - startTime;

      console.log(`[NutritionTracker] ✅ Nutrition saved to Firebase [Session: ${sessionId}] [Duration: ${duration}ms]`);
      console.log(`[NutritionTracker] 📡 Nutrition save result:`, result);

      navigation.goBack()
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[NutritionTracker] ❌ Error logging nutrition [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
      console.error(`[NutritionTracker] ❌ Nutrition error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        nutritionData: {
          selectedMeal,
          mealDescription,
          waterIntake: waterIntake.amount
        }
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Nutrition Tracker"
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X stroke={colors.text} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Meal</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>What meal are you logging?</Text>

          <View style={styles.mealsContainer}>
            {meals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[
                  styles.mealButton,
                  {
                    backgroundColor: selectedMeal === meal.id ? colors.teal : colors.cardBackground,
                    borderWidth: selectedMeal === meal.id ? 0 : 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedMeal(meal.id)}
              >
                {meal.icon}
                <Text style={[
                  styles.mealText,
                  {
                    color: selectedMeal === meal.id ? colors.white : colors.text
                  }
                ]}>
                  {meal.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meal Description</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>Describe what you ate (optional)</Text>

          <TextInput
            style={[
              styles.descriptionInput,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="E.g., Oatmeal with berries and nuts"
            placeholderTextColor={colors.placeholderText || colors.textSecondary}
            multiline
            numberOfLines={4}
            value={mealDescription}
            onChangeText={setMealDescription}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Water Intake</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Track your water consumption today
          </Text>

          <View style={styles.waterContainer}>
            <TouchableOpacity
              style={[
                styles.waterButton,
                {
                  backgroundColor: colors.cardBackground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }
              ]}
              onPress={decrementWaterIntake}
            >
              <Minus stroke={colors.text} width={24} height={24} />
            </TouchableOpacity>

            <View style={styles.waterDisplay}>
              <Text style={[styles.waterText, { color: colors.text }]}>{waterIntake.amount}</Text>
              <Text style={[styles.waterUnit, { color: colors.textSecondary }]}>glasses</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.waterButton,
                {
                  backgroundColor: colors.cardBackground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }
              ]}
              onPress={incrementWaterIntake}
            >
              <Plus stroke={colors.text} width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nutrition Tips</Text>

          <View style={[
            styles.tipContainer,
            {
              backgroundColor: colors.cardBackground,
              borderWidth: 1,
              borderColor: colors.border,
            }
          ]}>
            <Text style={[styles.tipTitle, { color: colors.teal }]}>
              {userData?.gender?.toLowerCase() === 'male'
                ? 'Supporting Your Partner\'s Health'
                : 'Follicular Phase Nutrition'
              }
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              {userData?.gender?.toLowerCase() === 'male'
                ? 'Support your partner\'s reproductive health by encouraging iron-rich foods like leafy greens, beans, and lean meats during their menstrual cycle. B vitamins from whole grains support energy production and can help with mood stability during hormonal changes.'
                : 'During the follicular phase (days 1-14), focus on iron-rich foods like leafy greens, beans, and lean meats to replenish iron lost during menstruation. B vitamins from whole grains support energy production during this phase.'
              }
            </Text>
          </View>

          <View style={[
            styles.tipContainer,
            {
              backgroundColor: colors.cardBackground,
              borderWidth: 1,
              borderColor: colors.border,
            }
          ]}>
            <Text style={[styles.tipTitle, { color: colors.teal }]}>
              {userData?.gender?.toLowerCase() === 'male'
                ? 'Understanding Hormonal Changes'
                : 'Luteal Phase Nutrition'
              }
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              {userData?.gender?.toLowerCase() === 'male'
                ? 'Learn about the luteal phase (days 15-28) when your partner may experience PMS symptoms. Encourage magnesium-rich foods like dark chocolate, nuts, and seeds to help reduce symptoms. Complex carbohydrates can help stabilize blood sugar and mood swings.'
                : 'During the luteal phase (days 15-28), include magnesium-rich foods like dark chocolate, nuts, and seeds to help reduce PMS symptoms. Complex carbohydrates can help stabilize blood sugar and mood swings.'
              }
            </Text>
          </View>
        </View>

        <AnimatedButton
          title="Save Nutrition Log"
          onPress={handleSaveLog}
          loading={loading}
          style={styles.saveButton}
        />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  mealsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mealButton: {
    width: "48%",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  waterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  waterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  waterDisplay: {
    alignItems: "center",
    marginHorizontal: 24,
  },
  waterText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  waterUnit: {
    fontSize: 14,
  },
  tipContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
  },
})
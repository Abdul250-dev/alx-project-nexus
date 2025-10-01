import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { X } from "react-native-feather"
import AnimatedButton from "../../components/AnimatedButton"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { useUser } from "../../context/UserContext"
import { logMood } from "../../services/trackerService"

type Mood = {
  id: string
  name: string
  emoji: string
}

type Symptom = {
  id: string
  name: string
}

export default function MoodTracker() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { userData } = useUser()

  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const moods: Mood[] = [
    { id: "happy", name: "Happy", emoji: "😊" },
    { id: "calm", name: "Calm", emoji: "😌" },
    { id: "tired", name: "Tired", emoji: "😴" },
    { id: "stressed", name: "Stressed", emoji: "😰" },
    { id: "sad", name: "Sad", emoji: "😢" },
    { id: "irritable", name: "Irritable", emoji: "😠" },
    { id: "anxious", name: "Anxious", emoji: "😟" },
    { id: "energetic", name: "Energetic", emoji: "🤩" },
  ]

  const generalSymptoms: Symptom[] = [
    { id: "happy", name: "Happy" },
    { id: "calm", name: "Calm" },
    { id: "tired", name: "Tired" },
    { id: "stressed", name: "Stressed" },
    { id: "sad", name: "Sad" },
    { id: "anxious", name: "Anxious" },
    { id: "energetic", name: "Energetic" },
    { id: "headache", name: "Headache" },
    { id: "fatigue", name: "Fatigue" },
    { id: "insomnia", name: "Insomnia" },
    { id: "cravings", name: "Cravings" },
  ];

  const supportSymptoms: Symptom[] = [
    { id: "partner_support", name: "Supporting Partner" },
    { id: "empathy_fatigue", name: "Empathy Fatigue" },
    { id: "communication_stress", name: "Communication Stress" },
  ];

  const femaleSymptoms: Symptom[] = [
    { id: "pms", name: "PMS" },
    { id: "mood_swings", name: "Mood Swings" },
    { id: "irritability", name: "Irritability" },
    { id: "cramps", name: "Cramps" },
    { id: "bloating", name: "Bloating" },
    { id: "backache", name: "Backache" },
    { id: "nausea", name: "Nausea" },
    { id: "breast_tenderness", name: "Breast Tenderness" },
    { id: "acne", name: "Acne" },
  ];

  const symptoms: Symptom[] =
    userData?.gender?.toLowerCase() === 'male'
      ? [...generalSymptoms, ...supportSymptoms]
      : [...generalSymptoms, ...femaleSymptoms];

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter((id) => id !== symptomId))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId])
    }
  }

  const handleSaveLog = async () => {
    if (!userData || !selectedMood) return

    const sessionId = Math.random().toString(36).substr(2, 9);
    console.log(`[MoodTracker] 🚀 Starting mood save [Session: ${sessionId}]`);
    console.log(`[MoodTracker] 😊 Mood data:`, {
      userId: userData.id,
      mood: selectedMood,
      symptoms: selectedSymptoms,
      notes: notes,
      userGender: userData.gender
    });

    setLoading(true)

    try {
      // Fixed: Call logMood with separate arguments as expected by the function signature
      // Combine notes with symptoms information
      const combinedNotes = notes + (selectedSymptoms.length > 0 ? `\nSymptoms: ${selectedSymptoms.join(', ')}` : '')

      const startTime = Date.now();
      const result = await logMood(
        userData.id,
        new Date(),
        selectedMood,
        combinedNotes || undefined
      )
      const duration = Date.now() - startTime;

      console.log(`[MoodTracker] ✅ Mood saved to Firebase [Session: ${sessionId}] [Duration: ${duration}ms]`);
      console.log(`[MoodTracker] 📡 Mood save result:`, result);

      navigation.goBack()
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[MoodTracker] ❌ Error logging mood [Session: ${sessionId}] [Duration: ${duration}ms]:`, error);
      console.error(`[MoodTracker] ❌ Mood error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        moodData: {
          mood: selectedMood,
          symptoms: selectedSymptoms,
          notes: notes
        }
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Mood Tracker"
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X stroke={colors.text} width={24} height={24} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {userData?.gender?.toLowerCase() === 'male'
              ? 'How are you feeling about supporting your partner today?'
              : 'How are you feeling today?'
            }
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {userData?.gender?.toLowerCase() === 'male'
              ? 'Select the mood that best describes how you feel about supporting your partner'
              : 'Select the mood that best describes how you feel'
            }
          </Text>

          <View style={styles.moodsContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodButton,
                  {
                    backgroundColor: selectedMood === mood.id ? colors.teal : colors.cardBackground,
                    borderColor: selectedMood === mood.id ? colors.teal : colors.border,
                    borderWidth: selectedMood === mood.id ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedMood(mood.id)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodText,
                  {
                    color: selectedMood === mood.id ? colors.white : colors.text
                  }
                ]}>
                  {mood.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {userData?.gender?.toLowerCase() === 'male'
              ? 'How are you feeling about supporting your partner?'
              : 'Any symptoms?'
            }
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {userData?.gender?.toLowerCase() === 'male'
              ? 'Select any feelings or challenges you\'re experiencing while supporting your partner (optional)'
              : 'Select any symptoms you\'re experiencing (optional)'
            }
          </Text>

          <View style={styles.symptomsContainer}>
            {symptoms.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom.id)

              return (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.symptomButton,
                    {
                      backgroundColor: isSelected ? colors.teal : colors.cardBackground,
                      borderWidth: isSelected ? 0 : 1,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => toggleSymptom(symptom.id)}
                >
                  <Text style={[
                    styles.symptomText,
                    {
                      color: isSelected ? colors.white : colors.text
                    }
                  ]}>
                    {symptom.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {userData?.gender?.toLowerCase() === 'male'
              ? 'Add any additional notes about your feelings or how you\'re supporting your partner (optional)'
              : 'Add any additional notes about your mood or symptoms (optional)'
            }
          </Text>

          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder={
              userData?.gender?.toLowerCase() === 'male'
                ? 'E.g., Feeling more patient and understanding today'
                : 'E.g., Feeling better after taking a walk'
            }
            placeholderTextColor={colors.placeholderText || colors.textSecondary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Insights</Text>

          <View style={[
            styles.insightContainer,
            {
              backgroundColor: colors.cardBackground,
              borderWidth: 1,
              borderColor: colors.border,
            }
          ]}>
            <Text style={[styles.insightTitle, { color: colors.teal }]}>
              {userData?.gender?.toLowerCase() === 'male'
                ? 'Understanding Your Partner\'s Mood Changes'
                : 'Hormones and Mood'
              }
            </Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {userData?.gender?.toLowerCase() === 'male'
                ? 'Your partner\'s mood can be influenced by hormonal changes throughout their menstrual cycle. Estrogen, which rises during the follicular phase, can boost serotonin and improve mood. Progesterone, which increases after ovulation, may cause mood changes in some people. Understanding these patterns can help you provide better support and empathy during different phases of their cycle.'
                : 'Estrogen, which rises during the follicular phase, can boost serotonin and improve mood. Progesterone, which increases after ovulation, may cause mood changes in some people. Tracking your mood throughout your cycle can help you identify patterns and develop strategies for emotional well-being.'
              }
            </Text>
          </View>
        </View>

        <AnimatedButton
          title="Save Mood Log"
          onPress={handleSaveLog}
          loading={loading}
          disabled={!selectedMood}
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
  moodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  moodButton: {
    width: "23%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 12,
    fontWeight: "500",
  },
  symptomsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  symptomButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomText: {
    fontSize: 14,
  },
  notesInput: {
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
  insightContainer: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
  },
})
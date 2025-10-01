import { useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { CheckCircle, X } from "react-native-feather"
import AnimatedButton from "../../components/AnimatedButton"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { t } from "../../services/localizationService"

type Question = {
  id: string
  text: string
  options: {
    id: string
    text: string
  }[]
  correctOptionId: string
  explanation: string
}

export default function QuizScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { topicId } = route.params as { topicId: string }

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch from an API or database
    // For now, we'll use mock data
    const mockQuestions: Question[] = [
      {
        id: "1",
        text: t('quiz.q1.text'),
        options: [
          { id: "a", text: t('quiz.q1.a') },
          { id: "b", text: t('quiz.q1.b') },
          { id: "c", text: t('quiz.q1.c') },
          { id: "d", text: t('quiz.q1.d') },
        ],
        correctOptionId: "b",
        explanation: t('quiz.q1.explanation'),
      },
      {
        id: "2",
        text: t('quiz.q2.text'),
        options: [
          { id: "a", text: t('quiz.q2.a') },
          { id: "b", text: t('quiz.q2.b') },
          { id: "c", text: t('quiz.q2.c') },
          { id: "d", text: t('quiz.q2.d') },
        ],
        correctOptionId: "c",
        explanation: t('quiz.q2.explanation'),
      },
      {
        id: "3",
        text: t('quiz.q3.text'),
        options: [
          { id: "a", text: t('quiz.q3.a') },
          { id: "b", text: t('quiz.q3.b') },
          { id: "c", text: t('quiz.q3.c') },
          { id: "d", text: t('quiz.q3.d') },
        ],
        correctOptionId: "c",
        explanation: t('quiz.q3.explanation'),
      },
      {
        id: "4",
        text: t('quiz.q4.text'),
        options: [
          { id: "a", text: t('quiz.q4.a') },
          { id: "b", text: t('quiz.q4.b') },
          { id: "c", text: t('quiz.q4.c') },
          { id: "d", text: t('quiz.q4.d') },
        ],
        correctOptionId: "b",
        explanation: t('quiz.q4.explanation'),
      },
      {
        id: "5",
        text: t('quiz.q5.text'),
        options: [
          { id: "a", text: t('quiz.q5.a') },
          { id: "b", text: t('quiz.q5.b') },
          { id: "c", text: t('quiz.q5.c') },
          { id: "d", text: t('quiz.q5.d') },
        ],
        correctOptionId: "c",
        explanation: t('quiz.q5.explanation'),
      },
      {
        id: "6",
        text: t('quiz.q6.text'),
        options: [
          { id: "a", text: t('quiz.q6.a') },
          { id: "b", text: t('quiz.q6.b') },
          { id: "c", text: t('quiz.q6.c') },
          { id: "d", text: t('quiz.q6.d') },
        ],
        correctOptionId: "b",
        explanation: t('quiz.q6.explanation'),
      },
      {
        id: "7",
        text: t('quiz.q7.text'),
        options: [
          { id: "a", text: t('quiz.q7.a') },
          { id: "b", text: t('quiz.q7.b') },
          { id: "c", text: t('quiz.q7.c') },
          { id: "d", text: t('quiz.q7.d') },
        ],
        correctOptionId: "d",
        explanation: t('quiz.q7.explanation'),
      },
      {
        id: "8",
        text: t('quiz.q8.text'),
        options: [
          { id: "a", text: t('quiz.q8.a') },
          { id: "b", text: t('quiz.q8.b') },
          { id: "c", text: t('quiz.q8.c') },
          { id: "d", text: t('quiz.q8.d') },
        ],
        correctOptionId: "b",
        explanation: t('quiz.q8.explanation'),
      },
      {
        id: "9",
        text: t('quiz.q9.text'),
        options: [
          { id: "a", text: t('quiz.q9.a') },
          { id: "b", text: t('quiz.q9.b') },
          { id: "c", text: t('quiz.q9.c') },
          { id: "d", text: t('quiz.q9.d') },
        ],
        correctOptionId: "c",
        explanation: t('quiz.q9.explanation'),
      },
      {
        id: "10",
        text: t('quiz.q10.text'),
        options: [
          { id: "a", text: t('quiz.q10.a') },
          { id: "b", text: t('quiz.q10.b') },
          { id: "c", text: t('quiz.q10.c') },
          { id: "d", text: t('quiz.q10.d') },
        ],
        correctOptionId: "c",
        explanation: t('quiz.q10.explanation'),
      },
    ]

    setQuestions(mockQuestions)
  }, [topicId])

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return

    setSelectedOptionId(optionId)
    setIsAnswered(true)

    const currentQuestion = questions[currentQuestionIndex]
    if (optionId === currentQuestion.correctOptionId) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOptionId(null)
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleFinishQuiz = () => {
    // In a real app, this would save the quiz results to the user's profile
    navigation.goBack()
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
        <Header title="Loading Quiz..." showBackButton />
      </View>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
        <Header title="Quiz Results" showBackButton />

        <View style={styles.resultsContainer}>
          <View
            style={[
              styles.scoreCircle,
              {
                backgroundColor: colors.navyBlue,
                borderColor: percentage >= 70 ? colors.success : percentage >= 40 ? colors.warning : colors.error,
              },
            ]}
          >
            <Text style={[styles.scorePercentage, { color: colors.navyBlue }]}>{percentage}%</Text>
            <Text style={[styles.scoreText, { color: colors.navyBlue }]}>
              {score} / {questions.length}
            </Text>
          </View>

          <Text style={[styles.resultTitle, { color: colors.navyBlue }]}>
            {percentage >= 70 ? t('education.great_job') : percentage >= 40 ? t('education.good_effort') : t('education.keep_learning')}
          </Text>

          <Text style={[styles.resultMessage, { color: colors.navyBlue }]}>
            {percentage >= 70
              ? t('education.understanding')
              : percentage >= 40
                ? t('education.right_track')
                : t('education.learning_takes_time')}
          </Text>

          <AnimatedButton title={t('education.finish_quiz')} onPress={handleFinishQuiz} style={styles.finishButton} />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header title="Health Quiz" showBackButton />

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.lightGray }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.teal,
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.navyBlue }]}>
          {t('education.question_label')} {currentQuestionIndex + 1} {t('education.of')} {questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.questionText, { color: colors.navyBlue }]}>{currentQuestion.text}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id
            const isCorrect = isAnswered && option.id === currentQuestion.correctOptionId
            const isWrong = isAnswered && isSelected && option.id !== currentQuestion.correctOptionId

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected
                      ? isCorrect
                        ? colors.success
                        : colors.error
                      : isCorrect && isAnswered
                        ? colors.success
                        : colors.navyBlue,
                    borderColor: isSelected
                      ? isCorrect
                        ? colors.success
                        : colors.error
                      : isCorrect && isAnswered
                        ? colors.success
                        : colors.lightGray,
                  },
                ]}
                onPress={() => handleOptionSelect(option.id)}
                disabled={isAnswered}
              >
                <Text style={[styles.optionText, { color: colors.white }]}>
                  {option.id.toUpperCase()}. {option.text}
                </Text>

                {isCorrect && isAnswered && (
                  <CheckCircle stroke={colors.white} width={20} height={20} style={styles.optionIcon} />
                )}

                {isWrong && <X stroke={colors.white} width={20} height={20} style={styles.optionIcon} />}
              </TouchableOpacity>
            )
          })}
        </View>

        {isAnswered && (
          <View style={[styles.explanationContainer, { backgroundColor: colors.navyBlue }]}>
            <Text style={[styles.explanationTitle, { color: colors.teal }]}>{t('education.explanation')}:</Text>
            <Text style={[styles.explanationText, { color: colors.white }]}>{currentQuestion.explanation}</Text>
          </View>
        )}

        {isAnswered && (
          <AnimatedButton
            title={currentQuestionIndex < questions.length - 1 ? t('education.next_question') : t('education.see_results')}
            onPress={handleNextQuestion}
            style={styles.nextButton}
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: "right",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  optionIcon: {
    marginLeft: 8,
  },
  explanationContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  nextButton: {
    marginBottom: 24,
  },
  resultsContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  scorePercentage: {
    fontSize: 36,
    fontWeight: "bold",
  },
  scoreText: {
    fontSize: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  finishButton: {
    width: "100%",
  },
})

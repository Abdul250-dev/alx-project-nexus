import { useNavigation, useRoute } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Image, ScrollView, StyleSheet, Text, View } from "react-native"
import { BookOpen, CheckCircle, Play } from "react-native-feather"
import Card from "../../components/Card"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { t } from "../../services/localizationService"
import { ROUTES } from "../../utils/constants"

type Topic = {
  id: string
  title: string
  description: string
  type: "article" | "video" | "quiz"
  duration: string
  image: any
  completed?: boolean
}

export default function TopicDetail() {
  const route = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { categoryId } = route.params as { categoryId: string }
  const router = useRouter()

  const [category, setCategory] = useState<any>(null)
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    // In a real app, this would fetch from an API or database
    // For now, we'll use mock data
    const mockCategory = {
      id: categoryId,
      title: getCategoryTitle(categoryId),
      description: "Learn about the fundamentals of reproductive health and how to maintain a healthy lifestyle.",
    }

    const mockTopics: Topic[] = [
      {
        id: "1",
        title: "Understanding Your Menstrual Cycle",
        description:
          "Learn about the four phases of the menstrual cycle and the hormonal changes that occur throughout.",
        type: "article",
        duration: "5 min read",
        image: require("../../assets/images/menstrual-cycle.png"),
        completed: true,
      },
      {
        id: "2",
        title: "Common Menstrual Disorders",
        description: "Information about PCOS, endometriosis, dysmenorrhea, and other menstrual health conditions.",
        type: "article",
        duration: "7 min read",
        image: require("../../assets/images/menstrual-disorders.png"),
      },
      {
        id: "3",
        title: "Tracking Your Fertility Signs",
        description: "How to identify fertility signs like cervical mucus changes, basal body temperature, and more.",
        type: "video",
        duration: "4 min video",
        image: require("../../assets/images/period-tracking.png"),
      },
      {
        id: "4",
        title: "Menstrual Health Quiz",
        description: "Test your knowledge about menstrual health, cycle tracking, and reproductive wellness.",
        type: "quiz",
        duration: "10 questions",
        image: require("../../assets/images/health-quiz.png"),
      },
      {
        id: "5",
        title: "Managing Period Pain",
        description:
          "Evidence-based approaches to managing dysmenorrhea, including lifestyle changes and medical options.",
        type: "article",
        duration: "6 min read",
        image: require("../../assets/images/period-pain.png"),
      },
    ]

    setCategory(mockCategory)
    setTopics(mockTopics)
  }, [categoryId])

  const getCategoryTitle = (id: string): string => {
    const categories: Record<string, string> = {
      "1": "Menstrual Health",
      "2": "Contraception Methods",
      "3": "Hormonal Health",
      "4": "Reproductive Anatomy",
      "5": "Nutrition & Reproductive Health",
      "6": "Physical Activity",
      "7": "Sexual Health",
      "8": "Mental Wellness",
    }

    return categories[id] || "Educational Topics"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <BookOpen stroke={colors.teal} width={16} height={16} />
      case "video":
        return <Play stroke={colors.teal} width={16} height={16} />
      case "quiz":
        return <CheckCircle stroke={colors.teal} width={16} height={16} />
      default:
        return <BookOpen stroke={colors.teal} width={16} height={16} />
    }
  }

  const handleTopicPress = (topic: Topic) => {
    switch (topic.type) {
      case "article":
        router.push(ROUTES.MAIN.EDUCATION.ARTICLE(topic.id))
        break
      case "video":
        router.push(ROUTES.MAIN.EDUCATION.VIDEO(topic.id))
        break
      case "quiz":
        router.push(ROUTES.MAIN.EDUCATION.QUIZ(topic.id))
        break
    }
  }

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
        <Header title={t('common.loading')} showBackButton />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header title={t('education.menstrual_health')} showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.description, { color: colors.navyBlue }]}>{category.description}</Text>

        <View style={styles.topicsContainer}>
          {topics.map((topic) => (
            <Card
              key={topic.id}
              style={[styles.topicCard, { backgroundColor: colors.navyBlue }]}
              onPress={() => handleTopicPress(topic)}
            >
              <View style={styles.topicContent}>
                <Image source={topic.image} style={styles.topicImage} resizeMode="cover" />

                <View style={styles.topicInfo}>
                  <Text style={[styles.topicTitle, { color: colors.white }]}>{topic.title}</Text>
                  <Text style={[styles.topicDescription, { color: colors.lightGray }]} numberOfLines={2}>
                    {topic.description}
                  </Text>

                  <View style={styles.topicMeta}>
                    <View style={styles.typeContainer}>
                      {getTypeIcon(topic.type)}
                      <Text style={[styles.typeText, { color: colors.lightBlue }]}>
                        {t('education.' + topic.type.charAt(0).toLowerCase() + topic.type.slice(1))}
                      </Text>
                    </View>

                    <Text style={[styles.durationText, { color: colors.lightGray }]}>{topic.duration}</Text>
                  </View>
                </View>

                {topic.completed && (
                  <View style={[styles.completedBadge, { backgroundColor: colors.teal }]}>
                    <CheckCircle stroke={colors.white} width={12} height={12} />
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>
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
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  topicsContainer: {
    gap: 16,
  },
  topicCard: {
    padding: 0,
    overflow: "hidden",
  },
  topicContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  topicInfo: {
    flex: 1,
    padding: 12,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  topicMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  durationText: {
    fontSize: 12,
  },
  completedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
})

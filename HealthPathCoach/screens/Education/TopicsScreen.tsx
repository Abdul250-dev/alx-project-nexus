import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ChevronRight } from "react-native-feather"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { t } from "../../services/localizationService"
import { ROUTES } from "../../utils/constants"

type TopicCategory = {
  id: string
  title: string
  topics: number
  image: any
}

export default function TopicsScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const { colors } = useTheme()

  const categories: TopicCategory[] = [
    {
      id: "1",
      title: t("education.menstrual_health"),
      topics: 12,
      image: require("../../assets/images/menstrual-health.png"),
    },
    {
      id: "2",
      title: t("education.contraception"),
      topics: 11,
      image: require("../../assets/images/contraception.png"),
    },
    {
      id: "3",
      title: t("education.hormonal_health"),
      topics: 10,
      image: require("../../assets/images/hormonal-health.png"),
    },
    {
      id: "4",
      title: t("education.reproductive_anatomy"),
      topics: 6,
      image: require("../../assets/images/anatomy.png"),
    },
    {
      id: "5",
      title: t("education.nutrition"),
      topics: 9,
      image: require("../../assets/images/nutrition.png"),
    },
    {
      id: "6",
      title: t("education.physical_activity"),
      topics: 7,
      image: require("../../assets/images/physical-activity.png"),
    },
    {
      id: "7",
      title: t("education.sexual_health"),
      topics: 11,
      image: require("../../assets/images/sexual-health.png"),
    },
    {
      id: "8",
      title: t("education.mental_wellness"),
      topics: 8,
      image: require("../../assets/images/mental-wellness.png"),
    },
  ]

  const renderCategoryCard = (category: TopicCategory) => {
    // Special handling for contraception category
    if (category.id === "2") {
      return (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryCard, { backgroundColor: colors.navyBlue }]}
          onPress={() => router.push(ROUTES.MAIN.EDUCATION.CONTRACEPTION.GUIDE)}
        >
          <View style={styles.categoryContent}>
            <Image source={category.image} style={styles.categoryImage} resizeMode="cover" />

            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryTitle, { color: colors.white }]}>{category.title}</Text>
              <Text style={[styles.categoryTopics, { color: colors.lightBlue }]}>{category.topics} {t("education.topics")}</Text>
            </View>

            <ChevronRight stroke={colors.lightBlue} width={20} height={20} />
          </View>
        </TouchableOpacity>
      )
    }

    // Regular handling for other categories
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard, { backgroundColor: colors.navyBlue }]}
        onPress={() => router.push(ROUTES.MAIN.EDUCATION.TOPIC_DETAIL(category.id))}
      >
        <View style={styles.categoryContent}>
          <Image source={category.image} style={styles.categoryImage} resizeMode="cover" />

          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryTitle, { color: colors.white }]}>{category.title}</Text>
            <Text style={[styles.categoryTopics, { color: colors.lightBlue }]}>{category.topics} {t("education.topics")}</Text>
          </View>

          <ChevronRight stroke={colors.lightBlue} width={20} height={20} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <Header title={t("education.article") /* or t("education.topics") if you want "Educational Topics" */} showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.screenTitle, { color: colors.navyBlue }]}>{t("education.topics")}</Text>

        <View style={styles.categoriesContainer}>{categories.map((category) => renderCategoryCard(category))}</View>
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
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  categoriesContainer: {
    gap: 16,
  },
  categoryCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryTopics: {
    fontSize: 14,
  },
})

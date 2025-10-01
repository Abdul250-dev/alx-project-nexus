"use client"

import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ArrowLeft, Search } from "react-native-feather"
import { SafeAreaView } from "react-native-safe-area-context"
import AnimatedButton from "../../components/AnimatedButton"
import Card from "../../components/Card"
import { useTheme } from "../../components/theme-provider"
import { ROUTES } from "../../utils/constants"

type Article = {
  id: string
  title: string
  excerpt: string
  image: any
  category: string
  readTime: string
}

export default function ExploreArticlesScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const { colors } = useTheme()

  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  useEffect(() => {
    const mockFeaturedArticle = {
      id: "1",
      title: "Understanding Your Menstrual Cycle: A Guide to Reproductive Health",
      excerpt:
        "Learn about the four phases of your menstrual cycle, the hormonal changes that occur, and how to track your cycle for better reproductive health.",
      image: require("../../assets/images/featured-article.png"),
      category: "Reproductive Health",
      readTime: "5 min read",
    }

    const mockArticles = [
      {
        id: "2",
        title: "Nutrition for Hormonal Balance",
        excerpt:
          "Discover how specific nutrients like omega-3 fatty acids, B vitamins, and zinc can support hormonal balance throughout your cycle.",
        image: require("../../assets/images/nutrition-article.png"),
        category: "Nutrition",
        readTime: "4 min read",
      },
      {
        id: "3",
        title: "Understanding Contraception Methods",
        excerpt:
          "A comprehensive guide to different contraception methods including hormonal, barrier, and long-acting reversible options.",
        image: require("../../assets/images/contraception-article.png"),
        category: "Contraception",
        readTime: "6 min read",
      },
      {
        id: "4",
        title: "Managing Menstrual Pain Naturally",
        excerpt:
          "Evidence-based approaches to managing dysmenorrhea, including heat therapy, gentle exercise, and anti-inflammatory foods.",
        image: require("../../assets/images/period-pain-article.png"),
        category: "Menstrual Health",
        readTime: "3 min read",
      },
      {
        id: "5",
        title: "Exercise and Reproductive Health",
        excerpt:
          "How different types of physical activity affect your hormones, menstrual cycle, and overall reproductive wellness.",
        image: require("../../assets/images/exercise-article.png"),
        category: "Physical Activity",
        readTime: "4 min read",
      },
      {
        id: "6",
        title: "Mental Health and Your Cycle",
        excerpt:
          "Understanding the connection between hormonal fluctuations and mood changes, and strategies for emotional well-being.",
        image: require("../../assets/images/mental-health-article.png"),
        category: "Mental Wellness",
        readTime: "5 min read",
      },
    ]

    setFeaturedArticle(mockFeaturedArticle)
    setArticles(mockArticles)

    const allCategories = ["All", ...new Set(mockArticles.map((article) => article.category))]
    setCategories(allCategories)
  }, [])

  const handleArticlePress = (articleId: string) => {
    router.push(ROUTES.AUTH.SIGNUP)
  }

  const filteredArticles =
    selectedCategory === "All" ? articles : articles.filter((article) => article.category === selectedCategory)

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.navyBlue }}>
        <View style={[styles.header, { backgroundColor: colors.navyBlue }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft stroke={colors.white} width={24} height={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.white }]}>Health Articles</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search stroke={colors.white} width={24} height={24} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {featuredArticle && (
          <Card
            style={[styles.featuredCard, { backgroundColor: colors.navyBlue }]}
            onPress={() => handleArticlePress(featuredArticle.id)}
          >
            <Image source={featuredArticle.image} style={styles.featuredImage} resizeMode="cover" />
            <View style={styles.featuredContent}>
              <Text style={[styles.featuredCategory, { color: colors.teal }]}>{featuredArticle.category}</Text>
              <Text style={[styles.featuredTitle, { color: colors.white }]}>{featuredArticle.title}</Text>
              <Text style={[styles.featuredExcerpt, { color: colors.lightGray }]}>{featuredArticle.excerpt}</Text>
              <Text style={[styles.featuredReadTime, { color: colors.lightBlue }]}>{featuredArticle.readTime}</Text>
            </View>
          </Card>
        )}

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category ? colors.teal : colors.white,
                    borderColor: colors.lightGray,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category ? colors.white : colors.navyBlue },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.articlesContainer}>
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              style={[styles.articleCard, { backgroundColor: colors.white }]}
              onPress={() => handleArticlePress(article.id)}
            >
              <Image source={article.image} style={styles.articleImage} resizeMode="cover" />
              <View style={styles.articleContent}>
                <Text style={[styles.articleCategory, { color: colors.teal }]}>{article.category}</Text>
                <Text style={[styles.articleTitle, { color: colors.navyBlue }]}>{article.title}</Text>
                <Text style={[styles.articleExcerpt, { color: colors.gray }]} numberOfLines={2}>
                  {article.excerpt}
                </Text>
                <Text style={[styles.articleReadTime, { color: colors.teal }]}>{article.readTime}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.signupContainer}>
          <Text style={[styles.signupTitle, { color: colors.navyBlue }]}>Want to access all articles?</Text>
          <Text style={[styles.signupText, { color: colors.gray }]}>
            Sign up for a free account to access all articles and track your reproductive health.
          </Text>
          <AnimatedButton
            title="Sign Up"
            onPress={() => router.push(ROUTES.AUTH.SIGNUP)}
            style={styles.signupButton}
          />
          <Text style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.navyBlue }]}>Already have an account? </Text>
            <Text
              style={[styles.loginLink, { color: colors.teal }]}
              onPress={() => router.push(ROUTES.AUTH.LOGIN)}
            >
              Log In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  searchButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  featuredCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: 24,
  },
  featuredImage: {
    width: "100%",
    height: 200,
  },
  featuredContent: {
    padding: 16,
  },
  featuredCategory: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  featuredExcerpt: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  featuredReadTime: {
    fontSize: 12,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  articlesContainer: {
    marginBottom: 24,
  },
  articleCard: {
    flexDirection: "row",
    padding: 0,
    overflow: "hidden",
    marginBottom: 16,
  },
  articleImage: {
    width: 100,
    height: 100,
  },
  articleContent: {
    flex: 1,
    padding: 12,
  },
  articleCategory: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  articleExcerpt: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },
  articleReadTime: {
    fontSize: 12,
  },
  signupContainer: {
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  signupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  signupText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  signupButton: {
    width: "100%",
    marginBottom: 16,
  },
  loginContainer: {
    fontSize: 14,
    textAlign: "center",
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
})

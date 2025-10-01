import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Bookmark, Share2 } from "react-native-feather"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { t } from "../../services/localizationService"

interface ArticleScreenProps {
  articleId: string
}

export default function ArticleScreen({ articleId }: ArticleScreenProps) {
  const navigation = useNavigation()
  const { colors } = useTheme()

  const [article, setArticle] = useState<any>(null)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const mockArticle = {
      id: articleId,
      title: "Understanding Your Menstrual Cycle",
      author: "Dr. Sarah Johnson, Reproductive Health Specialist",
      date: "May 15, 2023",
      readTime: "5 min read",
      image: require("../../assets/images/menstrual-cycle.png"),
      content: [
        { type: "paragraph", text: "The menstrual cycle is a natural biological process..." },
        { type: "heading", text: "The Four Phases of the Menstrual Cycle" },
        { type: "paragraph", text: "The menstrual cycle consists of four main phases..." },
        { type: "subheading", text: "Menstruation (Days 1-5)" },
        { type: "paragraph", text: "Menstruation marks the beginning of your cycle..." },
        { type: "subheading", text: "Follicular Phase (Days 1-13)" },
        { type: "paragraph", text: "The follicular phase begins on the first day of menstruation..." },
        { type: "subheading", text: "Ovulation (Day 14)" },
        { type: "paragraph", text: "Ovulation occurs when the mature follicle releases an egg..." },
        { type: "subheading", text: "Luteal Phase (Days 15-28)" },
        { type: "paragraph", text: "After ovulation, the ruptured follicle transforms..." },
        { type: "heading", text: "Hormonal Changes Throughout the Cycle" },
        { type: "paragraph", text: "Four key hormones regulate the menstrual cycle..." },
        { type: "heading", text: "Tracking Your Cycle" },
        { type: "paragraph", text: "Tracking your menstrual cycle can provide insights..." },
        { type: "heading", text: "When to Consult a Healthcare Provider" },
        { type: "paragraph", text: "Certain changes might indicate an underlying issue..." },
      ],
    }

    setArticle(mockArticle)
  }, [articleId])

  const toggleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  const handleShare = () => {
    console.log("Share article")
  }

  if (!article) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title={t('common.loading')} showBackButton />
      </View>
    )
  }

  const renderContent = (item: any, index: number) => {
    switch (item.type) {
      case "heading":
        return <Text key={index} style={[styles.heading, { color: colors.text }]}>{item.text}</Text>
      case "subheading":
        return <Text key={index} style={[styles.subheading, { color: colors.teal }]}>{item.text}</Text>
      case "paragraph":
        return <Text key={index} style={[styles.paragraph, { color: colors.textSecondary }]}>{item.text}</Text>
      default:
        return null
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('education.article')}
        showBackButton
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleBookmark} style={styles.headerButton}>
              <Bookmark
                stroke={bookmarked ? colors.teal : colors.text}
                fill={bookmarked ? colors.teal : "transparent"}
                width={24}
                height={24}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Share2 stroke={colors.text} width={24} height={24} />
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={article.image} style={styles.articleImage} resizeMode="cover" />
        <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
        <View style={styles.metaContainer}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{t('education.by_author', { author: article.author })}</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{article.date}</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{article.readTime}</Text>
        </View>
        <View style={styles.contentContainer}>{article.content.map(renderContent)}</View>
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
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 16,
  },
  articleImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  metaText: {
    fontSize: 14,
    marginRight: 8,
  },
  contentContainer: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 16,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
})

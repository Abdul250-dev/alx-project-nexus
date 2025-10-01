import { useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ChevronDown, ChevronUp } from "react-native-feather"
import { useTheme } from "./theme-provider"

type FAQItem = {
  question: string
  answer: string
}

type FAQAccordionProps = {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const { colors } = useTheme()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[
            styles.itemContainer,
            { backgroundColor: colors.white, borderColor: colors.lightGray },
            index === items.length - 1 && { marginBottom: 0 },
          ]}
        >
          <TouchableOpacity style={styles.questionContainer} onPress={() => toggleItem(index)} activeOpacity={0.7}>
            <Text style={[styles.question, { color: colors.navyBlue }]}>{item.question}</Text>
            {expandedIndex === index ? (
              <ChevronUp stroke={colors.teal} width={20} height={20} />
            ) : (
              <ChevronDown stroke={colors.teal} width={20} height={20} />
            )}
          </TouchableOpacity>

          {expandedIndex === index && (
            <View style={[styles.answerContainer, { borderTopColor: colors.lightGray }]}>
              <Text style={[styles.answer, { color: colors.gray }]}>{item.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  itemContainer: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
  },
})

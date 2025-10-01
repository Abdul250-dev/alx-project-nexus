import { View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import ArticleScreen from "../../../../screens/Education/ArticleScreen"

export default function Article() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={{ flex: 1 }}>
      <ArticleScreen articleId={id} />
    </View>
  )
}

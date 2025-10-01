import { View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import TopicDetail from "../../../../screens/Education/TopicDetail"

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={{ flex: 1 }}>
      <TopicDetail topicId={id} />
    </View>
  )
}

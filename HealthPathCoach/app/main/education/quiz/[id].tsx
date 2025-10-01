import { View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import QuizScreen from "../../../../screens/Education/QuizScreen"

export default function Quiz() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={{ flex: 1 }}>
      <QuizScreen topicId={id} />
    </View>
  )
}

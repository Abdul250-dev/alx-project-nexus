import { View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import ContraceptionDetailScreen from "../../../../screens/Education/ContraceptionDetailScreen"

export default function ContraceptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={{ flex: 1 }}>
      <ContraceptionDetailScreen methodId={id} />
    </View>
  )
}

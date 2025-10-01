import { Redirect } from "expo-router"

// Redirect to the topics screen by default
export default function EducationIndex() {
  return <Redirect href="/main/education/topics" />
}

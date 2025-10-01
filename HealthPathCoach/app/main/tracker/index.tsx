import { Redirect } from "expo-router"

// Redirect to the menstrual tracker by default
export default function TrackerIndex() {
  return <Redirect href="/main/tracker/menstrual" />
}

export { default as ActivitiesTracker } from '../../../screens/Tracker/ActivitiesTracker'


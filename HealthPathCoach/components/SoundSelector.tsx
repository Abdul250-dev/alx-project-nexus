"use client"

import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Check } from "react-native-feather"
import { NOTIFICATION_SOUNDS } from "../utils/notificationSounds"
import { useTheme } from "./theme-provider"

interface SoundSelectorProps {
  selectedSoundId: string
  onSelectSound: (soundId: string) => void
}

export default function SoundSelector({ selectedSoundId, onSelectSound }: SoundSelectorProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      {NOTIFICATION_SOUNDS.map((soundOption) => (
        <TouchableOpacity
          key={soundOption.id}
          style={[
            styles.soundOption,
            {
              backgroundColor: selectedSoundId === soundOption.id ? colors.teal + "20" : colors.white,
              borderColor: selectedSoundId === soundOption.id ? colors.teal : colors.lightGray,
            },
          ]}
          onPress={() => onSelectSound(soundOption.id)}
        >
          <View style={styles.soundInfo}>
            <Text style={[styles.soundName, { color: colors.navyBlue }]}>{soundOption.name}</Text>
            {selectedSoundId === soundOption.id && (
              <Check stroke={colors.teal} width={16} height={16} style={styles.checkIcon} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  soundOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  soundInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  soundName: {
    fontSize: 16,
    fontWeight: "500",
  },
  checkIcon: {
    marginLeft: 8,
  },
})

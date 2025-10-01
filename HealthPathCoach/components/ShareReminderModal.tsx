import { Check, Share2, X } from "lucide-react-native"
import type React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useAuth } from "../context/AuthContext"
import type { Reminder } from "../models/Reminder"
import { shareReminder } from "../services/reminderService"
import { getPartners, type Partner } from "../services/userService"
import { useTheme } from "./theme-provider"

interface ShareReminderModalProps {
  visible: boolean
  onClose: () => void
  reminder: Reminder
  onShareComplete: () => void
}

export const ShareReminderModal: React.FC<ShareReminderModalProps> = ({
  visible,
  onClose,
  reminder,
  onShareComplete,
}) => {
  const { colors: theme } = useTheme()
  const { user } = useAuth()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (visible && user) {
      loadPartners()
    }
  }, [visible, user])

  const loadPartners = async () => {
    try {
      setLoading(true)
      const userPartners = await getPartners(user?.uid ?? "")
      setPartners(userPartners)
    } catch (error) {
      console.error("Error loading partners:", error)
      Alert.alert("Error", "Failed to load partners. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const togglePartnerSelection = (partnerId: string) => {
    if (selectedPartners.includes(partnerId)) {
      setSelectedPartners(selectedPartners.filter((id) => id !== partnerId))
    } else {
      setSelectedPartners([...selectedPartners, partnerId])
    }
  }

  const handleShare = async () => {
    if (selectedPartners.length === 0) {
      Alert.alert("No Partners Selected", "Please select at least one partner to share with.")
      return
    }

    try {
      setSharing(true)

      // Share with each selected partner
      for (const partnerId of selectedPartners) {
        await shareReminder(reminder.id, user?.uid ?? "", partnerId)
      }

      Alert.alert(
        "Reminder Shared",
        `Reminder successfully shared with ${selectedPartners.length} partner${selectedPartners.length > 1 ? "s" : ""}.`,
      )

      onShareComplete()
      onClose()
    } catch (error) {
      console.error("Error sharing reminder:", error)
      Alert.alert("Error", "Failed to share reminder. Please try again.")
    } finally {
      setSharing(false)
    }
  }

  const renderPartnerItem = ({ item }: { item: Partner }) => (
    <TouchableOpacity
      style={[
        styles.partnerItem,
        { backgroundColor: theme.cardBackground },
        selectedPartners.includes(item.id) && { backgroundColor: theme.accentLight },
      ]}
      onPress={() => togglePartnerSelection(item.id)}
    >
      <Text style={[styles.partnerName, { color: theme.text }]}>{item.name || item.email}</Text>
      {selectedPartners.includes(item.id) && <Check color={theme.accent} size={20} />}
    </TouchableOpacity>
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Share Reminder</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={theme.text} size={24} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.reminderTitle, { color: theme.text }]}>{reminder.title}</Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Select partners to share with:</Text>

          {loading ? (
            <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
          ) : partners.length > 0 ? (
            <FlatList
              data={partners}
              renderItem={renderPartnerItem}
              keyExtractor={(item) => item.id}
              style={styles.partnerList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No partners found. Add partners in your profile to share reminders.
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.accent }]}
              onPress={handleShare}
              disabled={sharing || selectedPartners.length === 0}
            >
              {sharing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Share2 color="#fff" size={18} style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
  },
  loader: {
    marginVertical: 20,
  },
  partnerList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  partnerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 150,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
})

export default ShareReminderModal

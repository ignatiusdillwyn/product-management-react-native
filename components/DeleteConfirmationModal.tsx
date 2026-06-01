import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface DeleteConfirmationModal {
  visible: boolean;
  title: string;
  message: string;
  buttonConfirmText: string;
  buttonCancelText?: string;
  onDelete: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  visible,
  title,
  message,
  buttonConfirmText,
  buttonCancelText,
  onDelete,
  onCancel
}: DeleteConfirmationModal) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={70} color="#4CAF50" />
          </View>
          
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <TouchableOpacity style={styles.modalButton} onPress={onDelete}>
            <Text style={styles.modalButtonText}>{buttonConfirmText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.modalButtonText}>{buttonCancelText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    marginTop: 12,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
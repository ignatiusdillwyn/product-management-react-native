import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            try {
              // Hapus token dari SecureStore
              await SecureStore.deleteItemAsync("userToken");
              // Redirect ke halaman login
              router.replace("/login");
            } catch (error) {
              Alert.alert("Error", "Terjadi kesalahan saat logout");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selamat Datang! 👋</Text>
        <Text style={styles.subtitle}>Halaman Home</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dashboard</Text>
          <Text style={styles.cardText}>
            Ini adalah halaman utama setelah login.
          </Text>
          <Text style={styles.cardText}>
            Anda berhasil masuk ke aplikasi!
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e0e0e0",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    margin: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
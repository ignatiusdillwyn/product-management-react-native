import { Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin logout?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            // Hapus token
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
            console.log('Token dihapus');
            
            // Redirect ke login
            router.replace("/login");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>🏠 Home</Text>
          <Text style={{ fontSize: 16, color: "#666", marginTop: 5 }}>
            Selamat datang di aplikasi!
          </Text>
        </View>

        {/* Card Info */}
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            marginBottom: 20,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Dashboard
          </Text>
          <Text style={{ fontSize: 14, color: "#555" }}>
            Ini adalah halaman utama setelah login. Silakan jelajahi fitur-fitur yang tersedia.
          </Text>
        </View>

        {/* Card Stats */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#4CAF50",
              padding: 15,
              borderRadius: 10,
              marginRight: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
              10
            </Text>
            <Text style={{ color: "white", marginTop: 5 }}>Items</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#2196F3",
              padding: 15,
              borderRadius: 10,
              marginLeft: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
              5
            </Text>
            <Text style={{ color: "white", marginTop: 5 }}>Users</Text>
          </View>
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#ff4444",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
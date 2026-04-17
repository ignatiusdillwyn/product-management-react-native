import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { login } from "../services/userAPI";
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validasi input
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi!");
      return;
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Format email tidak valid!");
      return;
    }

    setIsLoading(true);

    try {
      // Panggil API login dari service
      const response = await login({ email, password });
      
      console.log('Login response:', response);
      
      // Cek response status
      if (response.status === 200 && response.user?.token) {
        // Simpan token ke SecureStore
        await SecureStore.setItemAsync('userToken', response.user.token);
        
        // Simpan juga data user jika diperlukan
        await SecureStore.setItemAsync('userData', JSON.stringify({
          id: response.user.id,
          email: response.user.email,
        }));
        
        // Tampilkan pesan sukses
        Alert.alert("Sukses", response.message || "Login berhasil!");
        
        // Redirect ke halaman home
        router.replace("/home");
      } else {
        // Jika response tidak sesuai yang diharapkan
        Alert.alert("Login Gagal", response.message || "Terjadi kesalahan, silakan coba lagi");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle berbagai jenis error
      if (error.code === 'ECONNABORTED') {
        Alert.alert("Error", "Koneksi timeout. Server tidak merespon.");
      } else if (error.message === 'Network Error') {
        Alert.alert(
          "Koneksi Gagal",
          "Tidak dapat terhubung ke server. Pastikan:\n\n" +
          "1. Server backend berjalan\n" +
          "2. URL API sudah benar\n" +
          "3. Perangkat terhubung ke jaringan yang sama\n\n" +
          `URL yang digunakan: ${error.config?.url || 'tidak diketahui'}`
        );
      } else if (error.response?.status === 401) {
        Alert.alert("Login Gagal", "Email atau password salah!");
      } else if (error.response?.status === 404) {
        Alert.alert("Error", "Endpoint API tidak ditemukan. Periksa URL backend.");
      } else {
        Alert.alert(
          "Error", 
          error.response?.data?.message || "Terjadi kesalahan saat login. Silakan coba lagi."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Silakan masuk untuk melanjutkan</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="contoh@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Masukkan password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  eyeButton: {
    marginHorizontal: 12,
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
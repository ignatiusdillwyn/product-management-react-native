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
  ScrollView,
} from "react-native";
import { register } from "../services/userAPI";
import { Ionicons } from '@expo/vector-icons';
import SuccessModal from "../components/SuccessModal";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleRegister = async () => {
    // Validasi semua field harus diisi
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Semua field harus diisi!");
      return;
    }

    // Validasi username minimal 3 karakter
    if (username.length < 3) {
      Alert.alert("Error", "Username minimal 3 karakter!");
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Format email tidak valid!");
      return;
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter!");
      return;
    }

    // Validasi password dan confirm password harus sama
    if (password !== confirmPassword) {
      Alert.alert("Error", "Password dan Konfirmasi Password tidak sama!");
      return;
    }

    setIsLoading(true);

    try {
      // Panggil API register dari service
      const response = await register({ 
        username, 
        email, 
        password 
      });
      
      console.log('Register response:', response);
      
      // Cek response status (sesuaikan dengan response API Anda)
      if (response.status === 200 || response.status === 201) {
        // Tampilkan modal sukses
        setModalMessage(response.message || "Registrasi berhasil! Silakan login.");
        setShowSuccessModal(true);
      } else {
        // Jika response tidak sesuai yang diharapkan
        Alert.alert("Registrasi Gagal", response.message || "Terjadi kesalahan, silakan coba lagi");
      }
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Handle berbagai jenis error
      if (error.code === 'ECONNABORTED') {
        Alert.alert("Error", "Koneksi timeout. Server tidak merespon.");
      } else if (error.message === 'Network Error') {
        Alert.alert(
          "Koneksi Gagal",
          "Tidak dapat terhubung ke server. Pastikan:\n\n" +
          "1. Server backend berjalan\n" +
          "2. URL API sudah benar\n" +
          "3. Perangkat terhubung ke jaringan yang sama"
        );
      } else if (error.response?.status === 400) {
        Alert.alert("Registrasi Gagal", error.response?.data?.message || "Data tidak valid. Periksa kembali input Anda.");
      } else if (error.response?.status === 409) {
        Alert.alert("Registrasi Gagal", "Email atau username sudah terdaftar!");
      } else {
        Alert.alert(
          "Error", 
          error.response?.data?.message || "Terjadi kesalahan saat registrasi. Silakan coba lagi."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Redirect ke halaman login setelah modal ditutup
    setTimeout(() => {
      router.push("/login");
    }, 100);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Daftar Akun</Text>
            <Text style={styles.subtitle}>Buat akun baru untuk melanjutkan</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

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
                  placeholder="Masukkan password (min. 6 karakter)"
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Daftar</Text>
              )}
            </TouchableOpacity>

            {/* Tombol Kembali ke Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push("/login");
                }}
                disabled={isLoading}
              >
                <Text style={styles.loginLink}>Masuk Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal Success */}
      <SuccessModal
        visible={showSuccessModal}
        title="Registrasi Berhasil! 🎉"
        message={modalMessage}
        buttonText="Login Sekarang"
        onClose={handleModalClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
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
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
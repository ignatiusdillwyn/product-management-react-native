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
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState({
    errorUsername: "",
    errorEmail: "",
    errorPassword: "",
    errorConfirmPassword: "",
  });

  const handleRegister = async () => {
    // Reset error messages
    setErrorMessage({
      errorUsername: "",
      errorEmail: "",
      errorPassword: "",
      errorConfirmPassword: "",
    });

    // Validasi username
    if (!username) {
      setErrorMessage(prev => ({ ...prev, errorUsername: "Username tidak boleh kosong" }));
      return;
    }

    if (username.length < 3) {
      setErrorMessage(prev => ({ ...prev, errorUsername: "Username minimal 3 karakter!" }));
      return;
    }

    // Validasi email
    if (!email) {
      setErrorMessage(prev => ({ ...prev, errorEmail: "Email tidak boleh kosong" }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(prev => ({ ...prev, errorEmail: "Format email tidak valid!" }));
      return;
    }

    // Validasi password
    if (!password) {
      setErrorMessage(prev => ({ ...prev, errorPassword: "Password tidak boleh kosong" }));
      return;
    }

    if (password.length < 6) {
      setErrorMessage(prev => ({ ...prev, errorPassword: "Password minimal 6 karakter!" }));
      return;
    }

    // Validasi confirm password
    if (!confirmPassword) {
      setErrorMessage(prev => ({ ...prev, errorConfirmPassword: "Konfirmasi password tidak boleh kosong" }));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(prev => ({ ...prev, errorConfirmPassword: "Password dan Konfirmasi Password tidak sama!" }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({ 
        username, 
        email, 
        password 
      });
      
      console.log('Register response:', response);
      
      if (response.status === 200 || response.status === 201) {
        setModalMessage(response.message || "Registrasi berhasil! Silakan login.");
        setShowSuccessModal(true);
      } else {
        Alert.alert("Registrasi Gagal", response.message || "Terjadi kesalahan, silakan coba lagi");
      }
    } catch (error: any) {
      console.error('Register error:', error);
      
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
    setTimeout(() => {
      router.push("/login");
    }, 100);
  };

  return (
    <>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {/* Tombol Toggle Theme */}
            <View style={styles.themeButtonContainer}>
              <ThemeToggle />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Daftar Akun</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Buat akun baru untuk melanjutkan
            </Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Username</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.background, 
                    borderColor: errorMessage.errorUsername ? colors.error : colors.border,
                    color: colors.text 
                  }
                ]}
                placeholder="Masukkan username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrorMessage(prev => ({ ...prev, errorUsername: "" }));
                }}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errorMessage.errorUsername ? (
                <Text style={[styles.error, { color: colors.error }]}>{errorMessage.errorUsername}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.background, 
                    borderColor: errorMessage.errorEmail ? colors.error : colors.border,
                    color: colors.text 
                  }
                ]}
                placeholder="contoh@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage(prev => ({ ...prev, errorEmail: "" }));
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
              {errorMessage.errorEmail ? (
                <Text style={[styles.error, { color: colors.error }]}>{errorMessage.errorEmail}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View style={[
                styles.passwordContainer, 
                { 
                  backgroundColor: colors.background, 
                  borderColor: errorMessage.errorPassword ? colors.error : colors.border 
                }
              ]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Masukkan password (min. 6 karakter)"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage(prev => ({ ...prev, errorPassword: "" }));
                  }}
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
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>
              {errorMessage.errorPassword ? (
                <Text style={[styles.error, { color: colors.error }]}>{errorMessage.errorPassword}</Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Konfirmasi Password</Text>
              <View style={[
                styles.passwordContainer, 
                { 
                  backgroundColor: colors.background, 
                  borderColor: errorMessage.errorConfirmPassword ? colors.error : colors.border 
                }
              ]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Ulangi password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrorMessage(prev => ({ ...prev, errorConfirmPassword: "" }));
                  }}
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
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>
              {errorMessage.errorConfirmPassword ? (
                <Text style={[styles.error, { color: colors.error }]}>{errorMessage.errorConfirmPassword}</Text>
              ) : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.button, 
                { backgroundColor: colors.primary }, 
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Daftar</Text>
              )}
            </TouchableOpacity>

            {/* Link to Login */}
            <View style={[styles.loginContainer, { borderTopColor: colors.border }]}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>Sudah punya akun? </Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                disabled={isLoading}
              >
                <Text style={[styles.loginLink, { color: colors.primary }]}>Masuk Sekarang</Text>
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
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
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
  themeButtonContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
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
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
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
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
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
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const router = useRouter();
  // Ambil colors dan theme dari context untuk dark/light mode
  const { colors, toggleTheme, theme } = useTheme();
  
  // State untuk form input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk menyimpan pesan error per field
  // Menggunakan object agar bisa menampilkan error berbeda untuk setiap field
  const [errorMessage, setErrorMessage] = useState({
    errorEmail: "",
    errorPassword: "",
  });

  const handleLogin = async () => {
    // Reset semua error messages terlebih dahulu
    setErrorMessage({ errorEmail: "", errorPassword: "" });
    
    // Validasi email kosong
    if (!email) {
      // Menggunakan prev => untuk mempertahankan property lain (errorPassword)
      // ...prev berfungsi menyebarkan nilai error yang sudah ada
      setErrorMessage(prev => ({ ...prev, errorEmail: "Email tidak boleh kosong" }));
      return;
    }
    
    // Validasi password kosong
    if (!password) {
      setErrorMessage(prev => ({ ...prev, errorPassword: "Password tidak boleh kosong" }));
      return;
    }

    // Validasi format email menggunakan regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(prev => ({ ...prev, errorEmail: "Format email tidak valid!" }));
      return;
    }

    // Mulai loading state
    setIsLoading(true);

    try {
      // Panggil API login dari service
      const response = await login({ email, password });
      
      // Cek response status dan token
      if (response.status === 200 && response.user?.token) {
        // Simpan token ke SecureStore untuk autentikasi berikutnya
        await SecureStore.setItemAsync('userToken', response.user.token);
        
        // Simpan data user untuk keperluan lain (opsional)
        await SecureStore.setItemAsync('userData', JSON.stringify({
          id: response.user.id,
          email: response.user.email,
        }));
        
        // Tampilkan pesan sukses
        Alert.alert("Sukses", response.message || "Login berhasil!");
        
        // Redirect ke halaman home, replace agar tidak bisa back ke login
        router.replace("/home");
      } else {
        Alert.alert("Login Gagal", response.message || "Terjadi kesalahan, silakan coba lagi");
      }
    } catch (error: any) {
      // Handle berbagai jenis error dari network/API
      if (error.code === 'ECONNABORTED') {
        Alert.alert("Error", "Koneksi timeout. Server tidak merespon.");
      } else if (error.message === 'Network Error') {
        Alert.alert("Koneksi Gagal", "Tidak dapat terhubung ke server.");
      } else if (error.response?.status === 401) {
        Alert.alert("Login Gagal", "Email atau password salah!");
      } else {
        Alert.alert("Error", "Terjadi kesalahan saat login.");
      }
    } finally {
      // Matikan loading state
      setIsLoading(false);
    }
  };

  return (
    // Background mengikuti tema (light: #f5f5f5, dark: #121212)
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Card container dengan warna dari tema */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        
        {/* Tombol Toggle Theme - beralih antara light/dark mode */}
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Ionicons 
            // Icon berubah sesuai tema: moon untuk light mode, sun untuk dark mode
            name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>

        {/* Judul dengan warna dari tema */}
        <Text style={[styles.title, { color: colors.text }]}>Login</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Silakan masuk untuk melanjutkan
        </Text>

        {/* Input Email */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background, 
              borderColor: colors.border, 
              color: colors.text 
            }]}
            placeholder="contoh@email.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              // Reset error email saat user mulai mengetik (user experience)
              setErrorMessage(prev => ({ ...prev, errorEmail: "" }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          {/* Tampilkan pesan error email jika ada */}
          {errorMessage.errorEmail ? <Text style={[styles.error, { color: colors.error }]}>{errorMessage.errorEmail}</Text> : null}
        </View>

        {/* Input Password */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <View style={[styles.passwordContainer, { 
            backgroundColor: colors.background, 
            borderColor: colors.border 
          }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              placeholder="Masukkan password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                // Reset error password saat user mulai mengetik
                setErrorMessage(prev => ({ ...prev, errorPassword: "" }));
              }}
              // secureTextEntry membuat teks menjadi bullet (●●●)
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            {/* Tombol show/hide password */}
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Ionicons
                // Icon berubah antara eye (lihat) dan eye-off (sembunyi)
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>
          {/* Tampilkan pesan error password jika ada */}
          {errorMessage.errorPassword ? <Text style={[styles.error, { color: colors.error }]}>{errorMessage.errorPassword}</Text> : null}
        </View>

        {/* Tombol Login */}
        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: colors.primary 
          }, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            // Tampilkan loading indicator saat proses login
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>

        {/* Link ke halaman Register */}
        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: colors.textSecondary }]}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => router.push("/register")} disabled={isLoading}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Daftar Sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                    // Memenuhi seluruh layar
    justifyContent: "center",   // Konten di tengah vertikal
    alignItems: "center",       // Konten di tengah horizontal
    padding: 20,
  },
  card: {
    borderRadius: 12,           // Sudut membulat
    padding: 24,
    width: "100%",              // Lebar penuh
    maxWidth: 400,              // Maksimal lebar 400px (bagus untuk tablet)
    // Shadow untuk efek card (iOS)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,               // Shadow untuk Android
  },
  themeButton: {
    position: 'absolute',       // Posisi absolut di dalam card
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,                  // Agar di atas elemen lain
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 20,              // Memberi ruang untuk tombol theme di atas
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,           // Jarak antar input field
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
    flexDirection: "row",       // TextInput dan tombol dalam satu baris
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,                    // Mengambil sisa ruang
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
    opacity: 0.6,               // Efek transparan saat disabled
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
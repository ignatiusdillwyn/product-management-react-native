import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "../services/userAPI";
import * as SecureStore from 'expo-secure-store';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      console.log("Login response:", response);
      
      // Simpan token menggunakan SecureStore
      if (response && response.user && response.user.token) {
        await SecureStore.setItemAsync('userToken', response.user.token);
        console.log('Token tersimpan ', response.user.token);
      }
      
      // Simpan data user (SecureStore hanya untuk string)
      if (response.user) {
        await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
      }
      
      Alert.alert("Sukses", "Login berhasil!", [
        { text: "OK", onPress: () => router.replace("/home") }
      ]);
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Error", error.response?.data?.message || "Login gagal!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", justifyContent: "center", padding: 20 }}>
      <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, elevation: 3 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30 }}>
          Login
        </Text>

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 12,
            borderRadius: 8,
            marginBottom: 15,
            fontSize: 16,
          }}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 16,
          }}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#999" : "blue",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
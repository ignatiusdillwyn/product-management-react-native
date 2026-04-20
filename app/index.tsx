import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Tunggu navigasi siap
    if (!rootNavigationState?.key) return;

    // Fungsi untuk cek status login
    const checkAuthStatus = async () => {
      try {
        // Cek apakah ada token login
        const userToken = await SecureStore.getItemAsync('userToken');
        console.log('userToken ', userToken);
        
        console.log('Token ditemukan:', userToken ? 'Ya' : 'Tidak');
        
        if (userToken) {
          // Sudah login → langsung ke home
          console.log('User sudah login, redirect ke /home');
          router.replace('/home');
        } else {
          // Belum login → ke halaman login
          console.log('User belum login, redirect ke /login');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error cek status login:', error);
        // Jika error, tetap ke login untuk amannya
        router.replace('/login');
      }
    };

    setTimeout(() => {}, 3000000); // Simulasi delay untuk melihat loading screen

    checkAuthStatus();
  }, [rootNavigationState?.key]);

  // Tampilkan loading screen sambil mengecek status login
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10, color: "#666" }}>Memeriksa status login...</Text>
    </View>
  );
}
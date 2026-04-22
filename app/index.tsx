import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const checkAuthStatus = async () => {
      try {
        const userToken = await SecureStore.getItemAsync('userToken');
        
        if (userToken) {
          // Redirect ke tabs (tanpa kurung)
          router.replace('/tabs/home' as any);
        } else {
          router.replace('/login' as any);
        }
      } catch (error) {
        console.error('Error cek status login:', error);
        router.replace('/login' as any);
      }
    };

    checkAuthStatus();
  }, [rootNavigationState?.key]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10, color: "#666" }}>Memeriksa status login...</Text>
    </View>
  );
}
import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Tunggu sampai navigasi siap
    if (!rootNavigationState?.key) return;
    
    // Cek apakah user sudah login atau belum
    // Untuk sementara langsung redirect ke login
    router.replace('/login');
  }, [rootNavigationState?.key]);

  // Tampilkan loading indicator sambil menunggu navigasi siap
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="blue" />
    </View>
  );
}
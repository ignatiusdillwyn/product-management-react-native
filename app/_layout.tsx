import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          title: "Login"
        }} 
      />
      <Stack.Screen 
        name="home" 
        options={{ 
          headerShown: true,
          title: "Beranda",
          headerBackVisible: false // Mencegah kembali ke login
        }} 
      />
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
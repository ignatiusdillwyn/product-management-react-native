import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: "Splash" 
        }} 
      />
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
          headerShown: false,
          title: "Home" 
        }} 
      />
    </Stack>
  );
}
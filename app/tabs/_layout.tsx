import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            // screenOptions: konfigurasi yang berlaku untuk SEMUA tab
            screenOptions={{
                // Warna icon dan teks saat tab dalam keadaan AKTIF (ditekan)
                tabBarActiveTintColor: '#007AFF', // Biru khas iOS
                
                // Warna icon dan teks saat tab dalam keadaan TIDAK AKTIF
                tabBarInactiveTintColor: '#8E8E93', // Abu-abu iOS
                
                // Styling untuk bottom tab bar
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',     // Warna background putih
                    borderTopWidth: 1,              // Tebal garis batas atas
                    borderTopColor: '#E5E5EA',     // Warna garis batas atas (abu-abu muda)
                    height: 60,                     // Tinggi tab bar
                    paddingBottom: 8,               // Jarak bawah konten
                    paddingTop: 8,                  // Jarak atas konten
                },
                
                // Styling untuk label teks di bawah icon
                tabBarLabelStyle: {
                    fontSize: 12,                   // Ukuran font teks
                    fontWeight: '500',              // Ketebalan font (medium)
                },
                
                // Sembunyikan header bawaan dari setiap halaman
                headerShown: false,
            }}
        >
            {/* TAB 1: HOME */}
            {/* name="home" artinya file home.tsx di dalam folder tabs yang akan dirender */}
            <Tabs.Screen
                name="home"
                options={{
                    // Judul yang muncul di bawah icon
                    title: 'Home',
                    // Fungsi untuk menampilkan icon
                    // focused: true/false apakah tab ini sedang aktif
                    // color: warna dari tabBarActiveTintColor atau tabBarInactiveTintColor
                    // size: ukuran icon
                    tabBarIcon: ({ focused, color, size }) => (
                        // Icon home berubah bentuk saat aktif (filled) atau tidak aktif (outline)
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            
            {/* TAB 2: SETTINGS */}
            {/* name="settings" artinya file settings.tsx di dalam folder tabs */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ focused, color, size }) => (
                        // Icon gear/setting - berubah bentuk saat aktif/tidak aktif
                        <Ionicons
                            name={focused ? 'settings' : 'settings-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

        </Tabs>
    );
}
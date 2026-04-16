import axios from "axios";
import Constants from 'expo-constants';

// Ambil URL dari extra config di app.json
const { VITE_USER_API } = Constants.expoConfig?.extra || {};

const URL = VITE_USER_API || "http://192.168.1.9:3000/api/users"; // Fallback URL

console.log('=== API Configuration ===');
console.log('Base URL:', URL);
console.log('Full Login URL:', `${URL}/login`);
console.log('========================');

const login = async (payload) => {
    console.log('Login payload:', payload);
    
    try {
        const response = await axios.post(`${URL}/login`, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
        });
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('=== Login Error Details ===');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Request URL:', error.config?.url);
        console.error('Request method:', error.config?.method);
        
        if (error.code === 'ECONNABORTED') {
            console.error('Error: Connection timeout - Server tidak merespon');
        } else if (error.message === 'Network Error') {
            console.error('Error: Network Error - Pastikan:');
            console.error('1. Server backend berjalan di http://localhost:3000');
            console.error('2. Untuk Android emulator gunakan http://10.0.2.2:3000');
            console.error('3. Untuk device fisik gunakan IP komputer (contoh: http://192.168.1.100:3000)');
            console.error('4. Tidak ada firewall yang memblokir port 3000');
        }
        
        throw error;
    }
};

const register = async (payload) => {
    console.log('Register payload:', payload);
    try {
        const response = await axios.post(`${URL}/create`, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        console.log('Register response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Register error:', error.message);
        throw error;
    }
};

export { register, login };
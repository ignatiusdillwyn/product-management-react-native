import * as SecureStore from 'expo-secure-store';

const getToken = async () => {
    try {
        const token = await SecureStore.getItemAsync('userToken');
        console.log('User token:', token);
        return token;
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
}

export {getToken}
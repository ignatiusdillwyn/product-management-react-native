import axios from "axios";
import Constants from 'expo-constants';

// Ambil URL dari extra config di app.json
const { VITE_PRODUCT_API } = Constants.expoConfig?.extra || {};

const URL = VITE_PRODUCT_API || "http://192.168.1.9:3000/api/products"; // Fallback URL

const addProduct = async (payload, token) => {
    const response = await axios.post(`${URL}/create`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'access_token': token // token dari parameter atau state
        }
    });
    return response.data;
};

const fetchAllProduct = async (token) => {
    const response = await axios.get(`${URL}/getAll`, {
        headers: {
            'Content-Type': 'application/json',
            'access_token': token // token dari parameter atau state
        }
    });
    return response.data;
};

const updateProduct = async (id, payload, token) => {
    const response = await axios.put(`${URL}/edit/${id}`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'access_token': token // token dari parameter atau state
        }
    });
    return response.data;
};

const deleteProduct = async (id, token) => {
    const response = await axios.delete(`${URL}/delete/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'access_token': token // token dari parameter atau state
        }
    });
    return response.data;
};

const searchProduct = async (name,token) => {
    const response = await axios.get(`${URL}/search/${name}`, {
        headers: {
            'Content-Type': 'application/json',
            'access_token': token // token dari parameter atau state
        }
    });
    return response.data;
};

const updateProductImage = async (id, imageFile, token) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile); // Field name harus 'image'

        const response = await axios.put(
            `${URL}/updateProductImage/${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'access_token': token
                }
            }
        );

        return response.data;
    } catch (error) {
        throw error;
    }
};


export { addProduct, fetchAllProduct, updateProduct, deleteProduct, searchProduct, updateProductImage };

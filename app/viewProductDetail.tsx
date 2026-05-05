import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, useWindowDimensions, FlatList, Button, ScrollView, } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchAllProduct, searchProduct, addProduct, deleteProduct, updateProduct } from '../services/productAPI.js';
import * as SecureStore from 'expo-secure-store';
import { getToken } from '../utils.js'
import SuccessModal from "../components/SuccessModal";

const viewProductDetail = () => {
  const router = useRouter();

  // TERIMA PARAMETER
  const params = useLocalSearchParams();
  const { product } = params;

  const parsedProductData = typeof product === 'string' ? JSON.parse(product) : null;

  console.log('Parsed product data:', parsedProductData);

  const [productData, setProductData] = useState(parsedProductData);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleUpdateProduct = async () => {
    let token = await getToken();
    let response = await updateProduct(productData.id, productData, token);

    console.log('Update product response:', response);

    setModalMessage("Product updated successfully!");
    setShowSuccessModal(true);

    // router.replace('/tabs/viewProduct');
  }

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Redirect ke halaman login setelah modal ditutup
    setTimeout(() => {
      router.push("/tabs/viewProduct");
    }, 100);
  };

  return (
    <>
      <View style={{ marginTop: 40, backgroundColor: 'yellow', justifyContent: 'space-between', flexDirection: 'column', height: 780 }}>
        <View style={{ backgroundColor: 'red' }}>
          <View style={{ backgroundColor: '', marginTop: 25, marginHorizontal: 10 }}>
            <Text style={{ marginBottom: 5 }}>Product Name</Text>
            <TextInput
              style={{ backgroundColor: 'white', borderRadius: 10, padding: 12, borderColor: '#E5E5EA', borderWidth: 1 }}
              value={productData?.name}
              onChangeText={(text) => setProductData({ ...productData, name: text })}
              placeholder="Product Name..."
            />
          </View>

          <View style={{ backgroundColor: '', marginTop: 25, marginHorizontal: 10 }}>
            <Text style={{ marginBottom: 5 }}>Product Description</Text>
            <TextInput
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: 12,
                borderColor: '#E5E5EA',
                borderWidth: 1,
                height: 120,
                fontSize: 16,
                color: '#000000',
                textAlignVertical: 'top', // Agar teks dimulai dari atas ketika multiline
              }}
              value={productData?.description}
              onChangeText={(text) => setProductData({ ...productData, description: text })}
              placeholder="Product Description..."
              placeholderTextColor="#999"
              multiline={true} //Agar text input bisa terima lebih dari satu baris
              numberOfLines={4}
            />
          </View>

          <View style={{ backgroundColor: '', marginTop: 25, marginHorizontal: 10 }}>
            <Text style={{ marginBottom: 5 }}>Product Quantity</Text>
            <TextInput
              style={{ backgroundColor: 'white', borderRadius: 10, padding: 12, borderColor: '#E5E5EA', borderWidth: 1 }}
              value={productData?.qty.toString()}
              onChangeText={(text) => setProductData({ ...productData, qty: parseInt(text) })}
              placeholder="Product Quantity..."
            />
          </View>

          {/* <View style={{ backgroundColor: 'green', marginTop: 25, flexDirection:'row', justifyContent: 'space-around' }}>
            <View style = {{}}>
              <Text style={{ marginBottom: 5 }}>RT</Text>
              <TextInput
                style={{ backgroundColor: 'white', borderRadius: 10, padding: 12, borderColor: '#E5E5EA', borderWidth: 1, width: 170 }}
                value={productData?.qty.toString()}
                onChangeText={(text) => setProductData({ ...productData, qty: parseInt(text) })}
                placeholder="Product Quantity..."
              />
            </View>
            <View style = {{}}>
              <Text style={{ marginBottom: 5 }}>RW</Text>
              <TextInput
                style={{ backgroundColor: 'white', borderRadius: 10, padding: 12, borderColor: '#E5E5EA', borderWidth: 1, width: 170 }}
                value={productData?.qty.toString()}
                onChangeText={(text) => setProductData({ ...productData, qty: parseInt(text) })}
                placeholder="Product Quantity..."
              />
            </View>
          </View> */}
        </View>

        <TouchableOpacity
          style={{
            height: 60,
            borderRadius: 15,
            marginHorizontal: 20,
            backgroundColor: 'blue',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={handleUpdateProduct}
        >
          <Text>Update</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Success */}
      <SuccessModal
        visible={showSuccessModal}
        title="Update Berhasil! 🎉"
        message={modalMessage}
        buttonText="Ok"
        onClose={handleModalClose}
      />
    </>
  )
}

export default viewProductDetail

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, useWindowDimensions, FlatList, Button, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchAllProduct, searchProduct, addProduct, deleteProduct, updateProduct } from '../services/productAPI.js';

const viewProductDetail = () => {

  // TERIMA PARAMETER
  const params = useLocalSearchParams();
  const { product } = params;

  const parsedProductData = typeof product === 'string' ? JSON.parse(product) : null;

  console.log('Parsed product data:', parsedProductData);

  const [productData, setProductData] = useState(parsedProductData);

  useEffect(() => {

  }, [])


  return (
    <View style={{ marginTop: 40, backgroundColor: 'yellow' }}>
      <ScrollView style={{ height: 700 }}>
        <View style={{ backgroundColor: 'grey' }}>
          <TextInput
            value={productData?.name}
            onChangeText={(text) => setProductData({ ...productData, name: text })}
            placeholder="Product Name"
          />
        </View>

        <View style={{ backgroundColor: 'grey' }}>
          <TextInput
            value={productData?.description}
            onChangeText={(text) => setProductData({ ...productData, description: text })}
            placeholder="Product Description"
          />
        </View>

        <View style={{ backgroundColor: 'grey' }}>
          <TextInput
            value={productData?.qty}
            onChangeText={(text) => setProductData({ ...productData, qty: text })}
            placeholder="Product Quantity"
          />
        </View>
      </ScrollView>

      <View style = {{ marginTop: 30}}>
        <Button
          title='Update'
        />
      </View>

    </View>

  )
}

export default viewProductDetail

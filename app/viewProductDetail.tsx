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
    <View style={{ marginTop: 40, backgroundColor: 'yellow', justifyContent: 'space-between', flexDirection: 'column',  height: 800}}>
      <View style={{ backgroundColor: 'red' }}>
        <View style={{ backgroundColor: '', marginTop: 25, marginHorizontal: 10 }}>
          <Text style = {{marginBottom: 5}}>Name</Text>
          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 5, padding: 10, borderColor: 'black', borderWidth: 1 }}
            value={productData?.name}
            onChangeText={(text) => setProductData({ ...productData, name: text })}
            placeholder="Product Name"
          />
        </View>

        <View style={{ backgroundColor: '', marginTop: 25, marginHorizontal: 10 }}>
          <Text style = {{marginBottom: 5}}>Name</Text>
          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 5, padding: 10, borderColor: 'black', borderWidth: 1 }}
            value={productData?.description}
            onChangeText={(text) => setProductData({ ...productData, description: text })}
            placeholder="Product Name"
          />
        </View>

        <View style={{ backgroundColor: '', marginTop: 25, marginHorizontal: 10 }}>
          <Text style = {{marginBottom: 5}}>Name</Text>
          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 5, padding: 10, borderColor: 'black', borderWidth: 1 }}
            value={productData?.qty.toString()}
            onChangeText={(text) => setProductData({ ...productData, qty: parseInt(text) })}
            placeholder="Product Name"
          />
        </View>
      </View>

      <View style={{ width: 300, marginHorizontal: 40, marginBottom: 30, height: 40}}>
        <Button
          onPress={() => {console.log('press')}}
          title='Update'
        />
      </View>

    </View>

  )
}

export default viewProductDetail

import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, useWindowDimensions, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllProduct, searchProduct } from '../../services/productAPI.js';
import { useEffect, useState } from 'react';

export default function ViewProductScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();

  // TERIMA PARAMETER
  const params = useLocalSearchParams();
  const { productId, productName, price } = params;

  console.log('Received params:', params);

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin logout?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('userToken');
            router.replace('/login');
          },
        },
      ]
    );
  };

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

  const getAllProducts = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fetchAllProduct(token);
      console.log('All products:', response);
      setProducts(response.products);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  const handleSearch = async (query: any) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      getAllProducts();
      return;
    }

    console.log('Search query:', query);
    const token = await getToken();
    const response = await searchProduct(query, token);

    console.log('Search response:', response);

    if (response) {
      setProducts(response.products);
    }
  }

  const toDetailProduct = (product: any) => {
    router.push({
      pathname: '../viewProductDetail',
      params: {
        product: JSON.stringify(product)
      }
    })
  }

  const renderProduct = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity onPress={() => { toDetailProduct(item) }} style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc', width: 350, backgroundColor: '#5ED7EB', marginTop: 20, borderRadius: 10 }} >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ color: '#666' }}>Stock: {item.qty}</Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: '#666' }}>Rp {item.price.toLocaleString("id-ID")}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    if (products.length == 0) {
      console.log('produk kosong');
    }
    getAllProducts();
  }, [])


  return (
    <View style={styles.container}>
      <View style={{ marginTop: 80, backgroundColor: 'grey' }}>
        <TextInput
          style={{ height: 50 }}
          placeholder='Search'
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {isLoading ? <Text>Loading</Text> :
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={{ alignItems: 'center' }}
          ListEmptyComponent={() => {
            return (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#666' }}>No products found.</Text>
              </View>
            );
          }}
        />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
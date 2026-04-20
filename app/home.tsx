import { useState, useCallback, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from '@expo/vector-icons';
import {
  fetchAllProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
} from "../services/productAPI";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  qty?: number;
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form states
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productQty, setProductQty] = useState("");

  // Get token
  const getToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        router.replace("/login");
        return null;
      }
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Load all products
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetchAllProduct(token);
      console.log("API Response:", response);

      // Cek berbagai kemungkinan struktur response
      let productsData = [];
      if (response && response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response && response.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else if (response && response.result && Array.isArray(response.result)) {
        productsData = response.result;
      } else {
        console.log("Response structure:", JSON.stringify(response));
        productsData = [];
      }
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      console.log(`Berhasil memuat ${productsData.length} produk`);
    } catch (error: any) {
      console.error("Error loadProducts:", error);
      Alert.alert("Error", "Gagal memuat produk");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search products
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === "") {
      // Jika search kosong, tampilkan semua produk
      setFilteredProducts(products);
      return;
    }

    setIsSearching(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await searchProduct(text, token);
      console.log("Search response:", response);

      // Cek struktur response search
      let searchResults = [];
      if (response && response.data && Array.isArray(response.data)) {
        searchResults = response.data;
      } else if (Array.isArray(response)) {
        searchResults = response;
      } else if (response && response.products && Array.isArray(response.products)) {
        searchResults = response.products;
      } else {
        searchResults = [];
      }

      setFilteredProducts(searchResults);
      console.log(`Ditemukan ${searchResults.length} produk untuk "${text}"`);
    } catch (error: any) {
      console.error("Search error:", error);
      // Fallback: search lokal
      const localResults = products.filter(product =>
        product.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(localResults);
      Alert.alert("Info", `Ditemukan ${localResults.length} produk (pencarian lokal)`);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredProducts(products);
  };

  // Add product
  const handleAddProduct = async () => {
    if (!productName || !productPrice) {
      Alert.alert("Error", "Nama dan harga harus diisi!");
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const payload = {
        name: productName,
        price: parseInt(productPrice),
        description: productDescription,
        qty: productQty ? parseInt(productQty) : 0,
      };

      const response = await addProduct(payload, token);
      console.log("Add response:", response);

      if (response) {
        Alert.alert("Sukses", "Produk berhasil ditambahkan");
        closeModal();
        await loadProducts(); // Refresh data
        // Clear search jika ada
        if (searchQuery) {
          setSearchQuery("");
        }
      } else {
        Alert.alert("Error", response?.message || "Gagal menambah produk");
      }
    } catch (error: any) {
      console.error("Error add product:", error);
      Alert.alert("Error", error?.response?.data?.message || "Terjadi kesalahan saat menambah produk");
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!productName || !productPrice || !selectedProduct) {
      Alert.alert("Error", "Nama dan harga harus diisi!");
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const payload = {
        name: productName,
        price: parseInt(productPrice),
        description: productDescription,
        qty: productQty ? parseInt(productQty) : 0,
      };

      const response = await updateProduct(selectedProduct.id, payload, token);
      console.log("Update response:", response);

      if (response) {
        Alert.alert("Sukses", "Produk berhasil diupdate");
        closeModal();
        await loadProducts(); // Refresh data
        // Clear search jika ada
        if (searchQuery) {
          setSearchQuery("");
        }
      } else {
        Alert.alert("Error", response?.message || "Gagal update produk");
      }
    } catch (error: any) {
      console.error("Error update product:", error);
      Alert.alert("Error", error?.response?.data?.message || "Terjadi kesalahan saat update produk");
    }
  };

  // Delete product
  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Konfirmasi",
      `Apakah Anda yakin ingin menghapus produk "${product.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;

              const response = await deleteProduct(product.id, token);
              console.log("Delete response:", response);

              if (response) {
                Alert.alert("Sukses", "Produk berhasil dihapus");
                await loadProducts(); // Refresh data
                // Clear search jika ada
                if (searchQuery) {
                  setSearchQuery("");
                }
              } else {
                Alert.alert("Error", response?.message || "Gagal hapus produk");
              }
            } catch (error: any) {
              console.error("Error delete product:", error);
              Alert.alert("Error", error?.response?.data?.message || "Terjadi kesalahan saat hapus produk");
            }
          },
        },
      ]
    );
  };

  // Open modal for edit
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductDescription(product.description || "");
    setProductQty(product.qty?.toString() || "");
    setIsEditing(true);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setSelectedProduct(null);
    setProductName("");
    setProductPrice("");
    setProductDescription("");
    setProductQty("");
  };

  // Logout
  const handleLogout = async () => {
    Alert.alert(
      "Konfirmasi",
      "Yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userData");
            router.replace("/login");
          },
        },
      ]
    );
  };

  // Load data when screen focused
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  // Render product item
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Rp {item.price.toLocaleString()}</Text>
        {item.description ? (
          <Text style={styles.productDesc}>{item.description}</Text>
        ) : null}
        {item.qty !== undefined && (
          <Text style={styles.productQty}>Stok: {item.qty}</Text>
        )}
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manajemen Produk</Text>
          <Text style={styles.headerSubtitle}>
            {searchQuery ? `Hasil: ${filteredProducts.length} produk` : `Total: ${products.length} produk`}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk berdasarkan nama..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
        {isSearching && (
          <ActivityIndicator size="small" color="#007AFF" style={styles.searchLoading} />
        )}
      </View>

      {/* Tombol Tambah */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsEditing(false);
          setSelectedProduct(null);
          setProductName("");
          setProductPrice("");
          setProductDescription("");
          setProductQty("");
          setModalVisible(true);
        }}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Tambah Produk Baru</Text>
      </TouchableOpacity>

      {/* List Produk */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
              </Text>
              <Text style={styles.emptySubText}>
                {searchQuery 
                  ? `Tidak ada produk dengan nama "${searchQuery}"`
                  : "Klik tombol + untuk menambah"}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Produk" : "Tambah Produk"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Produk *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Baju Kemeja"
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Harga *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 50000"
                  value={productPrice}
                  onChangeText={setProductPrice}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Stok</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 10"
                  value={productQty}
                  onChangeText={setProductQty}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Deskripsi</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Deskripsi produk..."
                  value={productDescription}
                  onChangeText={setProductDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={isEditing ? handleUpdateProduct : handleAddProduct}
              >
                <Text style={styles.saveButtonText}>
                  {isEditing ? "Update Produk" : "Simpan Produk"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#e0e0e0",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchLoading: {
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  productQty: {
    fontSize: 12,
    color: "#4CAF50",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  editBtn: {
    backgroundColor: "#FFA500",
  },
  deleteBtn: {
    backgroundColor: "#FF3B30",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
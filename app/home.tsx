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
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  fetchAllProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
} from "../services/productAPI";

// Interface untuk tipe data Product
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  qty?: number;
}

export default function Home() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  
  // State untuk data produk
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // State untuk modal form
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // State untuk form input
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productQty, setProductQty] = useState("");
  
  // State untuk error validasi
  const [errorMessage, setErrorMessage] = useState({
    errorName: "",
    errorPrice: "",
  });

  // Get token dari SecureStore
  const getToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        Alert.alert("Error", "Token tidak ditemukan. Silakan login kembali.");
        router.replace("/login");
        return null;
      }
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Load semua produk dari API
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetchAllProduct(token);
      console.log("API Response:", response);

      // Menyesuaikan dengan struktur response API
      let productsData = [];
      if (response && response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response && response.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else {
        productsData = [];
      }
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      console.log(`Berhasil memuat ${productsData.length} produk`);
    } catch (error: any) {
      console.error("Error loadProducts:", error);
      Alert.alert("Error", "Gagal memuat produk");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh produk (untuk pull to refresh)
  const refreshProducts = async () => {
    setRefreshing(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetchAllProduct(token);
      let productsData = [];
      if (response && response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response && response.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else {
        productsData = [];
      }
      
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Search produk berdasarkan nama
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === "") {
      setFilteredProducts(products);
      return;
    }

    setIsSearching(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await searchProduct(text, token);
      console.log("Search response:", response);

      let searchResults = [];
      if (response && response.data && Array.isArray(response.data)) {
        searchResults = response.data;
      } else if (Array.isArray(response)) {
        searchResults = response;
      } else {
        searchResults = [];
      }

      setFilteredProducts(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback ke pencarian lokal
      const localResults = products.filter(product =>
        product.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(localResults);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredProducts(products);
  };

  // Handle tambah/edit produk
  const handleSaveProduct = async () => {
    // Reset error
    setErrorMessage({ errorName: "", errorPrice: "" });
    
    // Validasi nama produk
    if (!productName) {
      setErrorMessage(prev => ({ ...prev, errorName: "Nama produk tidak boleh kosong" }));
      return;
    }
    
    // Validasi harga
    if (!productPrice) {
      setErrorMessage(prev => ({ ...prev, errorPrice: "Harga tidak boleh kosong" }));
      return;
    }

    const price = parseInt(productPrice);
    if (isNaN(price) || price <= 0) {
      setErrorMessage(prev => ({ ...prev, errorPrice: "Harga harus berupa angka positif" }));
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const payload = {
        name: productName,
        price: price,
        description: productDescription,
        qty: productQty ? parseInt(productQty) : 0,
      };

      let response;
      if (isEditing && selectedProduct) {
        // Update produk
        response = await updateProduct(selectedProduct.id, payload, token);
        console.log("Update response:", response);
      } else {
        // Tambah produk baru
        response = await addProduct(payload, token);
        console.log("Add response:", response);
      }

      if (response) {
        Alert.alert("Sukses", `Produk berhasil ${isEditing ? "diupdate" : "ditambahkan"}`);
        closeModal();
        await loadProducts(); // Refresh data
        if (searchQuery) clearSearch(); // Clear search jika ada
      } else {
        Alert.alert("Error", response?.message || "Gagal menyimpan produk");
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      Alert.alert("Error", error?.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle hapus produk
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
                if (searchQuery) clearSearch(); // Clear search jika ada
              } else {
                Alert.alert("Error", response?.message || "Gagal hapus produk");
              }
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Terjadi kesalahan saat menghapus produk");
            }
          },
        },
      ]
    );
  };

  // Buka modal untuk edit produk
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductDescription(product.description || "");
    setProductQty(product.qty?.toString() || "");
    setIsEditing(true);
    setModalVisible(true);
  };

  // Buka modal untuk tambah produk baru
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setProductName("");
    setProductPrice("");
    setProductDescription("");
    setProductQty("");
    setErrorMessage({ errorName: "", errorPrice: "" });
    setModalVisible(true);
  };

  // Tutup modal dan reset form
  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setSelectedProduct(null);
    setProductName("");
    setProductPrice("");
    setProductDescription("");
    setProductQty("");
    setErrorMessage({ errorName: "", errorPrice: "" });
  };

  // Load data saat screen di-focus
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  // Render item produk
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, { backgroundColor: colors.card }]}>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          Rp {item.price.toLocaleString()}
        </Text>
        {item.description ? (
          <Text style={[styles.productDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        {item.qty !== undefined && (
          <Text style={[styles.productQty, { color: colors.success }]}>
            Stok: {item.qty}
          </Text>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header dengan tombol theme */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          Manajemen Produk
        </Text>
        <ThemeToggle />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cari produk berdasarkan nama..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
        {isSearching && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoading} />
        )}
      </View>

      {/* Tombol Tambah Produk */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={openAddModal}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Tambah Produk Baru</Text>
      </TouchableOpacity>

      {/* List Produk */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat produk...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshProducts}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={60} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
              </Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                {searchQuery 
                  ? `Tidak ada produk dengan nama "${searchQuery}"`
                  : "Tekan tombol + untuk menambah produk"}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal Form Tambah/Edit Produk */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Input Nama Produk */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Nama Produk *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.background, 
                      borderColor: errorMessage.errorName ? colors.error : colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="Contoh: Baju Kemeja"
                  placeholderTextColor={colors.textSecondary}
                  value={productName}
                  onChangeText={(text) => {
                    setProductName(text);
                    setErrorMessage(prev => ({ ...prev, errorName: "" }));
                  }}
                />
                {errorMessage.errorName ? (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage.errorName}</Text>
                ) : null}
              </View>

              {/* Input Harga */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Harga *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.background, 
                      borderColor: errorMessage.errorPrice ? colors.error : colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="Contoh: 50000"
                  placeholderTextColor={colors.textSecondary}
                  value={productPrice}
                  onChangeText={(text) => {
                    setProductPrice(text);
                    setErrorMessage(prev => ({ ...prev, errorPrice: "" }));
                  }}
                  keyboardType="numeric"
                />
                {errorMessage.errorPrice ? (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage.errorPrice}</Text>
                ) : null}
              </View>

              {/* Input Stok */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Stok</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="Contoh: 10"
                  placeholderTextColor={colors.textSecondary}
                  value={productQty}
                  onChangeText={setProductQty}
                  keyboardType="numeric"
                />
              </View>

              {/* Input Deskripsi */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Deskripsi</Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.textArea, 
                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }
                  ]}
                  placeholder="Deskripsi produk..."
                  placeholderTextColor={colors.textSecondary}
                  value={productDescription}
                  onChangeText={setProductDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Tombol Simpan */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveProduct}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditing ? "Update Produk" : "Simpan Produk"}
                  </Text>
                )}
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
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
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
  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  // List Content
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  // Product Card
  productCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    marginBottom: 2,
  },
  productQty: {
    fontSize: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#FFA500',
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
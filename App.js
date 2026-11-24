
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ===================================
// 1. KONFIGURASI NOMOR WHATSAPP TOKO
// ===================================

const WHATSAPP_NUMBERS = {
  "Karang Emas": "6287715780938",
  "Subur Jaya Santan": "6287715780938",
};

// ===================================
// 2. DATA PRODUK SEMENTARA
// ===================================

const PRODUCTS = [
  {
    id: "1",
    name: "Ikan Segar 1 Kg",
    brand: "Karang Emas",
    category: "Pangan Laut",
    price: 75000,
    description: "Ikan segar berkualitas untuk kebutuhan memasak.",
  },
  {
    id: "2",
    name: "Amplang 250 gr",
    brand: "Karang Emas",
    category: "Cemilan",
    price: 30000,
    description: "Amplang berkualitas untuk dinikmati.",
  },
  {
    id: "3",
    name: "Amplang 500 gr",
    brand: "Karang Emas",
    category: "Cemilan",
    price: 50000,
    description: "Amplang berkualitas untuk dinikmati.",
  },
  {
    id: "4",
    name: "Amplang 1 Kg",
    brand: "Karang Emas",
    category: "Cemilan",
    price: 100000,
    description: "Amplang berkualitas untuk dinikmati.",
  },
  {
    id: "7",
    name: "Santan Segar 250 ml",
    brand: "Subur Jaya Santan",
    category: "Santan",
    price: 8000,
    description: "Santan segar untuk berbagai masakan.",
  },
  {
    id: "8",
    name: "Santan Segar 500 ml",
    brand: "Subur Jaya Santan",
    category: "Santan",
    price: 15000,
    description: "Santan segar ukuran 500 ml.",
  },
  {
    id: "9",
    name: "Kelapa Parut 1 Butir",
    brand: "Subur Jaya Santan",
    category: "Kelapa",
    price: 12000,
    description: "Kelapa parut untuk kebutuhan memasak.",
  },
  {
    id: "10",
    name: "Santan Kental 1 Liter",
    brand: "Subur Jaya Santan",
    category: "Santan",
    price: 28000,
    description: "Santan kental untuk berbagai olahan makanan.",
  },
  {
    id: "11",
    name: "Minyak Kelapa 500 ml",
    brand: "Subur Jaya Santan",
    category: "Kelapa",
    price: 25000,
    description: "Minyak kelapa ukuran 500 ml.",
  },
  {
    id: "12",
    name: "Kelapa Utuh",
    brand: "Subur Jaya Santan",
    category: "Kelapa",
    price: 10000,
    description: "Kelapa utuh untuk kebutuhan rumah tangga.",
  },
];

const formatRupiah = (number) =>
  "Rp" + number.toLocaleString("id-ID");

// ===================================
// 3. KOMPONEN UTAMA
// ===================================

export default function App() {
  const [activeTab, setActiveTab] = useState("Beranda");
  const [selectedBrand, setSelectedBrand] = useState("Semua");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  // ===================================
  // 4. FILTER PRODUK
  // ===================================

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchBrand =
        selectedBrand === "Semua" ||
        product.brand === selectedBrand;

      return matchSearch && matchBrand;
    });
  }, [search, selectedBrand]);

  // ===================================
  // 5. SISTEM KERANJANG
  // ===================================

  const addToCart = (product) => {
    setCart((previous) => ({
      ...previous,
      [product.id]: (previous[product.id] || 0) + 1,
    }));
  };

  const decreaseCart = (productId) => {
    setCart((previous) => {
      const updated = { ...previous };

      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }

      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setCart((previous) => {
      const updated = { ...previous };
      delete updated[productId];
      return updated;
    });
  };

  const cartItems = PRODUCTS.filter(
    (product) => cart[product.id] > 0
  );

  const totalItems = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (total, product) =>
      total + product.price * cart[product.id],
    0
  );

  // ===================================
  // 6. KELOMPOKKAN PESANAN PER TOKO
  // ===================================

  const groupedOrders = {
    "Karang Emas": cartItems.filter(
      (item) => item.brand === "Karang Emas"
    ),
    "Subur Jaya Santan": cartItems.filter(
      (item) => item.brand === "Subur Jaya Santan"
    ),
  };

  // ===================================
  // 7. KIRIM PESANAN WHATSAPP
  // ===================================

  const sendWhatsAppOrder = async (brand) => {
    if (!customerName || !customerPhone || !customerAddress) {
      Alert.alert(
        "Data belum lengkap",
        "Silakan lengkapi nama, nomor telepon, dan alamat."
      );
      return;
    }

    const items = groupedOrders[brand];

    if (!items || items.length === 0) {
      Alert.alert("Informasi", "Tidak ada produk dari toko ini.");
      return;
    }

    const number = WHATSAPP_NUMBERS[brand];

    if (!number || number.includes("x")) {
      Alert.alert(
        "Nomor WhatsApp belum diatur",
        "Silakan isi nomor WhatsApp toko pada bagian WHATSAPP_NUMBERS di App.js."
      );
      return;
    }

    const orderDetails = items
      .map((item, index) => {
        const quantity = cart[item.id];
        const subtotal = item.price * quantity;

        return (
          `${index + 1}. ${item.name}\n` +
          `   ${quantity} x ${formatRupiah(item.price)}\n` +
          `   Subtotal: ${formatRupiah(subtotal)}`
        );
      })
      .join("\n\n");

    const orderTotal = items.reduce(
      (total, item) =>
        total + item.price * cart[item.id],
      0
    );

    const message =
      `HALO ${brand.toUpperCase()}\n\n` +
      `Saya ingin melakukan pemesanan:\n\n` +
      `${orderDetails}\n\n` +
      `Total: ${formatRupiah(orderTotal)}\n\n` +
      `DATA PELANGGAN\n` +
      `Nama: ${customerName}\n` +
      `No. HP: ${customerPhone}\n` +
      `Alamat: ${customerAddress}\n` +
      `Catatan: ${customerNote || "-"}\n\n` +
      `Mohon konfirmasi pesanan saya. Terima kasih.`;

    const url =
      `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        "Gagal membuka WhatsApp",
        "Pastikan WhatsApp tersedia pada perangkat."
      );
    }
  };

  // ===================================
  // 8. KOMPONEN TOMBOL KATEGORI
  // ===================================

  const BrandButton = ({ title }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedBrand === title && styles.filterActive,
      ]}
      onPress={() => setSelectedBrand(title)}
    >
      <Text
        style={[
          styles.filterText,
          selectedBrand === title && styles.filterTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  // ===================================
  // 9. TAMPILAN KARTU PRODUK
  // ===================================

  const ProductCard = ({ product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => setSelectedProduct(product)}
      activeOpacity={0.85}
    >
      <View style={styles.productImage}>
        <Ionicons
          name="image-outline"
          size={42}
          color="#A5A0B8"
        />
        <Text style={styles.imageLabel}>Foto Produk</Text>
      </View>

      <Text style={styles.brandLabel}>{product.brand}</Text>

      <Text style={styles.productName}>
        {product.name}
      </Text>

      <Text style={styles.productPrice}>
        {formatRupiah(product.price)}
      </Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addToCart(product)}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Keranjang</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ===================================
  // 10. HALAMAN BERANDA DAN PRODUK
  // ===================================

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={["#7561C9", "#A394E9"]}
        style={styles.banner}
      >
        <Text style={styles.bannerSmall}>
          SELAMAT DATANG
        </Text>

        <Text style={styles.bannerTitle}>
          Karang Emas &{"\n"}Subur Jaya Santan
        </Text>

        <Text style={styles.bannerDescription}>
          Belanja kebutuhan harian lebih mudah dalam satu aplikasi.
        </Text>

        <TouchableOpacity
          style={styles.bannerButton}
          onPress={() => setActiveTab("Produk")}
        >
          <Text style={styles.bannerButtonText}>
            Mulai Belanja
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Pilihan Toko
        </Text>
      </View>


    <View style={styles.shopContainer}>
      <TouchableOpacity
        style={styles.shopCard}
        onPress={() => {
          setSelectedBrand("Karang Emas");
          setActiveTab("Produk");
        }}
      >
        <Image
          source={require("./assets/mitra/kerang-emas.png")}
          style={styles.mitraLogo}
          resizeMode="contain"
        />
        <Text style={styles.shopTitle}>Kerang Emas</Text>
        <Text style={styles.shopSubtitle}>Kelompok Nelayan</Text>
        <Text style={styles.shopSubtitle}>Lihat produk</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.shopCard}
        onPress={() => {
          setSelectedBrand("Subur Jaya Santan");
          setActiveTab("Produk");
        }}
      >
        <Image
          source={require("./assets/mitra/subur-jaya.png")}
          style={styles.mitraLogo}
          resizeMode="contain"
        />
        <Text style={styles.shopTitle}>Subur Jaya</Text>
        <Text style={styles.shopSubtitle}>Kelompok Tani</Text>
        <Text style={styles.shopSubtitle}>Lihat produk</Text>
      </TouchableOpacity>
    </View>


      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Produk Pilihan
        </Text>

        <TouchableOpacity
          onPress={() => setActiveTab("Produk")}
        >
          <Text style={styles.seeAll}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productGrid}>
        {PRODUCTS.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </ScrollView>
  );

  const renderProducts = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Katalog Produk</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Cari nama produk..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <BrandButton title="Semua" />
        <BrandButton title="Karang Emas" />
        <BrandButton title="Subur Jaya Santan" />
      </ScrollView>

      <View style={styles.productGrid}>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>

      {filteredProducts.length === 0 && (
        <Text style={styles.emptyText}>
          Produk tidak ditemukan.
        </Text>
      )}
    </ScrollView>
  );

  // ===================================
  // 11. HALAMAN KERANJANG
  // ===================================

  const renderCart = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Keranjang Belanja</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Ionicons
            name="cart-outline"
            size={70}
            color="#B7B1C9"
          />
          <Text style={styles.emptyTitle}>
            Keranjang masih kosong
          </Text>
          <Text style={styles.emptyText}>
            Silakan pilih produk terlebih dahulu.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setActiveTab("Produk")}
          >
            <Text style={styles.primaryButtonText}>
              Mulai Belanja
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {cartItems.map((product) => (
            <View key={product.id} style={styles.cartCard}>
              <View style={styles.cartImage}>
                <Ionicons
                  name="image-outline"
                  size={28}
                  color="#A5A0B8"
                />
              </View>

              <View style={styles.cartInfo}>
                <Text style={styles.brandLabel}>
                  {product.brand}
                </Text>

                <Text style={styles.cartName}>
                  {product.name}
                </Text>

                <Text style={styles.productPrice}>
                  {formatRupiah(product.price)}
                </Text>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => decreaseCart(product.id)}
                  >
                    <Ionicons name="remove" size={18} color="#7561C9" />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>
                    {cart[product.id]}
                  </Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => addToCart(product)}
                  >
                    <Ionicons name="add" size={18} color="#7561C9" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => removeFromCart(product.id)}
              >
                <Ionicons name="trash-outline" size={22} color="#E35D6A" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              Ringkasan Belanja
            </Text>

            <View style={styles.summaryRow}>
              <Text>Total Produk</Text>
              <Text>{totalItems} item</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text>Total Pembayaran</Text>
              <Text style={styles.totalPrice}>
                {formatRupiah(totalPrice)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setCheckoutVisible(true)}
            >
              <Text style={styles.primaryButtonText}>
                Lanjut ke Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  // ===================================
  // 12. HALAMAN TENTANG
  // ===================================

  const renderAbout = () => (
    <View style={styles.aboutContainer}>
      <View style={styles.aboutLogo}>
        <Ionicons name="storefront" size={50} color="#7561C9" />
      </View>

      <Text style={styles.aboutTitle}>
        Karang Emas &{"\n"}Subur Jaya Santan
      </Text>

      <Text style={styles.aboutDescription}>
        Satu aplikasi untuk memudahkan pelanggan
        menemukan dan memesan produk dari kedua toko.
      </Text>

      <View style={styles.aboutInfo}>
        <Text style={styles.aboutInfoTitle}>Informasi Aplikasi</Text>
        <Text style={styles.aboutInfoText}>Versi: 1.0.0</Text>
        <Text style={styles.aboutInfoText}>
          Platform: Mobile Application
        </Text>
        <Text style={styles.aboutInfoText}>
          Layanan: Katalog dan pemesanan produk
        </Text>
      </View>
    </View>
  );

  // ===================================
  // 13. TAMPILAN UTAMA
  // ===================================

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#7561C9"
        barStyle="light-content"
      />

      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSmall}>
            SELAMAT DATANG DI
          </Text>
          <Text style={styles.headerTitle}>
            KosaBangsa
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerCart}
          onPress={() => setActiveTab("Keranjang")}
        >
          <Ionicons name="cart-outline" size={25} color="#FFFFFF" />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {totalItems}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === "Beranda" && renderHome()}
        {activeTab === "Produk" && renderProducts()}
        {activeTab === "Keranjang" && renderCart()}
        {activeTab === "Tentang" && renderAbout()}
      </View>

      {/* NAVIGASI BAWAH */}

      <View style={styles.bottomNav}>
        {[
          { name: "Beranda", icon: "home-outline" },
          { name: "Produk", icon: "grid-outline" },
          { name: "Keranjang", icon: "cart-outline" },
          { name: "Tentang", icon: "information-circle-outline" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.name)}
          >
            <Ionicons
              name={tab.icon}
              size={23}
              color={activeTab === tab.name ? "#7561C9" : "#9993A8"}
            />
            <Text
              style={[
                styles.navText,
                activeTab === tab.name && styles.navTextActive,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MODAL DETAIL PRODUK */}

      <Modal
        visible={!!selectedProduct}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedProduct(null)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            {selectedProduct && (
              <>
                <View style={styles.detailImage}>
                  <Ionicons
                    name="image-outline"
                    size={65}
                    color="#A5A0B8"
                  />
                  <Text style={styles.imageLabel}>Foto Produk</Text>
                </View>

                <Text style={styles.brandLabel}>
                  {selectedProduct.brand}
                </Text>

                <Text style={styles.detailTitle}>
                  {selectedProduct.name}
                </Text>

                <Text style={styles.productPrice}>
                  {formatRupiah(selectedProduct.price)}
                </Text>

                <Text style={styles.detailDescription}>
                  {selectedProduct.description}
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                    Alert.alert(
                      "Berhasil",
                      "Produk ditambahkan ke keranjang."
                    );
                  }}
                >
                  <Text style={styles.primaryButtonText}>
                    Tambahkan ke Keranjang
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL CHECKOUT */}

      <Modal
        visible={checkoutVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.checkoutCard}>
            <View style={styles.checkoutHeader}>
              <Text style={styles.checkoutTitle}>
                Checkout Pesanan
              </Text>

              <TouchableOpacity
                onPress={() => setCheckoutVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nama Lengkap *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Masukkan nama Anda"
                value={customerName}
                onChangeText={setCustomerName}
              />

              <Text style={styles.inputLabel}>Nomor Telepon *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Contoh: 081234567890"
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={setCustomerPhone}
              />

              <Text style={styles.inputLabel}>Alamat Lengkap *</Text>
              <TextInput
                style={[styles.formInput, styles.addressInput]}
                placeholder="Masukkan alamat pengiriman"
                multiline
                value={customerAddress}
                onChangeText={setCustomerAddress}
              />

              <Text style={styles.inputLabel}>Catatan Pesanan</Text>
              <TextInput
                style={[styles.formInput, styles.addressInput]}
                placeholder="Catatan tambahan (opsional)"
                multiline
                value={customerNote}
                onChangeText={setCustomerNote}
              />

              <Text style={styles.checkoutTotal}>
                Total Keranjang: {formatRupiah(totalPrice)}
              </Text>

              <Text style={styles.checkoutHint}>
                Pesanan akan dikirim ke WhatsApp masing-masing toko.
              </Text>

              {groupedOrders["Karang Emas"].length > 0 && (
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => sendWhatsAppOrder("Karang Emas")}
                >
                  <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                  <Text style={styles.whatsappText}>
                    Pesan ke Karang Emas
                  </Text>
                </TouchableOpacity>
              )}

              {groupedOrders["Subur Jaya Santan"].length > 0 && (
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => sendWhatsAppOrder("Subur Jaya Santan")}
                >
                  <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                  <Text style={styles.whatsappText}>
                    Pesan ke Subur Jaya Santan
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ===================================
// 14. STYLE APLIKASI
// ===================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },
  topHeader: {
    backgroundColor: "#7561C9",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSmall: {
    color: "#E7E1FF",
    fontSize: 10,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 3,
  },
  headerCart: {
    position: "relative",
    padding: 5,
  },
  cartBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#F15D78",
    borderRadius: 12,
    minWidth: 19,
    height: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  banner: {
    padding: 22,
    borderRadius: 18,
    marginBottom: 22,
  },
  bannerSmall: {
    color: "#E9E3FF",
    fontSize: 11,
    fontWeight: "bold",
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  bannerDescription: {
    color: "#F2EEFF",
    fontSize: 13,
    marginTop: 9,
    lineHeight: 20,
  },
  bannerButton: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 17,
  },
  bannerButtonText: {
    color: "#7561C9",
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#302A43",
  },
  seeAll: {
    color: "#7561C9",
    fontWeight: "600",
  },
  shopContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  shopCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECE8F7",
  },
  shopTitle: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#302A43",
    marginTop: 9,
  },
  shopSubtitle: {
    fontSize: 11,
    color: "#898397",
    marginTop: 4,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },
  productImage: {
    height: 115,
    backgroundColor: "#F0EDFA",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  imageLabel: {
    color: "#A5A0B8",
    fontSize: 10,
    marginTop: 4,
  },
  brandLabel: {
    fontSize: 10,
    color: "#8878CB",
    fontWeight: "600",
    marginTop: 10,
  },
  productName: {
    fontSize: 13,
    color: "#302A43",
    fontWeight: "600",
    marginTop: 5,
    minHeight: 34,
  },
  productPrice: {
    color: "#7561C9",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 7,
  },
  addButton: {
    backgroundColor: "#7561C9",
    borderRadius: 8,
    padding: 9,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 11,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#302A43",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E3F2",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
  },
  filterContainer: {
    marginVertical: 15,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#DDD7EB",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: "#7561C9",
    borderColor: "#7561C9",
  },
  filterText: {
    color: "#7561C9",
    fontSize: 12,
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#898397",
    textAlign: "center",
    marginTop: 20,
  },
  emptyCart: {
    alignItems: "center",
    paddingTop: 65,
  },
  emptyTitle: {
    fontSize: 17,
    color: "#302A43",
    fontWeight: "bold",
    marginTop: 15,
  },
  primaryButton: {
    backgroundColor: "#7561C9",
    borderRadius: 11,
    padding: 14,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  cartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartImage: {
    width: 65,
    height: 65,
    backgroundColor: "#F0EDFA",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cartInfo: {
    flex: 1,
  },
  cartName: {
    fontSize: 13,
    color: "#302A43",
    fontWeight: "600",
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginTop: 9,
  },
  quantityButton: {
    width: 27,
    height: 27,
    backgroundColor: "#F0EDFA",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontWeight: "bold",
    color: "#302A43",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 25,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#302A43",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalPrice: {
    color: "#7561C9",
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEAF5",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  navText: {
    fontSize: 10,
    color: "#9993A8",
  },
  navTextActive: {
    color: "#7561C9",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  detailImage: {
    height: 170,
    backgroundColor: "#F0EDFA",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTitle: {
    fontSize: 21,
    color: "#302A43",
    fontWeight: "bold",
    marginTop: 8,
  },
  detailDescription: {
    color: "#777184",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  checkoutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    maxHeight: "90%",
  },
  checkoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  checkoutTitle: {
    fontSize: 20,
    color: "#302A43",
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#302A43",
    marginBottom: 7,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: "#F8F7FC",
    borderWidth: 1,
    borderColor: "#E8E3F2",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
  },
  addressInput: {
    minHeight: 75,
    textAlignVertical: "top",
  },
  checkoutTotal: {
    color: "#7561C9",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  checkoutHint: {
    fontSize: 12,
    color: "#898397",
    marginTop: 8,
    lineHeight: 18,
  },
  whatsappButton: {
    backgroundColor: "#20B965",
    borderRadius: 10,
    padding: 14,
    marginTop: 13,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },
  whatsappText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  aboutContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  aboutLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EEEAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  aboutTitle: {
    fontSize: 22,
    color: "#302A43",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 18,
  },
  aboutDescription: {
    color: "#898397",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 12,
    paddingHorizontal: 15,
  },
  aboutInfo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    width: "100%",
    marginTop: 25,
  },
  aboutInfoTitle: {
    color: "#302A43",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 12,
  },
  aboutInfoText: {
    color: "#777184",
    fontSize: 13,
    marginBottom: 8,
  },

  mitraLogo: {
    width: "100%",
    height: 115,
    marginBottom: 8,
  },

});

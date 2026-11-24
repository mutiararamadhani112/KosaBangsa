
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Alert,
  Linking,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ===================================
// 1. NOMOR WHATSAPP MITRA
// ===================================

const WHATSAPP_NUMBERS = {
  "Karang Emas": "6287715780938",
  "Subur Jaya Santan": "6287715780938",
};

// ===================================
// 2. DATA PRODUK
// ===================================


const PRODUCTS = [
  {
    id: "1",
    name: "Ikan Segar 1 Kg",
    brand: "Karang Emas",
    category: "Pangan Laut",
    price: 75000,
    description: "Ikan segar berkualitas untuk kebutuhan memasak.",
    image: require("./assets/products/karang-emas/ikan-segar.jpeg"),
  },
  {
    id: "2",
    name: "Empek-empek Ikan",
    brand: "Karang Emas",
    category: "Cemilan",
    price: 30000,
    image: require("./assets/products/karang-emas/empek2-ikan.jpeg"),
    description: "Empek-empek ikan dengan cita rasa khas.",
  },
  {
    id: "3",
    name: "Amplang 500 gr",
    brand: "Karang Emas",
    category: "Cemilan",
    price: 50000,
    image: require("./assets/products/karang-emas/amplang-ikan.jpeg"),
    description: "Amplang ikan berkualitas untuk dinikmati.",
  },
  {
    id: "4",
    name: "Amplang 1 Kg",
    brand: "Karang Emas",
    category: "Cemilan",
    price: 100000,
    image: require("./assets/products/karang-emas/amplang-ikan.jpeg"),
    description: "Amplang ikan berkualitas ukuran 1 Kg.",
  },
  {
    id: "7",
    name: "Santan Segar 250 ml",
    brand: "Subur Jaya Santan",
    category: "Santan",
    price: 8000,
    image: require("./assets/products/subur-jaya/santan-murni.jpeg"),
    description: "Santan segar untuk berbagai masakan.",
  },
  {
    id: "8",
    name: "Santan Segar 500 ml",
    brand: "Subur Jaya Santan",
    category: "Santan",
    price: 15000,
    image: require("./assets/products/subur-jaya/santan-murni.jpeg"),
    description: "Santan segar ukuran 500 ml.",
  },
  {
    id: "9",
    name: "Kelapa Parut 1 Butir",
    brand: "Subur Jaya Santan",
    category: "Kelapa",
    price: 12000,
    image: require("./assets/products/karang-emas/kelapa.jpeg"),
    description: "Kelapa parut untuk kebutuhan memasak.",
  },
  {
    id: "10",
    name: "Santan Kental 1 Liter",
    brand: "Subur Jaya Santan",
    category: "Santan",
    price: 28000,
    image: require("./assets/products/subur-jaya/santan-murni.jpeg"),
    description: "Santan kental untuk berbagai olahan makanan.",
  },
  {
    id: "11",
    name: "Minyak Kelapa 500 ml",
    brand: "Subur Jaya Santan",
    category: "Kelapa",
    price: 25000,
    image: require("./assets/products/subur-jaya/minyak-kelapa.jpeg"),
    description: "Minyak kelapa ukuran 500 ml.",
  },
  {
    id: "12",
    name: "Kelapa Utuh",
    brand: "Subur Jaya Santan",
    category: "Kelapa",
    price: 10000,
    image: require("./assets/products/karang-emas/kelapa.jpeg"),
    description: "Kelapa utuh untuk kebutuhan rumah tangga.",
  },
];

const BRANDS = ["Karang Emas", "Subur Jaya Santan"];

const formatRupiah = (number) =>
  "Rp" + Number(number || 0).toLocaleString("id-ID");

// ===================================
// 3. KOMPONEN UTAMA
// ===================================

export default function App() {
  const { width: windowWidth } = useWindowDimensions();

  const productCardWidth =
    windowWidth >= 1100
      ? "22.5%"
      : windowWidth >= 700
      ? "30.5%"
      : "47.5%";

  const [activeTab, setActiveTab] = useState("Beranda");
  const [selectedBrand, setSelectedBrand] = useState("Semua");
  const [search, setSearch] = useState("");

  // Keranjang menggunakan ID produk sebagai kunci
  const [cart, setCart] = useState({});

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  // Data pelanggan
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  // Menandai toko yang WhatsApp-nya sudah dibuka
  const [openedBrands, setOpenedBrands] = useState({});

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

  // Data keranjang lengkap
  const cartItems = PRODUCTS
    .filter((product) => cart[product.id] > 0)
    .map((product) => ({
      ...product,
      quantity: cart[product.id],
    }));

  // Total seluruh produk
  const totalItems = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  // Total harga
  const totalPrice = cartItems.reduce(
    (total, product) =>
      total + product.price * product.quantity,
    0
  );

  // ===================================
  // 6. KELOMPOK PESANAN PER MITRA
  // ===================================

  const groupedOrders = {
    "Karang Emas": cartItems.filter(
      (item) => item.brand === "Karang Emas"
    ),

    "Subur Jaya Santan": cartItems.filter(
      (item) => item.brand === "Subur Jaya Santan"
    ),
  };

  const activeOrderBrands = BRANDS.filter(
    (brand) => groupedOrders[brand].length > 0
  );

  // ===================================
  // 7. KIRIM PESANAN WHATSAPP
  // ===================================

  const sendWhatsAppOrder = async (brand) => {
    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !customerAddress.trim()
    ) {
      Alert.alert(
        "Data belum lengkap",
        "Silakan lengkapi nama, nomor WhatsApp, dan alamat."
      );
      return;
    }

    const items = groupedOrders[brand];

    if (!items || items.length === 0) {
      Alert.alert(
        "Informasi",
        "Tidak ada produk dari toko ini."
      );
      return;
    }

    const number = WHATSAPP_NUMBERS[brand];

    if (!number || number.includes("x")) {
      Alert.alert(
        "Nomor WhatsApp belum diatur",
        "Silakan periksa nomor WhatsApp mitra."
      );
      return;
    }

    const orderDetails = items
      .map((item, index) => {
        const subtotal = item.price * item.quantity;

        return (
          `${index + 1}. ${item.name}\n` +
          `   Jumlah: ${item.quantity}\n` +
          `   Harga: ${formatRupiah(item.price)}\n` +
          `   Subtotal: ${formatRupiah(subtotal)}`
        );
      })
      .join("\n\n");

    const orderTotal = items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const message =
      `HALO ${brand.toUpperCase()}\n\n` +
      `Saya ingin melakukan pemesanan:\n\n` +
      `${orderDetails}\n\n` +
      `TOTAL PESANAN: ${formatRupiah(orderTotal)}\n\n` +
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

      setOpenedBrands((previous) => ({
        ...previous,
        [brand]: true,
      }));
    } catch (error) {
      Alert.alert(
        "Gagal membuka WhatsApp",
        "Pastikan WhatsApp tersedia pada perangkat."
      );
    }
  };

  // ===================================
  // 8. SELESAIKAN PESANAN
  // ===================================

  const finishOrder = () => {
    const allBrandsOpened = activeOrderBrands.every(
      (brand) => openedBrands[brand]
    );

    if (!allBrandsOpened) {
      Alert.alert(
        "Pesanan belum lengkap",
        "Silakan buka WhatsApp untuk semua mitra yang memiliki pesanan."
      );
      return;
    }

    Alert.alert(
      "Konfirmasi Pesanan",
      "Apakah kamu sudah mengirim seluruh pesanan melalui WhatsApp?",
      [
        {
          text: "Belum",
          style: "cancel",
        },
        {
          text: "Ya, Sudah",
          onPress: () => {
            setCart({});
            setCheckoutVisible(false);
            setOpenedBrands({});

            setCustomerName("");
            setCustomerPhone("");
            setCustomerAddress("");
            setCustomerNote("");

            Alert.alert(
              "Berhasil",
              "Keranjang sudah dikosongkan. Terima kasih telah berbelanja di KosaBangsa!"
            );
          },
        },
      ]
    );
  };

  // ===================================
  // 9. TOMBOL FILTER MITRA
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
  // 10. KARTU PRODUK
  // ===================================


const ProductCard = ({ product }) => (
  <TouchableOpacity
    style={[
      styles.productCard,
      { width: productCardWidth },
    ]}
    onPress={() => setSelectedProduct(product)}
    activeOpacity={0.85}
  >
    <View style={styles.productImage}>
      <Image
        source={product.image}
        style={styles.productPhoto}
        resizeMode="contain"
      />
    </View>

    <Text style={styles.brandLabel}>
      {product.brand}
    </Text>

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
      <Text style={styles.addButtonText}>
        Keranjang
      </Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

  // ===================================
  // 11. HALAMAN BERANDA
  // ===================================

  const renderHome = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.homeContent}
    >
      <LinearGradient
        colors={["#6652B5", "#9583E0", "#B4A5EF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerSmall}>
            SELAMAT DATANG DI
          </Text>

          <Text style={styles.bannerTitle}>
            KosaBangsa
          </Text>

          <Text style={styles.bannerDescription}>
            Temukan produk unggulan dari mitra lokal.
            Belanja lebih mudah, cepat, dan praktis.
          </Text>

          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => setActiveTab("Produk")}
          >
            <Text style={styles.bannerButtonText}>
              Mulai Belanja
            </Text>
            <Ionicons
              name="arrow-forward"
              size={17}
              color="#6652B5"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bannerDecoration}>
          <Ionicons
            name="bag-handle"
            size={75}
            color="rgba(255,255,255,0.22)"
          />
        </View>
      </LinearGradient>

      {/* MITRA PILIHAN */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Mitra Pilihan
          </Text>
          <Text style={styles.sectionSubtitle}>
            Kenali toko mitra KosaBangsa
          </Text>
        </View>
      </View>

      <View style={styles.shopContainer}>
        <TouchableOpacity
          style={styles.shopCard}
          onPress={() => {
            setSelectedBrand("Karang Emas");
            setActiveTab("Produk");
          }}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("./assets/mitra/karang-emas.jpeg")}
              style={styles.mitraLogo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.shopTitle}>
            Karang Emas
          </Text>

          <Text style={styles.shopSubtitle}>
            Kelompok Nelayan
          </Text>

          <View style={styles.shopLink}>
            <Text style={styles.shopLinkText}>
              Lihat Produk
            </Text>
            <Ionicons
              name="arrow-forward"
              size={13}
              color="#7561C9"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shopCard}
          onPress={() => {
            setSelectedBrand("Subur Jaya Santan");
            setActiveTab("Produk");
          }}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("./assets/mitra/subur-jaya.jpeg")}
              style={styles.mitraLogo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.shopTitle}>
            Subur Jaya
          </Text>

          <Text style={styles.shopSubtitle}>
            Kelompok Tani
          </Text>

          <View style={styles.shopLink}>
            <Text style={styles.shopLinkText}>
              Lihat Produk
            </Text>
            <Ionicons
              name="arrow-forward"
              size={13}
              color="#7561C9"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* PRODUK PILIHAN */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Produk Pilihan
          </Text>
          <Text style={styles.sectionSubtitle}>
            Produk unggulan dari mitra kami
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setActiveTab("Produk")}
        >
          <Text style={styles.seeAll}>
            Lihat Semua
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productGrid}>
        {PRODUCTS.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </View>
    </ScrollView>
  );

  // ===================================
  // 12. HALAMAN PRODUK
  // ===================================




const renderProducts = () => (
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{
      padding: 17,
      paddingBottom: 35,
      flexGrow: 1,
    }}
    showsVerticalScrollIndicator={true}
    nestedScrollEnabled={true}
    keyboardShouldPersistTaps="handled"
  >
    {/* JUDUL */}
    <Text style={styles.pageTitle}>
      Katalog Produk
    </Text>

    {/* PENCARIAN */}
    <View style={styles.searchWrapper}>
      <Ionicons
        name="search-outline"
        size={20}
        color="#918BA3"
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Cari produk..."
        placeholderTextColor="#9993A8"
        value={search}
        onChangeText={setSearch}
      />

      {search.length > 0 && (
        <TouchableOpacity onPress={() => setSearch("")}>
          <Ionicons
            name="close-circle"
            size={19}
            color="#9993A8"
          />
        </TouchableOpacity>
      )}
    </View>

    {/* FILTER MITRA */}
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <BrandButton title="Semua" />
        <BrandButton title="Karang Emas" />
        <BrandButton title="Subur Jaya Santan" />
      </ScrollView>
    </View>

    {/* JUMLAH PRODUK */}
    <Text style={styles.resultText}>
      Menampilkan {filteredProducts.length} produk
    </Text>

    {/* DAFTAR PRODUK */}
    {filteredProducts.length > 0 ? (
      <View style={styles.productGrid}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </View>
    ) : (
      <View style={styles.emptyCart}>
        <Ionicons
          name="search-outline"
          size={55}
          color="#B8B1D0"
        />

        <Text style={styles.emptyTitle}>
          Produk tidak ditemukan
        </Text>

        <Text style={styles.emptyText}>
          Coba gunakan kata kunci atau filter mitra lainnya.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            setSearch("");
            setSelectedBrand("Semua");
          }}
        >
          <Text style={styles.primaryButtonText}>
            Tampilkan Semua Produk
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </ScrollView>
);

  // ===================================
  // 13. HALAMAN KERANJANG
  // ===================================

  const renderCart = () => (
    <ScrollView
      style={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>
        Keranjang Belanja
      </Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Ionicons
            name="cart-outline"
            size={64}
            color="#B8B1D0"
          />

          <Text style={styles.emptyTitle}>
            Keranjang masih kosong
          </Text>

          <Text style={styles.emptyText}>
            Yuk, temukan produk menarik dari mitra KosaBangsa.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setActiveTab("Produk")}
          >
            <Text style={styles.primaryButtonText}>
              Lihat Produk
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {cartItems.map((product) => (
            <View
              key={product.id}
              style={styles.cartCard}
            >
              

            <View style={styles.cartImage}>
              <Image
                source={product.image}
                style={styles.cartPhoto}
                resizeMode="contain"
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
                    <Ionicons
                      name="remove"
                      size={18}
                      color="#7561C9"
                    />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>
                    {product.quantity}
                  </Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => addToCart(product)}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color="#7561C9"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => removeFromCart(product.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#D9534F"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              Ringkasan Pesanan
            </Text>

            <View style={styles.summaryRow}>
              <Text>Total Item</Text>
              <Text>{totalItems} produk</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text>Total Harga</Text>
              <Text style={styles.totalPrice}>
                {formatRupiah(totalPrice)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setOpenedBrands({});
                setCheckoutVisible(true);
              }}
            >
              <Text style={styles.primaryButtonText}>
                Lanjut Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  // ===================================
  // 14. HALAMAN TENTANG
  // ===================================

  const renderAbout = () => (
    <ScrollView
      style={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.aboutContainer}>
        <View style={styles.aboutLogo}>
          <Ionicons
            name="storefront"
            size={50}
            color="#7561C9"
          />
        </View>

        <Text style={styles.aboutTitle}>
          KosaBangsa
        </Text>

        <Text style={styles.aboutDescription}>
          Satu aplikasi untuk memudahkan pelanggan menemukan
          dan memesan produk dari mitra Karang Emas dan
          Subur Jaya Santan.
        </Text>

        <View style={styles.aboutInfo}>
          <Text style={styles.aboutInfoTitle}>
            Informasi Aplikasi
          </Text>

          <Text style={styles.aboutInfoText}>
            Versi: 1.0.0
          </Text>

          <Text style={styles.aboutInfoText}>
            Platform: Mobile Application
          </Text>

          <Text style={styles.aboutInfoText}>
            Layanan: Katalog dan pemesanan produk
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  // ===================================
  // 15. TAMPILAN UTAMA
  // ===================================

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor="#7561C9"
          barStyle="light-content"
        />

        {/* HEADER */}

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
            <Ionicons
              name="cart-outline"
              size={25}
              color="#FFFFFF"
            />

            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* KONTEN HALAMAN */}

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
            {
              name: "Tentang",
              icon: "information-circle-outline",
            },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={styles.navItem}
              onPress={() => setActiveTab(tab.name)}
            >
              <Ionicons
                name={tab.icon}
                size={23}
                color={
                  activeTab === tab.name
                    ? "#7561C9"
                    : "#9993A8"
                }
              />

              <Text
                style={[
                  styles.navText,
                  activeTab === tab.name &&
                    styles.navTextActive,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===================================
            MODAL DETAIL PRODUK
        =================================== */}

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
                <Ionicons
                  name="close"
                  size={24}
                  color="#333333"
                />
              </TouchableOpacity>

              {selectedProduct && (
                <>
                  
              
              <View style={styles.detailImage}>
                <Image
                  source={selectedProduct.image}
                  style={styles.detailPhoto}
                  resizeMode="contain"
                />
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

        {/* ===================================
            MODAL CHECKOUT
        =================================== */}

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
                  <Ionicons
                    name="close"
                    size={25}
                    color="#333333"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputLabel}>
                  Nama Pemesan
                </Text>

                <TextInput
                  style={styles.formInput}
                  placeholder="Masukkan nama lengkap"
                  value={customerName}
                  onChangeText={setCustomerName}
                />

                <Text style={styles.inputLabel}>
                  Nomor WhatsApp
                </Text>

                <TextInput
                  style={styles.formInput}
                  placeholder="Contoh: 08xxxxxxxxxx"
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />

                <Text style={styles.inputLabel}>
                  Alamat Pengiriman
                </Text>

                <TextInput
                  style={[
                    styles.formInput,
                    styles.addressInput,
                  ]}
                  placeholder="Masukkan alamat lengkap"
                  multiline
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                />

                <Text style={styles.inputLabel}>
                  Catatan Pesanan (Opsional)
                </Text>

                <TextInput
                  style={[
                    styles.formInput,
                    styles.addressInput,
                  ]}
                  placeholder="Tambahkan catatan jika diperlukan"
                  multiline
                  value={customerNote}
                  onChangeText={setCustomerNote}
                />

                {/* RINGKASAN CHECKOUT */}

                <View style={styles.checkoutTotal}>
                  <Text>Total Pembayaran</Text>

                  <Text style={styles.totalPrice}>
                    {formatRupiah(totalPrice)}
                  </Text>
                </View>

                <Text style={styles.checkoutHint}>
                  Pesanan dikirim melalui WhatsApp sesuai mitra produk.
                </Text>

                {/* TOMBOL WHATSAPP KARANG EMAS */}

                {groupedOrders["Karang Emas"].length > 0 && (
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() =>
                      sendWhatsAppOrder("Karang Emas")
                    }
                  >
                    <Ionicons
                      name="logo-whatsapp"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text style={styles.whatsappText}>
                      {openedBrands["Karang Emas"]
                        ? "WhatsApp Karang Emas Dibuka"
                        : "Pesan ke Karang Emas"}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* TOMBOL WHATSAPP SUBUR JAYA */}

                {groupedOrders["Subur Jaya Santan"].length > 0 && (
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() =>
                      sendWhatsAppOrder("Subur Jaya Santan")
                    }
                  >
                    <Ionicons
                      name="logo-whatsapp"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text style={styles.whatsappText}>
                      {openedBrands["Subur Jaya Santan"]
                        ? "WhatsApp Subur Jaya Dibuka"
                        : "Pesan ke Subur Jaya Santan"}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* SELESAIKAN PESANAN */}

                <TouchableOpacity
                  style={[
                    styles.finishButton,
                    !activeOrderBrands.every(
                      (brand) => openedBrands[brand]
                    ) && styles.finishButtonDisabled,
                  ]}
                  onPress={finishOrder}
                  disabled={
                    !activeOrderBrands.every(
                      (brand) => openedBrands[brand]
                    )
                  }
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text style={styles.whatsappText}>
                    Saya Sudah Mengirim Pesanan
                  </Text>
                </TouchableOpacity>

                <Text style={styles.finishHint}>
                  Setelah mengirim semua pesanan melalui WhatsApp,
                  tekan tombol di atas untuk mengosongkan keranjang.
                </Text>

                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ===================================
// 16. STYLE / DESAIN APLIKASI
// ===================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },

  topHeader: {
    backgroundColor: "#7561C9",
    paddingHorizontal: 22,
    paddingVertical: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerSmall: {
    color: "#E7E1FF",
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "600",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 3,
  },

  headerCart: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#F15B78",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  content: {
    flex: 1,
  },

  homeContent: {
    padding: 17,
    paddingBottom: 25,
  },

  pageContent: {
    padding: 17,
    paddingBottom: 25,
  },

  banner: {
    minHeight: 215,
    borderRadius: 22,
    padding: 22,
    overflow: "hidden",
    justifyContent: "center",
  },

  bannerContent: {
    width: "78%",
    zIndex: 1,
  },

  bannerSmall: {
    color: "#E8E2FF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 7,
  },

  bannerDescription: {
    color: "#F1EDFF",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
  },

  bannerButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 17,
    gap: 8,
  },

  bannerButtonText: {
    color: "#6652B5",
    fontSize: 12,
    fontWeight: "bold",
  },

  bannerDecoration: {
    position: "absolute",
    right: 15,
    bottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    color: "#29243A",
    fontWeight: "bold",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#918BA3",
    marginTop: 4,
  },

  seeAll: {
    color: "#7561C9",
    fontWeight: "bold",
    fontSize: 12,
  },

  shopContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  shopCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEAF7",
  },

  logoContainer: {
    width: "100%",
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  mitraLogo: {
    width: "100%",
    height: "100%",
  },

  shopTitle: {
    color: "#302A42",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },

  shopSubtitle: {
    fontSize: 11,
    color: "#918BA3",
    marginTop: 4,
  },

  shopLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },

  shopLinkText: {
    color: "#7561C9",
    fontSize: 11,
    fontWeight: "bold",
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    paddingBottom: 20,
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 11,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },



  productImage: {
    width: "100%",
    height: 145,
    backgroundColor: "#F8F7FC",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginBottom: 12,
    overflow: "hidden",
  },

  productPhoto: {
    width: "100%",
    height: "100%",
  },

  imageLabel: {
    color: "#A5A0B8",
    fontSize: 10,
    marginTop: 5,
  },

  brandLabel: {
    color: "#7561C9",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },

  productName: {
    color: "#302A42",
    fontSize: 13,
    fontWeight: "bold",
    minHeight: 36,
  },

  productPrice: {
    color: "#7561C9",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 7,
  },

  addButton: {
    backgroundColor: "#7561C9",
    borderRadius: 9,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 9,
    marginTop: 12,
    gap: 5,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  pageHeading: {
    marginBottom: 18,
  },

  pageTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#302A42",
    marginBottom: 5,
  },

  
  searchWrapper: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAE6F2",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 13,
    color: "#302A42",
    paddingVertical: 0,
  },

  filterContainer: {
    marginTop: 17,
    maxHeight: 43,
  },

  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#EAE6F2",
  },

  filterActive: {
    backgroundColor: "#7561C9",
    borderColor: "#7561C9",
  },

  filterText: {
    color: "#7561C9",
    fontSize: 11,
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  resultText: {
    color: "#918BA3",
    fontSize: 11,
    marginTop: 16,
    marginBottom: 13,
  },

  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 55,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#302A42",
    marginTop: 15,
    textAlign: "center",
  },

  emptyText: {
    color: "#918BA3",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 18,
  },

  primaryButton: {
    backgroundColor: "#7561C9",
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  cartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 12,
    marginTop: 13,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },


  cartImage: {
    width: 95,
    height: 100,
    backgroundColor: "#F8F7FC",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
    overflow: "hidden",
  },

  cartPhoto: {
    width: "100%",
    height: "100%",
  },

  cartInfo: {
    flex: 1,
    justifyContent: "center",
  },

  cartName: {
    color: "#302A42",
    fontWeight: "bold",
    fontSize: 13,
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },

  quantityButton: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#F1EFF8",
    justifyContent: "center",
    alignItems: "center",
  },

  quantityText: {
    color: "#302A42",
    fontSize: 13,
    fontWeight: "bold",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },

  summaryTitle: {
    color: "#302A42",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  totalPrice: {
    color: "#7561C9",
    fontSize: 16,
    fontWeight: "bold",
  },

  aboutContainer: {
    alignItems: "center",
    paddingTop: 40,
  },

  aboutLogo: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "#EEEAFB",
    alignItems: "center",
    justifyContent: "center",
  },

  aboutTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#7561C9",
    marginTop: 18,
  },

  aboutDescription: {
    color: "#777187",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 15,
  },

  aboutInfo: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 15,
    padding: 18,
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },

  aboutInfoTitle: {
    color: "#302A42",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
  },

  aboutInfoText: {
    color: "#777187",
    fontSize: 12,
    marginTop: 8,
  },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEEAF5",
    justifyContent: "space-around",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  navText: {
    color: "#9993A8",
    fontSize: 10,
  },

  navTextActive: {
    color: "#7561C9",
    fontWeight: "bold",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(25,20,45,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
  },

  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },


detailImage: {
  height: 230,
  backgroundColor: "#F8F7FC",
  borderRadius: 16,
  justifyContent: "center",
  alignItems: "center",
  padding: 15,
  marginBottom: 17,
  overflow: "hidden",
},

detailPhoto: {
  width: "100%",
  height: "100%",
},

  detailTitle: {
    color: "#302A42",
    fontSize: 21,
    fontWeight: "bold",
    marginTop: 5,
  },

  detailDescription: {
    color: "#777187",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 13,
  },

  checkoutCard: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },

  checkoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  checkoutTitle: {
    color: "#302A42",
    fontSize: 19,
    fontWeight: "bold",
  },

  inputLabel: {
    color: "#302A42",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 7,
    marginTop: 12,
  },

  formInput: {
    backgroundColor: "#F8F7FC",
    borderWidth: 1,
    borderColor: "#EAE6F2",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 13,
    color: "#302A42",
  },

  addressInput: {
    minHeight: 75,
    textAlignVertical: "top",
  },

  checkoutTotal: {
    backgroundColor: "#F4F1FF",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  checkoutHint: {
    color: "#918BA3",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 13,
    marginBottom: 8,
  },

  whatsappButton: {
    backgroundColor: "#25A75A",
    borderRadius: 11,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 12,
  },

  whatsappText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  finishButton: {
    backgroundColor: "#7561C9",
    borderRadius: 11,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 17,
  },

  finishButtonDisabled: {
    backgroundColor: "#B9B2D2",
  },

  finishHint: {
    color: "#918BA3",
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 10,
  },
});

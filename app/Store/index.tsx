import { supabase } from "@/config/initSupabase";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import NavBar from "@/components/NavBar";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

// Define interfaces
interface ItemProps {
  id: string;
  Item_name: string;
  Categories: string;
  To_vnd: string;
  Descriptions: string;
  Gender: string;
  Product_Type: string;
}

// Define gender categories
const GENDER_CATEGORIES = ["Women", "Men"];

// Define clothing categories
const CLOTHING_CATEGORIES = {
  Women: ["All", "Dresses", "Tops", "Bottoms", "Accessories"],
  Men: ["All", "Shirts", "Pants", "Outerwear", "Accessories"],
};

interface TopNavProps {
  router: any;
  cartCount?: number;
}

function TopNav({ router, cartCount = 0 }: TopNavProps) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity
        style={styles.topNavBtn}
        onPress={() => router.replace("/Saved")}
      >
        <View style={styles.iconContainer}>
          <Image
            alt="Profile"
            style={styles.navIcon}
            resizeMode="contain"
            source={require("../../assets/icons/user.png")}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>E L O</Text>
        <Text style={styles.logoSubtext}>Store</Text>
      </View>

      <TouchableOpacity
        style={styles.topNavBtn}
        onPress={() => router.replace("/Cart")}
      >
        <View style={styles.iconContainer}>
          <Image
            alt="Cart"
            style={styles.navIcon}
            resizeMode="contain"
            source={require("../../assets/icons/cart.png")}
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

function SearchBar({
  searchQuery,
  setSearchQuery,
  onClear,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onClear: () => void;
}) {
  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchInputWrapper}>
        <Image
          alt="Search"
          style={styles.searchIcon}
          resizeMode="contain"
          source={require("../../assets/icons/search.png")}
        />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function GenderTabs({
  selectedGender,
  setSelectedGender,
}: {
  selectedGender: string;
  setSelectedGender: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <View style={styles.genderTabsContainer}>
      {GENDER_CATEGORIES.map((gender) => (
        <TouchableOpacity
          key={gender}
          style={[
            styles.genderTab,
            selectedGender === gender && styles.genderTabActive,
          ]}
          onPress={() => setSelectedGender(gender)}
        >
          <Text
            style={[
              styles.genderTabText,
              selectedGender === gender && styles.genderTabTextActive,
            ]}
          >
            {gender}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CategoryTabs({
  selectedGender,
  selectedCategory,
  setSelectedCategory,
}: {
  selectedGender: string;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabsContainer}
      contentContainerStyle={styles.categoryTabsContent}
    >
      {CLOTHING_CATEGORIES[
        selectedGender as keyof typeof CLOTHING_CATEGORIES
      ].map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryTab,
            selectedCategory === category && styles.categoryTabActive,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.categoryTabText,
              selectedCategory === category && styles.categoryTabTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function ProductCard({
  item,
  index,
  onPress,
}: {
  item: ItemProps;
  index: number;
  onPress: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Generate image URL
  const imageUrl = `https://itqmqggapbmwnrwvkium.supabase.co/storage/v1/object/public/files/stores/${item.id}/1.png`;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)"]}
            style={styles.cardGradient}
          />

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.Categories}</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn}>
              <Image
                alt="Favorite"
                style={styles.quickActionIcon}
                source={require("../../assets/icons/save.png")}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.Item_name}
          </Text>
          <Text style={styles.cardDescription} numberOfLines={1}>
            {item.Descriptions}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{item.To_vnd}</Text>
            <View style={styles.genderTag}>
              <Text style={styles.genderTagText}>
                {item.Gender === "female" ? "W" : "M"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FeaturedCollection({
  title,
  items,
  router,
}: {
  title: string;
  items: ItemProps[];
  router: any;
}) {
  if (items.length === 0) return null;

  return (
    <View style={styles.featuredSection}>
      <View style={styles.featuredHeader}>
        <Text style={styles.featuredTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredItemsContainer}
      >
        {items.slice(0, 5).map((item, index) => {
          const imageUrl = `https://itqmqggapbmwnrwvkium.supabase.co/storage/v1/object/public/files/stores/${item.id}/1.png`;

          return (
            <TouchableOpacity
              key={`featured-${item.id}`}
              style={styles.featuredItem}
              onPress={() =>
                router.replace({
                  pathname: "/ViewItem",
                  params: { itemId: item.id, to: "/Store" },
                })
              }
            >
              <View style={styles.featuredImageContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.4)"]}
                  style={styles.featuredGradient}
                />
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>NEW</Text>
                </View>
              </View>
              <Text style={styles.featuredItemName} numberOfLines={2}>
                {item.Item_name}
              </Text>
              <Text style={styles.featuredItemPrice}>{item.To_vnd}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🛍️</Text>
      </View>
      <Text style={styles.emptyStateTitle}>No items found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your search or browse different categories
      </Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={Colors.White} />
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  );
}

export default function Store() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allData, setAllData] = useState<ItemProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedGender, setSelectedGender] = useState<string>("Women");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const router = useRouter();

  // Optimized data fetching
  const GetItems = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("Elo_Store")
        .select("*")
        .order("Item_name", { ascending: true });

      if (error) {
        console.error("Error fetching items from Elo_Store:", error);
      } else {
        setAllData(data || []);
      }
    } catch (error) {
      console.error("Error in GetItems():", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Optimized filtering with useMemo
  const filteredData = useMemo(() => {
    let filtered = allData;

    // Filter by gender
    if (selectedGender === "Women") {
      filtered = filtered.filter(
        (item) => item.Gender.toLowerCase() === "female"
      );
    } else {
      filtered = filtered.filter(
        (item) => item.Gender.toLowerCase() === "male"
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (item) =>
          item.Categories.toLowerCase().includes(
            selectedCategory.toLowerCase()
          ) ||
          item.Product_Type.toLowerCase().includes(
            selectedCategory.toLowerCase()
          )
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.Item_name.toLowerCase().includes(query) ||
          item.Descriptions.toLowerCase().includes(query) ||
          item.Categories.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allData, selectedGender, selectedCategory, searchQuery]);

  // Separate data for featured section
  const featuredItems = useMemo(() => {
    return filteredData.slice(0, 5);
  }, [filteredData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    GetItems();
  }, [GetItems]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  useEffect(() => {
    GetItems();
  }, [GetItems]);

  const renderItem = useCallback(
    ({ item, index }: { item: ItemProps; index: number }) => (
      <ProductCard
        item={item}
        index={index}
        onPress={() =>
          router.replace({
            pathname: "/ViewItem",
            params: { itemId: item.id, to: "/Store" },
          })
        }
      />
    ),
    [router]
  );

  const keyExtractor = useCallback((item: ItemProps) => item.id, []);

  return (
    <LinearGradient
      colors={[Colors.Background, "#1a1a2e", "#16213e"]}
      style={styles.container}
    >
      {/* Animated Header Background */}
      <Animated.View
        style={[styles.headerBackground, { opacity: headerOpacity }]}
      >
        <BlurView intensity={80} style={styles.blurHeader} />
      </Animated.View>

      <TopNav router={router} cartCount={0} />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.White}
            colors={[Colors.White]}
          />
        }
      >
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClear={clearSearch}
        />

        <GenderTabs
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
        />

        <CategoryTabs
          selectedGender={selectedGender}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {loading ? (
          <LoadingState />
        ) : filteredData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Featured Collection */}
            <FeaturedCollection
              title={`Featured ${selectedGender}'s Collection`}
              items={featuredItems}
              router={router}
            />

            {/* New Arrivals */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredData.length} items available
              </Text>
            </View>

            {/* Grid View with FlatList for better performance */}
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.gridContainer}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />

            {/* Spacer for bottom nav */}
            <View style={{ height: 80 }} />
          </>
        )}
      </Animated.ScrollView>

      <NavBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: 5,
  },

  blurHeader: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingTop: 120,
    paddingHorizontal: 16,
  },

  topNav: {
    position: "absolute",
    top: 50,
    width: "100%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },

  topNavBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  navIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.White,
  },

  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff6b6b",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadgeText: {
    color: Colors.White,
    fontSize: 12,
    fontWeight: "600",
  },

  logoContainer: {
    alignItems: "center",
  },

  logo: {
    color: Colors.White,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 3,
  },

  logoSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "300",
    letterSpacing: 1,
  },

  searchBarContainer: {
    marginBottom: 24,
  },

  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  searchIcon: {
    width: 18,
    height: 18,
    tintColor: "rgba(255, 255, 255, 0.7)",
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.White,
    fontWeight: "400",
  },

  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  clearButtonText: {
    color: Colors.White,
    fontSize: 18,
    fontWeight: "300",
  },

  // Gender Tabs
  genderTabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 4,
  },

  genderTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },

  genderTabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },

  genderTabText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "500",
  },

  genderTabTextActive: {
    color: Colors.White,
    fontWeight: "600",
  },

  // Category Tabs
  categoryTabsContainer: {
    marginBottom: 24,
  },

  categoryTabsContent: {
    paddingRight: 20,
  },

  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  categoryTabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  categoryTabText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },

  categoryTabTextActive: {
    color: Colors.White,
    fontWeight: "500",
  },

  // Featured Section
  featuredSection: {
    marginBottom: 30,
  },

  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  featuredTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.White,
  },

  viewAllText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },

  featuredItemsContainer: {
    paddingRight: 20,
  },

  featuredItem: {
    width: 160,
    marginRight: 12,
  },

  featuredImageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    position: "relative",
  },

  featuredImage: {
    width: "100%",
    height: "100%",
  },

  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  featuredBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  featuredBadgeText: {
    color: Colors.White,
    fontSize: 10,
    fontWeight: "600",
  },

  featuredItemName: {
    color: Colors.White,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },

  featuredItemPrice: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
  },

  sectionHeader: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.White,
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "400",
  },

  // Product Cards
  gridContainer: {
    paddingBottom: 20,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  cardContainer: {
    width: (width - 40) / 2,
  },

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  cardImageContainer: {
    height: 200,
    position: "relative",
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  categoryBadgeText: {
    color: Colors.White,
    fontSize: 10,
    fontWeight: "500",
  },

  quickActions: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  quickActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  quickActionIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.White,
  },

  cardContent: {
    padding: 12,
  },

  cardTitle: {
    color: Colors.White,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  cardDescription: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginBottom: 8,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardPrice: {
    color: Colors.White,
    fontSize: 16,
    fontWeight: "700",
  },

  genderTag: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  genderTagText: {
    color: Colors.White,
    fontSize: 10,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    minHeight: 300,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.White,
    marginBottom: 8,
    textAlign: "center",
  },

  emptyStateText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 24,
  },

  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },

  loadingText: {
    color: Colors.White,
    fontSize: 16,
    marginTop: 16,
    fontWeight: "400",
  },
});

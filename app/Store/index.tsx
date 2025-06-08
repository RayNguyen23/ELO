import { supabase } from "@/config/initSupabase";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
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

// Define gender categories
const GENDER_CATEGORIES = ["Women", "Men"];

// Define clothing categories
const CLOTHING_CATEGORIES = {
  Women: ["All", "Dresses", "Tops", "Bottoms", "Accessories"],
  Men: ["All", "Shirts", "Pants", "Outerwear", "Accessories"],
};

interface TopNavProps {
  router: any;
}

function TopNav({ router }: TopNavProps) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity
        style={styles.topNavBtn}
        onPress={() => {
          router.replace("/Saved");
        }}
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
        onPress={() => router.replace("/Saved")}
      >
        <View style={styles.iconContainer}>
          <Image
            alt="Cart"
            style={styles.navIcon}
            resizeMode="contain"
            source={require("../../assets/icons/save.png")}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function SearchBar({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
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
          onChangeText={(text) => setSearchQuery(text)}
          style={styles.searchInput}
        />
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

function FeaturedCollection({
  title,
  items,
  router,
}: {
  title: string;
  items: string[];
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
        {items.slice(0, 5).map((item, index) => (
          <TouchableOpacity
            key={`featured-${index}`}
            style={styles.featuredItem}
            onPress={() =>
              router.replace({
                pathname: "/ViewItem",
                params: { itemUrl: item, to: "/Store" },
              })
            }
          >
            <View style={styles.featuredImageContainer}>
              <Image
                source={{ uri: item }}
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
            <Text style={styles.featuredItemName}>
              {index % 2 === 0 ? "Premium Item" : "Exclusive Design"}
            </Text>
            <Text style={styles.featuredItemPrice}>
              ${Math.floor(Math.random() * 50) + 50}.99
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No items found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your search or check back later
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
  const [allData, setAllData] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  // Mock data for men's and women's clothing
  const [womenClothing, setWomenClothing] = useState<string[]>([]);
  const [menClothing, setMenClothing] = useState<string[]>([]);

  async function GetItems() {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from("files")
        .list("stores/", {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Error listing files:", error);
      } else {
        const publicUrls = data.map((file) => {
          const { data: publicUrlData } = supabase.storage
            .from("files")
            .getPublicUrl(`stores/${file.name}`);
          return publicUrlData.publicUrl;
        });

        setAllData(publicUrls);

        // Split data into men's and women's clothing (mock split based on index)
        const women = publicUrls.filter((_, i) => i % 2 === 0);
        const men = publicUrls.filter((_, i) => i % 2 !== 0);

        setWomenClothing(women);
        setMenClothing(men);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    GetItems();
  }, []);

  useEffect(() => {
    // Filter based on gender, category, and search query
    const genderData = selectedGender === "Women" ? womenClothing : menClothing;

    // In a real app, you would filter by category here
    // For now, we'll just use the search query
    const filtered = genderData.filter((url) =>
      url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredData(filtered);
  }, [
    searchQuery,
    selectedGender,
    selectedCategory,
    womenClothing,
    menClothing,
  ]);

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[styles.card, { marginLeft: index % 2 === 0 ? 0 : 8 }]}
      onPress={() =>
        router.replace({
          pathname: "/ViewItem",
          params: { itemUrl: item, to: "/Store" },
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: item }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)"]}
          style={styles.cardGradient}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {index % 3 === 0
            ? "Premium Design"
            : index % 3 === 1
            ? "Classic Style"
            : "Limited Edition"}
        </Text>
        <Text style={styles.cardPrice}>
          ${Math.floor(Math.random() * 50) + 30}.99
        </Text>
      </View>
    </TouchableOpacity>
  );

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

      <TopNav router={router} />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

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
              items={filteredData.slice(0, 5)}
              router={router}
            />

            {/* New Arrivals */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredData.length} items available
              </Text>
            </View>

            {/* Grid View */}
            <View style={styles.gridContainer}>
              {filteredData.map((item, index) => (
                <TouchableOpacity
                  key={`grid-${index}`}
                  style={[styles.card, { marginLeft: index % 2 === 0 ? 0 : 8 }]}
                  onPress={() =>
                    router.replace({
                      pathname: "/ViewItem",
                      params: { itemUrl: item, to: "/Store" },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: item }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.3)"]}
                      style={styles.cardGradient}
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                      {index % 3 === 0
                        ? "Premium Design"
                        : index % 3 === 1
                        ? "Classic Style"
                        : "Limited Edition"}
                    </Text>
                    <Text style={styles.cardPrice}>
                      ${Math.floor(Math.random() * 50) + 30}.99
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

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
    backdropFilter: "blur(10px)",
  },

  navIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.White,
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
    backdropFilter: "blur(10px)",
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

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: (width - 40) / 2,
    marginBottom: 16,
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

  cardContent: {
    padding: 12,
  },

  cardTitle: {
    color: Colors.White,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },

  cardPrice: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    minHeight: 300,
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

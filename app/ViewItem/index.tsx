import { supabase } from "@/config/initSupabase";
import { Colors } from "@/constants/Colors";
import { PUSH } from "@/utils/pushDataToSupabase";
import { REMOVE_BY_UUID_AND_URL } from "@/utils/removeDataFromSupabase";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Interface for product data
interface ItemProps {
  id: string;
  Item_name: string;
  Categories: string;
  To_vnd: string;
  Descriptions: string;
  Gender: string;
  Product_Type: string;
}

interface BottomProps {
  IsSaved: boolean;
  itemData: ItemProps | null;
  setIsSaved: (e: boolean) => void;
  MoveToHome: () => void;
  router: any;
}

function ActionButtons({
  IsSaved,
  setIsSaved,
  MoveToHome,
  itemData,
  router,
}: BottomProps) {
  const [animatedValue] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);

  if (!itemData) return null;

  const imageUrl = `https://itqmqggapbmwnrwvkium.supabase.co/storage/v1/object/public/files/stores/${itemData.id}/1.png`;

  async function SaveImage() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return;

    const uuid = authData.user.id;
    PUSH("Elo_Saved", { uuid: uuid, ImageUrl: imageUrl });

    // Animate heart
    animateSave();
  }

  async function RemoveImage() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return;

    const uuid = authData.user.id;
    await REMOVE_BY_UUID_AND_URL("Elo_Saved", uuid, imageUrl);
  }

  async function checkIfSaved(): Promise<boolean> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return false;

    const uuid = authData.user.id;

    const { data, error } = await supabase
      .from("Elo_Saved")
      .select("*")
      .eq("uuid", uuid)
      .eq("ImageUrl", imageUrl);

    if (error) {
      console.error("Check saved error:", error);
      return false;
    }

    return data.length > 0;
  }

  const animateSave = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  const heartScale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.3, 1],
  });

  useEffect(() => {
    async function checkSavedStatus() {
      const saved = await checkIfSaved();
      setIsSaved(saved);
    }

    checkSavedStatus();
  }, [itemData.id]);

  // Format price from VND to display
  const formatPrice = (vndPrice: string) => {
    const price = parseInt(vndPrice);
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  // Convert VND to USD for display
  const formatPriceUSD = (vndPrice: string) => {
    const price = parseInt(vndPrice) / 24000;
    return `$${price.toFixed(2)}`;
  };

  return (
    <View style={styles.actionButtonsContainer}>
      <BlurView intensity={80} style={styles.actionBlur}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => {
              if (IsSaved === false) {
                setIsSaved(true);
                SaveImage();
              } else {
                setIsSaved(false);
                RemoveImage();
              }
            }}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Image
                alt="Save"
                style={[styles.actionIcon, IsSaved && { tintColor: "#ff4757" }]}
                resizeMode="contain"
                source={
                  IsSaved
                    ? require("../../assets/icons/saved.png")
                    : require("../../assets/icons/save.png")
                }
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: "#4b7bec" }]}
            onPress={() => MoveToHome()}
          >
            <Image
              alt="Use"
              style={[styles.actionIcon, { tintColor: "#fff", marginRight: 8 }]}
              resizeMode="contain"
              source={require("../../assets/icons/use.png")}
            />
            <Text style={styles.primaryButtonText}>Use this Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: "#26de81" }]}
            onPress={() =>
              router.replace({
                pathname: "/Payments",
                params: {
                  amount: formatPrice(itemData.To_vnd),
                  itemId: itemData.id,
                  itemName: itemData.Item_name,
                  to: "Store",
                },
              })
            }
          >
            <Image
              alt="Buy"
              style={[styles.actionIcon, { tintColor: "#fff", marginRight: 8 }]}
              resizeMode="contain"
              source={require("../../assets/icons/cart.png")}
            />
            <Text style={styles.primaryButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.White} />
      <Text style={styles.loadingText}>Loading product details...</Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Product Not Found</Text>
      <Text style={styles.errorText}>
        Sorry, we couldn't find this product. It may have been removed or is
        temporarily unavailable.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ViewItem() {
  const [IsSaved, setIsSaved] = useState<boolean>(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [itemData, setItemData] = useState<ItemProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const { itemId, to } = useLocalSearchParams();
  const router = useRouter();

  // Fetch item data from database
  const fetchItemData = useCallback(async () => {
    if (!itemId) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const { data, error: fetchError } = await supabase
        .from("Elo_Store")
        .select("*")
        .eq("id", itemId)
        .single();

      if (fetchError || !data) {
        console.error("Error fetching item:", fetchError);
        setError(true);
      } else {
        setItemData(data);
      }
    } catch (err) {
      console.error("Error in fetchItemData:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItemData();
  }, [fetchItemData]);

  function MoveToHome() {
    if (!itemData) return;

    const imageUrl = `https://itqmqggapbmwnrwvkium.supabase.co/storage/v1/object/public/files/stores/${itemData.id}/1.png`;
    router.replace({
      pathname: "/Home",
      params: { itemUrl: imageUrl },
    });
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Format price functions
  const formatPriceVND = (vndPrice: string) => {
    const price = parseInt(vndPrice);
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  const formatPriceUSD = (vndPrice: string) => {
    const price = parseInt(vndPrice) / 24000;
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LoadingState />
      </View>
    );
  }

  if (error || !itemData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ErrorState onRetry={fetchItemData} />
      </View>
    );
  }

  const imageUrl = `https://itqmqggapbmwnrwvkium.supabase.co/storage/v1/object/public/files/stores/${itemData.id}/1.png`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={80} style={styles.blurHeader}>
          <Text style={styles.headerTitle}>E L O</Text>
        </BlurView>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          const destination = Array.isArray(to) ? to[0] : to;
          if (destination) {
            router.replace(destination as any);
          } else {
            router.back();
          }
        }}
      >
        <BlurView intensity={60} style={styles.blurButton}>
          <Image
            resizeMode="contain"
            style={styles.backIcon}
            alt="Back"
            source={require("../../assets/icons/back.png")}
          />
        </BlurView>
      </TouchableOpacity>

      {/* Logo */}
      <Text style={styles.logo}>E L O</Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image
            alt="Product"
            style={styles.heroImage}
            resizeMode="cover"
            source={{ uri: imageUrl }}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageGradient}
          />
        </View>

        {/* Product Details */}
        <View style={styles.productDetailsContainer}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <View style={styles.categoryContainer}>
                <Text style={styles.productCategory}>
                  {itemData.Categories}
                </Text>
                <View style={styles.genderBadge}>
                  <Text style={styles.genderBadgeText}>
                    {itemData.Gender === "Female" ? "Nữ" : "Nam"}
                  </Text>
                </View>
              </View>
              <Text style={styles.productTitle}>{itemData.Item_name}</Text>
              <Text style={styles.productType}>{itemData.Product_Type}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceTextUSD}>{itemData.To_vnd}</Text>
              <Text style={styles.priceTextVND}>
                {formatPriceUSD(itemData.To_vnd)}
              </Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {itemData.Descriptions ||
                "This premium item features high-quality materials and expert craftsmanship. Perfect for enhancing your collection with its unique design and exceptional quality."}
            </Text>
          </View>

          {/* Spacer for bottom buttons */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <ActionButtons
        router={router}
        itemData={itemData}
        IsSaved={IsSaved}
        setIsSaved={setIsSaved}
        MoveToHome={MoveToHome}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 100,
  },

  blurHeader: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },

  headerTitle: {
    color: Colors.White,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 3,
  },

  logo: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    color: Colors.White,
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 3,
    zIndex: 10,
  },

  backButton: {
    position: "absolute",
    top: 55,
    left: 20,
    zIndex: 10,
  },

  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.White,
  },

  scrollView: {
    flex: 1,
  },

  heroImageContainer: {
    width: width,
    height: height * 0.6,
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  productDetailsContainer: {
    backgroundColor: Colors.Background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  productInfo: {
    flex: 1,
    marginRight: 16,
  },

  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  productCategory: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginRight: 12,
  },

  genderBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  genderBadgeText: {
    color: Colors.White,
    fontSize: 12,
    fontWeight: "500",
  },

  productTitle: {
    color: Colors.White,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },

  productType: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },

  priceContainer: {
    alignItems: "flex-end",
  },

  priceTextUSD: {
    color: Colors.White,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  priceTextVND: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },

  detailsSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: Colors.White,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  descriptionText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    lineHeight: 24,
  },

  featuresList: {
    marginTop: 8,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4b7bec",
    marginRight: 12,
  },

  featureText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },

  actionButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  actionBlur: {
    borderRadius: 25,
    overflow: "hidden",
  },

  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  actionIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.White,
  },

  primaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  primaryButtonText: {
    color: Colors.White,
    fontSize: 12,
    fontWeight: "600",
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.Background,
  },

  loadingText: {
    color: Colors.White,
    fontSize: 16,
    marginTop: 16,
    fontWeight: "400",
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.Background,
    paddingHorizontal: 40,
  },

  errorTitle: {
    color: Colors.White,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  errorText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },

  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  retryButtonText: {
    color: Colors.White,
    fontSize: 16,
    fontWeight: "600",
  },
});

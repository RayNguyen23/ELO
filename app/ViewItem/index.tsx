import { supabase } from "@/config/initSupabase";
import { Colors } from "@/constants/Colors";
import { PUSH } from "@/utils/pushDataToSupabase";
import { REMOVE_BY_UUID_AND_URL } from "@/utils/removeDataFromSupabase";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

interface BottomProps {
  IsSaved: boolean;
  ImageUrl: string;
  setIsSaved: (e: boolean) => void;
  MoveToHome: () => void;
}

function ActionButtons({
  IsSaved,
  setIsSaved,
  MoveToHome,
  ImageUrl,
}: BottomProps) {
  const [animatedValue] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);

  async function SaveImage(ImageUrl: string) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return;

    const uuid = authData.user.id;
    PUSH("Elo_Saved", { uuid: uuid, ImageUrl: ImageUrl });

    // Animate heart
    animateSave();
  }

  async function RemoveImage() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return;

    const uuid = authData.user.id;
    await REMOVE_BY_UUID_AND_URL("Elo_Saved", uuid, ImageUrl);
  }

  async function checkIfSaved(imageUrl: string): Promise<boolean> {
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
      if (ImageUrl) {
        const saved = await checkIfSaved(ImageUrl);
        setIsSaved(saved);
      }
    }

    checkSavedStatus();
  }, [ImageUrl]);

  return (
    <View style={styles.actionButtonsContainer}>
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => {
            if (IsSaved === false) {
              setIsSaved(true);
              SaveImage(ImageUrl);
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
    </View>
  );
}

export default function ViewItem() {
  const [IsSaved, setIsSaved] = useState<boolean>(false);
  const [scrollY] = useState(new Animated.Value(0));
  const { itemUrl, to } = useLocalSearchParams();
  const imageUrl = Array.isArray(itemUrl) ? itemUrl[0] : itemUrl;

  const router = useRouter();

  function MoveToHome() {
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
            console.warn("No destination provided.");
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
            <View>
              <Text style={styles.productCategory}>Premium Collection</Text>
              <Text style={styles.productTitle}>Exclusive Item</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>$149</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              This premium item features high-quality materials and expert
              craftsmanship. Perfect for enhancing your collection with its
              unique design and exceptional quality.
            </Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>
                  Premium quality materials
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>
                  Handcrafted with precision
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>Limited edition design</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>
                  Exclusive to E L O members
                </Text>
              </View>
            </View>
          </View>

          {/* Spacer for bottom buttons */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <ActionButtons
        ImageUrl={imageUrl}
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
    alignItems: "center",
    marginBottom: 20,
  },

  productCategory: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 4,
  },

  productTitle: {
    color: Colors.White,
    fontSize: 28,
    fontWeight: "700",
  },

  priceBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  priceText: {
    color: Colors.White,
    fontSize: 18,
    fontWeight: "700",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(10px)",
  },

  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 14,
    fontWeight: "600",
  },
});

import { supabase } from "@/config/initSupabase";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { REMOVE_BY_UUID_AND_URL } from "@/utils/removeDataFromSupabase";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

interface TopNavProps {
  router: any;
  itemCount: number;
  onClearAll: () => void;
}

function TopNav({ router, itemCount, onClearAll }: TopNavProps) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity
        style={styles.topNavBtn}
        onPress={() => router.replace("/Settings")}
      >
        <View style={styles.iconContainer}>
          <Image
            alt="Back"
            style={styles.navIcon}
            resizeMode="contain"
            source={require("../../assets/icons/back.png")}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>E L O</Text>
        <Text style={styles.logoSubtext}>Saved Items</Text>
      </View>

      <TouchableOpacity
        style={styles.topNavBtn}
        onPress={onClearAll}
        disabled={itemCount === 0}
      >
        <View
          style={[styles.iconContainer, itemCount === 0 && styles.iconDisabled]}
        >
          <Image
            alt="Clear All"
            style={[styles.navIcon, itemCount === 0 && styles.iconDisabled]}
            resizeMode="contain"
            source={require("../../assets/icons/trash.png")}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function SavedItemCard({
  item,
  index,
  onPress,
  onRemove,
}: {
  item: string;
  index: number;
  onPress: () => void;
  onRemove: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLongPress = () => {
    Alert.alert("Remove Item", "Remove this item from your saved collection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => onRemove());
        },
      },
    ]);
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)"]}
            style={styles.imageGradient}
          />

          {/* Favorite Badge */}
          <View style={styles.favoriteBadge}>
            <Image
              alt="Saved"
              style={styles.favoriteIcon}
              source={require("../../assets/icons/saved.png")}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={(e) => {
                e.stopPropagation();
                handleLongPress();
              }}
            >
              <Image
                alt="Remove"
                style={styles.quickActionIcon}
                source={require("../../assets/icons/trash.png")}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={(e) => {
                e.stopPropagation();
                // Add share functionality
              }}
            >
              <Image
                alt="Share"
                style={styles.quickActionIcon}
                source={require("../../assets/icons/share.png")}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Saved Item</Text>
          <Text style={styles.cardSubtitle}>Tap to view details</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function EmptyState({ router }: { router: any }) {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    return () => bounceAnimation.stop();
  }, []);

  return (
    <View style={styles.emptyState}>
      <Animated.View
        style={[
          styles.emptyIconContainer,
          { transform: [{ scale: bounceAnim }] },
        ]}
      >
        <Text style={styles.emptyIcon}>💝</Text>
      </Animated.View>

      <Text style={styles.emptyTitle}>No Saved Items Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring and save your favorite items to see them here
      </Text>

      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.replace("/Store")}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.exploreGradient}
        >
          <Text style={styles.exploreText}>Explore Store</Text>
          <Image
            alt="Arrow"
            style={styles.exploreArrow}
            source={require("../../assets/icons/arrow-right.png")}
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function StatsHeader({ itemCount }: { itemCount: number }) {
  return (
    <View style={styles.statsContainer}>
      <BlurView intensity={60} style={styles.statsBlur}>
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{itemCount}</Text>
            <Text style={styles.statLabel}>Saved Items</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {itemCount > 0 ? Math.ceil(itemCount / 2) : 0}
            </Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              ${(itemCount * 45.99).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Est. Value</Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

export default function Saved() {
  const [Data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  async function GetItems() {
    try {
      setLoading(true);
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("Auth error:", authError);
        return;
      }

      const uuid = authData.user.id;

      const { data, error } = await supabase
        .from("Elo_Saved")
        .select("ImageUrl")
        .eq("uuid", uuid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching saved items:", error);
        return;
      }

      const imageUrls = data.map((item) => item.ImageUrl);
      setData(imageUrls);
    } catch (error) {
      console.error("Error in GetItems:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const removeItem = async (imageUrl: string) => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) return;

      const uuid = authData.user.id;
      await REMOVE_BY_UUID_AND_URL("Elo_Saved", uuid, imageUrl);

      setData((prevData) => prevData.filter((item) => item !== imageUrl));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const clearAllItems = () => {
    if (Data.length === 0) return;

    Alert.alert(
      "Clear All Saved Items",
      "Are you sure you want to remove all saved items? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              const { data: authData, error: authError } =
                await supabase.auth.getUser();
              if (authError || !authData?.user) return;

              const uuid = authData.user.id;
              const { error } = await supabase
                .from("Elo_Saved")
                .delete()
                .eq("uuid", uuid);

              if (!error) {
                setData([]);
              }
            } catch (error) {
              console.error("Error clearing all items:", error);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    GetItems();
  };

  useEffect(() => {
    GetItems();

    // Animate header
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <SavedItemCard
      item={item}
      index={index}
      onPress={() =>
        router.replace({
          pathname: "/ViewItem",
          params: { itemUrl: item, to: "/Saved" },
        })
      }
      onRemove={() => removeItem(item)}
    />
  );

  return (
    <LinearGradient
      colors={[Colors.Background, "#1a1a2e", "#16213e"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <TopNav
        router={router}
        itemCount={Data.length}
        onClearAll={clearAllItems}
      />

      <Animated.View style={[styles.content, { opacity: headerOpacity }]}>
        {Data.length > 0 && <StatsHeader itemCount={Data.length} />}

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your saved items...</Text>
          </View>
        ) : Data.length === 0 ? (
          <EmptyState router={router} />
        ) : (
          <FlatList
            data={Data}
            numColumns={2}
            keyExtractor={(item, index) => `${item}-${index}`}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.White}
                colors={[Colors.White]}
              />
            }
          />
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },

  iconDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    opacity: 0.5,
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

  content: {
    flex: 1,
    marginTop: 120,
  },

  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },

  statsBlur: {
    borderRadius: 16,
    overflow: "hidden",
  },

  statsContent: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    color: Colors.White,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },

  statLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "500",
  },

  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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

  imageContainer: {
    height: 200,
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  favoriteBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  favoriteIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.White,
  },

  quickActions: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
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

  cardSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: Colors.White,
    fontSize: 16,
    fontWeight: "400",
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyTitle: {
    color: Colors.White,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },

  exploreButton: {
    width: "100%",
  },

  exploreGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },

  exploreText: {
    color: Colors.White,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },

  exploreArrow: {
    width: 20,
    height: 20,
    tintColor: Colors.White,
  },
});

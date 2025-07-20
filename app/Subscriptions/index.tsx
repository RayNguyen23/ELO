import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getSubscriptions,
  initConnection,
  ProductPurchase,
  purchaseUpdatedListener,
  requestSubscription,
} from "react-native-iap";

const { width } = Dimensions.get("window");

interface HeaderProps {
  onBackPress: () => void;
}

interface PlanCardProps {
  plan: PlanData;
  isPopular?: boolean;
  onSelect: (planId: string) => void;
}

interface FeatureItemProps {
  text: string;
  included: boolean;
}

interface PlanData {
  id: string;
  name: string;
  emoji: string;
  price: number;
  turns: number | string;
  costPerTurn: string;
  features: Array<{
    text: string;
    included: boolean;
  }>;
}

const Header: React.FC<HeaderProps> = ({ onBackPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={24} color={Colors.White} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Plans & Pricing</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
};

const FeatureItem: React.FC<FeatureItemProps> = ({ text, included }) => {
  return (
    <View style={styles.featureItem}>
      <Ionicons
        name={included ? "checkmark-circle" : "close-circle"}
        size={16}
        color={included ? Colors.LightBlue : Colors.LightGray}
        style={styles.featureIcon}
      />
      <Text
        style={[styles.featureText, !included && styles.featureTextDisabled]}
      >
        {text}
      </Text>
    </View>
  );
};

const PlanCard: React.FC<PlanCardProps> = ({ plan, isPopular, onSelect }) => {
  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  const formatTurns = (turns: number | string) => {
    if (typeof turns === "string") return turns;
    if (turns === 5) return "5 total (one-time)";
    return `${turns} turns`;
  };

  return (
    <View style={[styles.planCard, isPopular && styles.planCardPopular]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <View style={styles.planTitleRow}>
          <Text style={styles.planEmoji}>{plan.emoji}</Text>
          <Text style={styles.planName}>{plan.name}</Text>
        </View>
        <Text style={styles.planPrice}>{formatPrice(plan.price)}</Text>
        <Text style={styles.planTurns}>{formatTurns(plan.turns)}</Text>
        {plan.costPerTurn !== "Free" && (
          <Text style={styles.costPerTurn}>{plan.costPerTurn}/turn</Text>
        )}
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <FeatureItem
            key={index}
            text={feature.text}
            included={feature.included}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          isPopular && styles.selectButtonPopular,
          plan.price === 0 && styles.selectButtonFree,
        ]}
        onPress={() => onSelect(plan.id)}
      >
        <Text
          style={[
            styles.selectButtonText,
            isPopular && styles.selectButtonTextPopular,
            plan.price === 0 && styles.selectButtonTextFree,
          ]}
        >
          {plan.price === 0 ? "Get Started" : "Choose Plan"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const StatsSection: React.FC = () => {
  return (
    <View style={styles.statsSection}>
      <Text style={styles.statsSectionTitle}>Why Choose Our Plans?</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="flash" size={24} color={Colors.LightBlue} />
          <Text style={styles.statNumber}>2M+</Text>
          <Text style={styles.statLabel}>Try-ons completed</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={24} color={Colors.LightBlue} />
          <Text style={styles.statNumber}>500K+</Text>
          <Text style={styles.statLabel}>Happy users</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star" size={24} color={Colors.LightBlue} />
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>App rating</Text>
        </View>
      </View>
    </View>
  );
};

export default function SubscriptionPlans() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleBackPress = () => {
    router.replace("/Settings");
  };

  // const handlePlanSelect = (planId: string) => {
  //   setSelectedPlan(planId);

  //   const plan = plansData.find((p) => p.id === planId);
  //   if (plan) {
  //     if (plan.price === 0) {
  //       Alert.alert(
  //         "Free Plan",
  //         "You can start using the free plan immediately!",
  //         [
  //           { text: "Cancel", style: "cancel" },
  //           { text: "Start Now", onPress: () => router.push("/Home") },
  //         ]
  //       );
  //     } else {
  //       Alert.alert(
  //         "Upgrade Plan",
  //         `Upgrade to ${plan.name} plan for ${plan.price.toLocaleString(
  //           "vi-VN"
  //         )}đ?`,
  //         [
  //           { text: "Cancel", style: "cancel" },
  //           {
  //             text: "Continue",
  //             onPress: () =>
  //               router.replace({
  //                 pathname: "/Payments",
  //                 params: {
  //                   amount: `${plan.price.toLocaleString("vi-VN")}đ`,
  //                   to: "Subscriptions",
  //                 },
  //               }),
  //           },
  //         ]
  //       );
  //     }
  //   }
  // };
  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    const plan = plansData.find((p) => p.id === planId);
    if (!plan) return;

    if (plan.price === 0) {
      Alert.alert(
        "Free Plan",
        "You can start using the free plan immediately!",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Start Now", onPress: () => router.push("/Home") },
        ]
      );
      return;
    }

    try {
      const products = await getSubscriptions({ skus: [planId + "_monthly"] }); // match your App Store Connect productId
      if (!products || products.length === 0) {
        Alert.alert("Error", "Product not found.");
        return;
      }

      const purchase = await requestSubscription({ sku: planId + "_monthly" });
      console.log("purchase result:", purchase);

      Alert.alert("Success", `You’ve purchased the ${plan.name} plan!`);
      router.replace("/Home");
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Failed", e.message || "Unknown error");
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await initConnection();
        console.log("IAP connection ready");
      } catch (error) {
        console.log("IAP init failed", error);
      }
    };

    const purchaseListener = purchaseUpdatedListener(
      (purchase: ProductPurchase) => {
        console.log("Purchase Updated:", purchase);
        // You can validate receipt or grant access here
      }
    );

    init();

    return () => {
      purchaseListener.remove();
    };
  }, []);

  const plansData: PlanData[] = [
    {
      id: "free",
      name: "Free",
      emoji: "🆓",
      price: 0,
      turns: 5,
      costPerTurn: "Free",
      features: [
        { text: "Try 5 outfits for free", included: true },
        { text: "Access to basic try-on", included: true },
        { text: "Limited history", included: true },
        { text: "No HD export", included: false },
        { text: "No batch uploads", included: false },
      ],
    },
    {
      id: "starter",
      name: "Starter",
      emoji: "💼",
      price: 22000,
      turns: 10,
      costPerTurn: "2,200đ",
      features: [
        { text: "10 outfit try-ons", included: true },
        { text: "HD preview", included: true },
        { text: "Save to history", included: true },
        { text: "No bulk upload", included: false },
      ],
    },
    {
      id: "basic",
      name: "Basic",
      emoji: "📦",
      price: 49000,
      turns: 30,
      costPerTurn: "~1,633đ",
      features: [
        { text: "All Starter features", included: true },
        { text: "Priority processing", included: true },
        { text: "Save 3 favorite looks", included: true },
        { text: "No pro editing", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      emoji: "🌟",
      price: 89000,
      turns: 70,
      costPerTurn: "~1,271đ",
      features: [
        { text: "All Basic features", included: true },
        { text: "Unlimited history", included: true },
        { text: "Smart outfit suggestions", included: true },
        { text: "Batch upload", included: true },
      ],
    },
    {
      id: "vip",
      name: "VIP",
      emoji: "👑",
      price: 159000,
      turns: 150,
      costPerTurn: "~1,060đ",
      features: [
        { text: "All Pro features", included: true },
        { text: "Try-on assistant (AI stylist)", included: true },
        { text: "Early access to new features", included: true },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Header onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Choose Your Perfect Plan</Text>
          <Text style={styles.introSubtitle}>
            Unlock the power of AI fashion with our flexible pricing options
          </Text>
        </View>

        <StatsSection />

        <View style={styles.plansContainer}>
          {plansData.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPopular={plan.id === "pro"}
              onSelect={handlePlanSelect}
            />
          ))}
        </View>

        <View style={styles.footerSection}>
          <View style={styles.guaranteeCard}>
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={Colors.LightBlue}
            />
            <View style={styles.guaranteeText}>
              <Text style={styles.guaranteeTitle}>
                30-Day Money Back Guarantee
              </Text>
              <Text style={styles.guaranteeSubtitle}>
                Not satisfied? Get a full refund within 30 days
              </Text>
            </View>
          </View>

          <Text style={styles.footerNote}>
            All prices are in Vietnamese Dong (VNĐ). Plans auto-renew monthly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.Background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BlurGray,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.White,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  introSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.White,
    textAlign: "center",
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: Colors.LightGray,
    textAlign: "center",
    lineHeight: 22,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.White,
    textAlign: "center",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.BlurGray,
    borderRadius: 16,
    paddingVertical: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.White,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.LightGray,
    textAlign: "center",
  },
  plansContainer: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: Colors.BlurGray,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  planCardPopular: {
    borderColor: Colors.LightBlue,
    backgroundColor: Colors.BlurGray,
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: Colors.LightBlue,
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: "center",
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.Background,
  },
  planHeader: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  planEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.White,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.LightBlue,
    marginBottom: 4,
  },
  planTurns: {
    fontSize: 14,
    color: Colors.LightGray,
    marginBottom: 4,
  },
  costPerTurn: {
    fontSize: 12,
    color: Colors.LightGray,
    fontStyle: "italic",
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.White,
    flex: 1,
  },
  featureTextDisabled: {
    color: Colors.LightGray,
    textDecorationLine: "line-through",
  },
  selectButton: {
    backgroundColor: Colors.Background,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.LightGray,
  },
  selectButtonPopular: {
    backgroundColor: Colors.LightBlue,
    borderColor: Colors.LightBlue,
  },
  selectButtonFree: {
    backgroundColor: Colors.LightBlue,
    borderColor: Colors.LightBlue,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.White,
  },
  selectButtonTextPopular: {
    color: Colors.Background,
  },
  selectButtonTextFree: {
    color: Colors.Background,
  },
  footerSection: {
    gap: 20,
  },
  guaranteeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.BlurGray,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.LightBlue,
  },
  guaranteeText: {
    marginLeft: 16,
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.White,
    marginBottom: 4,
  },
  guaranteeSubtitle: {
    fontSize: 14,
    color: Colors.LightGray,
    lineHeight: 18,
  },
  footerNote: {
    fontSize: 12,
    color: Colors.LightGray,
    textAlign: "center",
    lineHeight: 16,
  },
});

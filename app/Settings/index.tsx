import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  type ImageSourcePropType,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import NavBar from "@/components/NavBar";
import { supabase } from "@/config/initSupabase";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

interface ItemProps {
  ImageName: ImageSourcePropType;
  Name: string;
  router: any;
  isDestructive?: boolean;
}

function Items({ ImageName, Name, router, isDestructive = false }: ItemProps) {
  async function signOut() {
    await supabase.auth.signOut();
  }

  function showRemoveAccountAlert() {
    Alert.alert(
      "Remove Account",
      "Are you sure you want to remove your account? Your account will be permanently deleted after 7 days. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove Account",
          style: "destructive",
          onPress: () => {
            // Here you would implement the actual account deletion logic
            router.replace("/");
            supabase.auth.signOut();
            Alert.alert(
              "Account Removal Initiated",
              "Your account will be deleted in 7 days. You can cancel this action by contacting support."
            );
          },
        },
      ]
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.FunctionContainer,
        isDestructive && styles.DestructiveContainer,
      ]}
      onPress={() => {
        if (Name === "Logout") {
          signOut();
        } else if (Name === "Remove Account") {
          showRemoveAccountAlert();
        } else if (Name === "Saved") {
          router.replace("/Saved");
        } else if (Name === "Language") {
          router.replace("/Language");
        } else if (Name === "Terms of Service") {
          Linking.openURL("https://scarlet-technology.com");
        } else if (Name === "Payments & Subscriptions") {
          router.replace("/Subscriptions");
        }
      }}
    >
      <View style={styles.IconContainer}>
        <Image
          alt=""
          style={styles.ItemIcon}
          resizeMode="contain"
          source={ImageName}
        />
      </View>
      <Text style={[styles.ItemText, isDestructive && styles.DestructiveText]}>
        {Name}
      </Text>
      <View style={styles.ArrowContainer}>
        <Image
          alt=""
          style={styles.ArrowIcon}
          resizeMode="contain"
          source={require("../../assets/icons/next.png")}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function Store() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        if (error.message.includes("Auth session missing")) {
          router.replace("/");
          return;
        }
      }
      if (data?.user) {
        setDisplayName(data.user.user_metadata.display_name ?? null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error.message);
        if (error.message.includes("Auth session missing")) {
          router.replace("/");
          return;
        }
      } else if (data?.user) {
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        } else {
          setUserEmail(null);
        }
      }
    };

    getUserEmail();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.HeaderCard}>
          <View style={styles.AvtContainer}>
            <TouchableOpacity style={styles.Avt}>
              <Image
                alt=""
                style={styles.AvatarImage}
                source={require("../../assets/icons/user-outlined.png")}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.Name}>{displayName || "User"}</Text>
          <Text style={styles.Mail}>{userEmail}</Text>

          <TouchableOpacity
            style={styles.EditProfile}
            onPress={() => router.replace("/EditProfile")}
          >
            <Text style={styles.EditProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.MenuSection}>
          <Text style={styles.SectionTitle}>Account</Text>
          <View style={styles.MenuCard}>
            <Items
              router={router}
              Name="Saved"
              ImageName={require("../../assets/icons/save.png")}
            />
            <View style={styles.Divider} />
            <Items
              router={router}
              Name="Language"
              ImageName={require("../../assets/icons/language.png")}
            />
          </View>
        </View>

        <View style={styles.MenuSection}>
          <Text style={styles.SectionTitle}>Support</Text>
          <View style={styles.MenuCard}>
            <Items
              router={router}
              Name="Terms of Service"
              ImageName={require("../../assets/icons/terms.png")}
            />
            <View style={styles.Divider} />
            <Items
              router={router}
              Name="Payments & Subscriptions"
              ImageName={require("../../assets/icons/payments.png")}
            />
          </View>
        </View>

        <View style={styles.MenuSection}>
          <Text style={styles.SectionTitle}>Danger Zone</Text>
          <View style={styles.MenuCard}>
            <Items
              router={router}
              Name="Remove Account"
              ImageName={require("../../assets/icons/out.png")}
              isDestructive={true}
            />
            <View style={styles.Divider} />
            <Items
              router={router}
              Name="Logout"
              ImageName={require("../../assets/icons/out.png")}
            />
          </View>
        </View>

        <View style={styles.BottomSpacing} />
      </ScrollView>

      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  HeaderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 24,
    marginTop: 60,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  AvtContainer: {
    marginBottom: 16,
  },

  Avt: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.LightBlue,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  AvatarImage: {
    width: "70%",
    height: "70%",
  },

  EditProfile: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: Colors.LightBlue,
    shadowColor: Colors.LightBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  EditProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.Background,
  },

  Name: {
    color: Colors.White,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },

  Mail: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "400",
  },

  MenuSection: {
    marginBottom: 24,
  },

  SectionTitle: {
    color: Colors.White,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
  },

  MenuCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },

  FunctionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  DestructiveContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },

  IconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    marginRight: 16,
  },

  ItemIcon: {
    width: 20,
    height: 20,
  },

  ItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.White,
  },

  DestructiveText: {
    color: "#FF3B30",
  },

  ArrowContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  ArrowIcon: {
    width: 12,
    height: 12,
    tintColor: "rgba(255, 255, 255, 0.5)",
  },

  Divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginLeft: 76,
  },

  BottomSpacing: {
    height: 100,
  },
});

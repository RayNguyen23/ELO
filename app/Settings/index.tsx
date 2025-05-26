import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Linking,
} from "react-native";

import NavBar from "@/components/NavBar";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/config/initSupabase";
import { useRouter } from "expo-router";

interface ItemProps {
  ImageName: ImageSourcePropType;
  Name: string;
  router: any;
}

function Items({ ImageName, Name, router }: ItemProps) {
  async function signOut() {
    await supabase.auth.signOut();
  }
  return (
    <TouchableOpacity
      style={styles.FunctionContainer}
      onPress={() => {
        if (Name === "Logout") {
          signOut();
        } else if (Name === "Saved") {
          router.replace("/Saved");
        } else if (Name === "Language") {
          router.replace("/Language");
        } else if (Name === "Terms of Service") {
          Linking.openURL("https://scarlet-technology.com");
        }
      }}
    >
      <View
        style={{
          width: "20%",
          height: 30,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          alt=""
          style={{ width: "80%", height: "60%" }}
          resizeMode="contain"
          source={ImageName}
        />
      </View>
      <Text
        style={{
          width: "60%",
          fontSize: 14,
          fontWeight: "600",
          color: Colors.White,
        }}
      >
        {Name}
      </Text>
      <View
        style={{
          width: "20%",
          height: 30,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          alt=""
          style={{ width: "80%", height: "60%" }}
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
      } else if (data?.user) {
        if (data?.user?.email) {
          setUserEmail(data.user.email); // safe, it's a string
        } else {
          setUserEmail(null); // fallback if undefined
        }
      }
    };

    getUserEmail();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.AvtContainer}>
        <TouchableOpacity style={styles.Avt}>
          <Image
            alt=""
            style={{
              width: "80%",
              height: "80%",
              justifyContent: "center",
              alignItems: "center",
            }}
            source={require("../../assets/icons/user-outlined.png")}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.Name}>{displayName}</Text>
      <Text style={styles.Mail}>{userEmail}</Text>

      <TouchableOpacity
        style={styles.EditProfile}
        onPress={() => router.replace("/EditProfile")}
      >
        <Text style={{ fontSize: 14, fontWeight: "600" }}>Edit Profile</Text>
      </TouchableOpacity>

      <Items
        router={router}
        Name="Saved"
        ImageName={require("../../assets/icons/save.png")}
      />
      <Items
        router={router}
        Name="Language"
        ImageName={require("../../assets/icons/language.png")}
      />
      <Items
        router={router}
        Name="Terms of Service"
        ImageName={require("../../assets/icons/terms.png")}
      />
      <Items
        router={router}
        Name="Logout"
        ImageName={require("../../assets/icons/out.png")}
      />

      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.Background,
  },

  AvtContainer: {
    width: "100%",
    marginTop: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  Avt: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.White,
  },

  EditProfile: {
    marginTop: 20,
    marginBottom: 80,

    width: "40%",
    height: 30,

    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,

    backgroundColor: Colors.LightBlue,
  },

  Name: { color: Colors.White, fontSize: 18, fontWeight: "600", marginTop: 20 },
  Mail: { color: Colors.White, fontSize: 14, fontWeight: "300", marginTop: 5 },
  FunctionContainer: {
    marginBottom: 30,
    width: "90%",
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    // backgroundColor: Colors.BlurGray,
  },
});

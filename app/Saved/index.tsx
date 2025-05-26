import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { supabase } from "@/config/initSupabase";

import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

interface TopNavProps {
  router: any;
}

function TopNav({ router }: TopNavProps) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity
        style={styles.topNavBtn}
        onPress={() => router.replace("/Settings")}
      >
        <Image
          alt=""
          style={{ width: "40%", height: "40%" }}
          resizeMode="contain"
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function Saved() {
  const [Data, setData] = useState<string[]>([]);

  const router = useRouter();

  async function GetItems() {
    // Step 1: Get the current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error("Auth error:", authError);
      return;
    }

    const uuid = authData.user.id;

    // Step 2: Query Elo_Saved for all entries with this uuid
    const { data, error } = await supabase
      .from("Elo_Saved")
      .select("ImageUrl")
      .eq("uuid", uuid);

    if (error) {
      console.error("Error fetching saved items:", error);
      return;
    }

    // Step 3: Extract ImageUrl list and set it
    const imageUrls = data.map((item) => item.ImageUrl);
    setData(imageUrls);
  }

  useEffect(() => {
    GetItems();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>E L O</Text>

      <TopNav router={router} />

      <View style={{ width: "100%", marginTop: 100, alignItems: "center" }}>
        <FlatList
          data={Data}
          numColumns={2}
          style={{ width: "90%" }}
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 20 }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 15,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.replace({
                  pathname: "/ViewItem",
                  params: { itemUrl: item, to: "/Saved" },
                })
              }
            >
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarContainer: {
    width: "90%",
    height: 40,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    borderColor: Colors.White,
    borderRadius: 10,
    overflow: "hidden",
  },
  searchInput: {
    width: "88%",
    height: "100%",
    paddingLeft: 10,
    fontSize: 12,
    color: Colors.White,
  },
  searchIconContainer: {
    width: "12%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "48%",
    height: 250,
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  logo: {
    position: "absolute",
    color: Colors.White,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 60,
    zIndex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.Background,
  },
  topNav: {
    position: "absolute",
    top: 50,
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingRight: 10,
  },
  topNavBtn: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

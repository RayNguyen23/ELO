import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from "react-native";
import { supabase } from "@/config/initSupabase";

import NavBar from "@/components/NavBar";
import { Colors } from "@/constants/Colors";

function TopNav() {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity style={styles.topNavBtn}>
        <Image
          alt=""
          style={{ width: "50%", height: "50%" }}
          resizeMode="contain"
          source={require("../../assets/icons/user.png")}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.topNavBtn}>
        <Image
          alt=""
          style={{ width: "50%", height: "50%" }}
          resizeMode="contain"
          source={require("../../assets/icons/menu.png")}
        />
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
      <TextInput
        placeholder="Search..."
        placeholderTextColor={Colors.White}
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
        style={styles.searchInput}
      />
      <TouchableOpacity style={styles.searchIconContainer}>
        <Image
          alt=""
          style={{ width: "50%", height: "50%" }}
          resizeMode="contain"
          source={require("../../assets/icons/search.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function Store() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [Data, setData] = useState<string[]>([]);
  async function GetItems() {
    const { data, error } = await supabase.storage
      .from("files") // 'files' is the bucket name
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
      setData(publicUrls);
    }
  }

  useEffect(() => {
    GetItems();
  }, []);

  useEffect(() => {
    const filtered = Data.filter((url) =>
      url.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchQuery, Data]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>E L O</Text>

      <TopNav />

      <View style={{ width: "100%", marginTop: 100, alignItems: "center" }}>
        {/* <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}
        <FlatList
          data={filteredData}
          numColumns={2}
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 20 }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 15,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      </View>

      <NavBar />
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

import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

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

export default function Store() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>E L O</Text>

      <TopNav />

      <ScrollView
        style={{ width: "100%", marginTop: 120 }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <View
          style={{
            width: "90%",
            height: 40,
            borderWidth: 1,

            flexDirection: "row",
            alignItems: "center",

            borderColor: Colors.White,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <TextInput
            placeholder="Search..."
            placeholderTextColor={Colors.White}
            style={{
              width: "88%",
              height: "100%",
              paddingLeft: 10,
              fontSize: 12,
              color: Colors.White,
            }}
          />
          <TouchableOpacity
            style={{
              width: "12%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              alt=""
              style={{ width: "50%", height: "50%" }}
              resizeMode="contain"
              source={require("../../assets/icons/search.png")}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
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

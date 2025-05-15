import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";

export default function NavBar() {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navBtn}>
        <Image
          style={styles.navImage}
          alt=""
          source={require("../assets/icons/stores.png")}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn}>
        <Image
          style={styles.navImage}
          alt=""
          source={require("../assets/icons/upload.png")}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn}>
        <Image
          style={styles.navImage}
          alt=""
          source={require("../assets/icons/settings.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    flexDirection: "row",
    bottom: 30,

    width: "90%",
    height: 50,

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "space-around",

    backgroundColor: Colors.BlurGray,
  },

  navBtn: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  navImage: { width: "80%", height: "80%" },
});

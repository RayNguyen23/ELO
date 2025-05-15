import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";

interface NavBarProps {
  setImage: (uri: string) => void;
}

export default function NavBar({ setImage }: NavBarProps) {
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navBtn}>
        <Image
          style={styles.navImage}
          alt=""
          source={require("../assets/icons/stores.png")}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={pickImage}>
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

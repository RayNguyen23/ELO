import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { removeBackground } from "../constants/RemoveBg";
import { supabase } from "../supabaseClient";

interface NavBarProps {
  setImage: (uri: string) => void;
}

export default function NavBar({ setImage }: NavBarProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;

      const { data, error } = await supabase.storage
        .from("dulieu")
        .upload("DATA/image1.png", uri, {
          cacheControl: "3600",
          upsert: false,
        });
      // try {
      //   const uri = result.assets[0].uri;
      //   const noBgImage = await removeBackground(uri);
      //   setImage(noBgImage); // base64 image with transparent bg
      // } catch (error) {
      //   console.error("Failed to remove background:", error);
      //   Alert.alert("Error", "Failed to remove background from image.");
      // }
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

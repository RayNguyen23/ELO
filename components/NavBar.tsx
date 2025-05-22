import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { removeBackground } from "../constants/RemoveBg";
import { decode as atob } from "base-64";
import { supabase } from "@/config/initSupabase";

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
      try {
        const uri = result.assets[0].uri;
        const noBgImage = await removeBackground(uri); // returns base64
        const uploadedUrl = await uploadBase64Image(noBgImage);
        setImage(uploadedUrl); // now a Supabase public URL
      } catch (error) {
        console.error("Failed to process and upload image:", error);
        Alert.alert("Error", "Failed to process and upload image.");
      }
    }
  };

  const uploadBase64Image = async (base64: string) => {
    try {
      const cleanedBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Uint8Array.from(atob(cleanedBase64), (c) =>
        c.charCodeAt(0)
      );

      const fileName = `images/${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from("files")
        .upload(fileName, buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("files")
        .getPublicUrl(fileName);

      const publicURL = urlData.publicUrl; // here is the fix
      console.log(publicURL);

      return publicURL;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
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

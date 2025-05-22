import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { removeBackground } from "../constants/RemoveBg";
import { decode as atob } from "base-64";
import { supabase } from "@/config/initSupabase";
import { uploadBase64Image } from "@/utils/uploadBase64Image";

interface NavBarProps {
  setImage: (uri: string) => void;
  takePicture: () => void;
}

export default function NavBar({ setImage, takePicture }: NavBarProps) {
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
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
        // setImage(uploadedUrl); // now a Supabase public URL
        setIsUploaded(true);
      } catch (error) {
        console.error("Failed to process and upload image:", error);
        Alert.alert("Error", "Failed to process and upload image.");
      }
    }
  };

  return (
    <>
      {isUploaded === false ? (
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
      ) : (
        <View
          style={{
            position: "absolute",
            flexDirection: "row",
            bottom: 30,
            width: 110,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 50,
            overflow: "hidden",
            backgroundColor: Colors.BlurGray,
          }}
        >
          <TouchableOpacity
            onPress={() => takePicture()}
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              alt=""
              style={{ width: "60%", height: "60%" }}
              resizeMode="contain"
              source={require("../assets/icons/camera.png")}
            />
          </TouchableOpacity>
        </View>
      )}
    </>
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

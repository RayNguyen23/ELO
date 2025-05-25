import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { supabase } from "@/config/initSupabase";
import { uploadBase64Image } from "@/utils/uploadBase64Image";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";

interface NavBarProps {
  setGarment_image?: (e: string) => void;
  takePicture?: () => void;
  isHome?: boolean;
  isUploaded?: boolean;
  setIsUploaded?: (e: boolean) => void;
}

export default function NavBar({
  takePicture,
  setGarment_image,
  isHome,
  isUploaded,
  setIsUploaded,
}: NavBarProps) {
  const router = useRouter();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        // ✅ Convert file URI to base64 string
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // ✅ Add the data URI prefix for proper recognition
        const base64WithPrefix = `data:image/jpeg;base64,${base64}`;

        // ✅ Upload the base64 image and get the public URL
        const uploadedUrl = await uploadBase64Image(base64WithPrefix);

        if (uploadedUrl) {
          setGarment_image?.(uploadedUrl);
          setIsUploaded?.(true);
        } else {
          throw new Error("Image upload failed.");
        }
      }
    } catch (error) {
      console.error("❌ Failed to process and upload image:", error);
      Alert.alert("Error", "Failed to process and upload image.");
    }
  };

  return (
    <>
      {!isUploaded ? (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.replace("/Store")}
          >
            <Image
              style={styles.navImage}
              alt=""
              source={require("../assets/icons/stores.png")}
            />
          </TouchableOpacity>

          {isHome ? (
            <TouchableOpacity style={styles.navBtn} onPress={pickImage}>
              <Image
                style={styles.navImage}
                alt=""
                source={require("../assets/icons/upload.png")}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.replace("/Home")}
            >
              <Image
                style={styles.navImage}
                alt=""
                source={require("../assets/icons/home.png")}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.replace("/Settings")}
          >
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
            onPress={() => takePicture?.()}
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

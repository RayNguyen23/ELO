import { supabase } from "@/config/initSupabase";
import { Colors } from "@/constants/Colors";
import { uploadBase64Image } from "@/utils/uploadBase64Image";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

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

  // ✅ Centralized function to check user login
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return null;
    }
    return data.user;
  };

  const pickImage = async () => {
    const user = await fetchUser();

    // ✅ Redirect to "/" if not logged in
    if (!user) {
      Alert.alert("Login Required", "Please log in to upload an image.");
      router.replace("/");
      return;
    }

    // ✅ Check usage limit
    const { data, error } = await supabase
      .from("Elo_Users")
      .select("current_use, left")
      .eq("uuid", user.id)
      .single();

    if (error) {
      console.log(error);
    } else if (Number(data.current_use) === Number(data.left)) {
      Alert.alert(
        "Out of turns",
        "You’ve used all your turns. Please purchase more to continue."
      );
      router.replace("/Subscriptions");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        // ✅ Convert to base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const base64WithPrefix = `data:image/jpeg;base64,${base64}`;

        // ✅ Upload
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
              onPress={() => {
                router.replace("/Home"), setIsUploaded?.(false);
              }}
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

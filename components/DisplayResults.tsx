import { Colors } from "@/constants/Colors";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import { useState, useEffect } from "react";
import { Fold } from "react-native-animated-spinkit";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { PUSH } from "@/utils/pushDataToSupabase";
import { supabase } from "@/config/initSupabase";

interface DisplayResultsProps {
  setIsShowing: (e: boolean) => void;
  setIsUploaded: (e: boolean) => void;
  ImageKey: string;
  model: string;
  garment: string;
}

export default function DisplayResults({
  setIsShowing,
  setIsUploaded,
  ImageKey,
  model,
  garment,
}: DisplayResultsProps) {
  const [result, setResult] = useState<string>("");
  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms));

  async function GetImage() {
    await delay(15000);
    try {
      console.log("Receive: ", ImageKey);
      const response = await axios.get(
        `https://api.fashn.ai/v1/status/${ImageKey}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_FASHN_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ API response:", response.data);
      const DATA = response.data.output;
      let elm = "";
      DATA.forEach((element: any) => {
        console.log(element);
        setResult(element);
        elm = element;
      });
      SendToDb(elm);
    } catch (error) {
      console.error("❌ Error calling Fashn API:");
    }
  }

  async function saveImageToDevice() {
    try {
      // Ask for permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to media library."
        );
        return;
      }

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(result);
      Alert.alert("Success", "Image saved to your device.");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save image.");
    }
  }

  async function SendToDb(elm: string) {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error.message);
    } else {
      console.log("User data:", data.user.id);
    }
    PUSH("Elo_Images", {
      model: model,
      garment: garment,
      result: elm,
      userid: data.user?.id,
    });
  }

  async function shareImage() {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        alert("Sharing is not available on this device");
        return;
      }
      await Sharing.shareAsync(result);
    } catch (error) {
      console.error("Error sharing image:", error);
      alert("Failed to share image");
    }
  }

  useEffect(() => {
    GetImage();
  }, []);

  return (
    <>
      {result === "" ? (
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.Background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Fold size={64} color="#FFF" />
          <Text style={{ color: Colors.White, marginTop: 30 }}>
            Processing...
          </Text>
        </View>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            alt=""
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
            source={{
              uri: result,
            }}
          />
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => {
                setIsShowing(false);
                setIsUploaded(false);
              }}
            >
              <Image
                style={styles.navImage}
                alt=""
                source={require("../assets/icons/home.png")}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => saveImageToDevice()}
            >
              <Image
                style={styles.navImage}
                alt=""
                source={require("../assets/icons/download.png")}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => shareImage()}
            >
              <Image
                style={styles.navImage}
                alt=""
                source={require("../assets/icons/share.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },

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

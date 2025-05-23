import { Colors } from "@/constants/Colors";
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import { useState, useEffect } from "react";
import { Fold } from "react-native-animated-spinkit";

interface DisplayResultsProps {
  setIsShowing: (e: boolean) => void;
  ImageKey: string;
}

export default function DisplayResults({
  setIsShowing,
  ImageKey,
}: DisplayResultsProps) {
  const [result, setResult] = useState<string>("");
  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms));
  async function GetImage() {
    await delay(30000);

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
      DATA.forEach((element: any) => {
        console.log(element);
        setResult(element);
      });
    } catch (error) {
      console.error("❌ Error calling Fashn API:");
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
              onPress={() => setIsShowing(false)}
            >
              <Image
                style={styles.navImage}
                alt=""
                source={require("../assets/icons/home.png")}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navBtn}>
              <Image
                style={styles.navImage}
                alt=""
                source={require("../assets/icons/download.png")}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navBtn}>
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

import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { uploadBase64Image } from "@/utils/uploadBase64Image";
import axios from "axios";
import { Swing } from "react-native-animated-spinkit";
import { supabase } from "@/config/initSupabase";
import { useLocalSearchParams } from "expo-router";

import NavBar from "../../components/NavBar";
import { Colors } from "../../constants/Colors";

import DisplayResults from "@/components/DisplayResults";

export default function Home() {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isShowing, setIsShowing] = useState<boolean>(false);
  const [model_Image, setModel_Image] = useState<string>("");
  const [garment_image, setGarment_image] = useState<string>("");
  const [ImageKey, setImageKey] = useState<string>("");
  const [IsDisplayLoader, setIsDisplayLoader] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const { itemUrl = "" } = useLocalSearchParams();
  const imageUrl = Array.isArray(itemUrl) ? itemUrl[0] : itemUrl;

  useEffect(() => {
    if (imageUrl) {
      setGarment_image(imageUrl);
      setIsUploaded(true);
    }
  }, [imageUrl]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePicture() {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: true,
      });

      if (!photo?.base64) throw new Error("No base64 data in photo");
      setIsDisplayLoader(true);
      const base64 = `data:image/jpeg;base64,${photo.base64}`;
      const uploadedUrl = await uploadBase64Image(base64);

      setModel_Image(uploadedUrl);

      try {
        console.log(uploadedUrl, garment_image);
        const response = await axios.post(
          "https://api.fashn.ai/v1/run",
          {
            model_image: uploadedUrl,
            garment_image: garment_image,
            category: "tops",
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_FASHN_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✅ API response:", response.data.id);
        setImageKey(response.data.id);
        setIsShowing(true);
        setIsDisplayLoader(false);
      } catch (error) {
        console.error("❌ Error calling Fashn API:");
      }
    } catch (error) {
      console.error("Failed to take and upload photo:", error);
      Alert.alert("Error", "Failed to take and upload photo.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      {isShowing ? (
        <DisplayResults
          setIsUploaded={setIsUploaded}
          model={model_Image}
          garment={garment_image}
          setIsShowing={setIsShowing}
          ImageKey={ImageKey}
        />
      ) : (
        <View style={styles.container}>
          <Text style={styles.logo}>E L O</Text>
          <View style={styles.CameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            ></CameraView>
          </View>
          <TouchableOpacity
            style={styles.revertBtn}
            onPress={() => toggleCameraFacing()}
          >
            <Image
              resizeMode="contain"
              style={{ width: "80%", height: "80%" }}
              alt=""
              source={require("../../assets/icons/revert.png")}
            />
          </TouchableOpacity>
          {isUploaded ? (
            <TouchableOpacity
              style={styles.outBtn}
              onPress={() => setIsUploaded(false)}
            >
              <Image
                resizeMode="contain"
                style={{ width: "60%", height: "60%" }}
                alt=""
                source={require("../../assets/icons/back.png")}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.outBtn} onPress={() => signOut()}>
              <Image
                resizeMode="contain"
                style={{ width: "80%", height: "80%" }}
                alt=""
                source={require("../../assets/icons/out.png")}
              />
            </TouchableOpacity>
          )}

          {IsDisplayLoader === false ? <></> : <DisplayLoader />}
          <NavBar
            takePicture={takePicture}
            setGarment_image={setGarment_image}
            isHome={true}
            isUploaded={isUploaded}
            setIsUploaded={setIsUploaded}
          />
        </View>
      )}
    </>
  );
}

function DisplayLoader() {
  return (
    <View
      style={{
        width: "100%",
        position: "absolute",
        top: "45%",
        zIndex: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Swing size={60} color="#FFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
    alignItems: "center",
  },

  logo: {
    position: "absolute",
    color: Colors.White,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 60,
    zIndex: 1,
  },

  CameraContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },

  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  revertBtn: {
    width: 30,
    height: 30,
    position: "absolute",
    marginTop: 60,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  outBtn: {
    width: 30,
    height: 30,
    position: "absolute",
    marginTop: 60,
    left: 20,
    justifyContent: "center",
    alignItems: "center",
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

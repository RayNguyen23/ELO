import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useRef } from "react";
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/config/initSupabase";
import { uploadBase64Image } from "@/utils/uploadBase64Image";

import NavBar from "../../components/NavBar";
import { Colors } from "../../constants/Colors";

export default function Home() {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: true,
      });

      if (!photo?.base64) throw new Error("No base64 data in photo");

      const base64 = `data:image/jpeg;base64,${photo.base64}`;
      const uploadedUrl = await uploadBase64Image(base64);

      setImage(uploadedUrl);
    } catch (error) {
      console.error("Failed to take and upload photo:", error);
      Alert.alert("Error", "Failed to take and upload photo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>E L O</Text>
      <View style={styles.CameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        ></CameraView>
        {image && (
          <Image
            resizeMode="center"
            source={{ uri: image }}
            style={{ position: "absolute", width: "80%", height: "80%" }}
          />
        )}
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
      <NavBar setImage={setImage} takePicture={takePicture} />
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
    marginTop: 50,
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
    marginTop: 50,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

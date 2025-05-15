import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import NavBar from "../components/NavBar";
import { Colors } from "../constants/Colors";

export default function App() {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>E L O</Text>
      <View style={styles.CameraContainer}>
        <CameraView style={styles.camera} facing={facing}></CameraView>
        {image && (
          <Image
            resizeMode="center"
            source={{ uri: image }}
            style={{ position: "absolute", width: "80%" }}
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
          source={require("../assets/icons/revert.png")}
        />
      </TouchableOpacity>
      <NavBar setImage={setImage} />
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

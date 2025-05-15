import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";

import NavBar from "../components/NavBar";
import { Colors } from "../constants/Colors";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>E L O</Text>
      <View style={styles.CameraContainer}>
        <Camera style={styles.camera} type={Camera.Constants.Type.back} />
      </View>
      <NavBar />
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
});

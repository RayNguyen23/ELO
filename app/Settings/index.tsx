import React from "react";
import { View, StyleSheet, Text } from "react-native";

import NavBar from "@/components/NavBar";

export default function Store() {
  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

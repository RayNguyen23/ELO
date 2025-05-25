import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

interface BottomProps {
  IsSaved: boolean;
  setIsSaved: (e: boolean) => void;
  MoveToHome: () => void;
}

function BottomNav({ IsSaved, setIsSaved, MoveToHome }: BottomProps) {
  return (
    <View style={styles.BottomContainer}>
      <TouchableOpacity
        style={{
          width: "25%",
          height: "80%",
          backgroundColor: Colors.BlurGray,
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          if (IsSaved === false) {
            setIsSaved(true);
          } else {
            setIsSaved(false);
          }
        }}
      >
        {IsSaved ? (
          <Image
            alt=""
            style={{ width: "50%", height: "50%" }}
            resizeMode="contain"
            source={require("../../assets/icons/saved.png")}
          />
        ) : (
          <Image
            alt=""
            style={{ width: "50%", height: "50%" }}
            resizeMode="contain"
            source={require("../../assets/icons/save.png")}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: "70%",
          height: "80%",
          borderRadius: 10,
          backgroundColor: Colors.LightBlue,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => MoveToHome()}
      >
        <Text style={{ color: Colors.Black, fontSize: 14, fontWeight: "600" }}>
          Use this Item
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ViewItem() {
  const [IsSaved, setIsSaved] = useState<boolean>(false);
  const { itemUrl } = useLocalSearchParams();
  const imageUrl = Array.isArray(itemUrl) ? itemUrl[0] : itemUrl;
  const router = useRouter();

  function MoveToHome() {
    router.replace({
      pathname: "/Home",
      params: { itemUrl: imageUrl },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>E L O</Text>
      <TouchableOpacity
        style={styles.outBtn}
        onPress={() => router.replace("/Store")}
      >
        <Image
          resizeMode="contain"
          style={{ width: "60%", height: "60%" }}
          alt=""
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
      <View style={styles.ImageContainer}>
        <Image
          alt=""
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          source={{ uri: imageUrl }}
        />
      </View>
      <BottomNav
        IsSaved={IsSaved}
        setIsSaved={setIsSaved}
        MoveToHome={MoveToHome}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    position: "absolute",
    color: Colors.White,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 60,
    zIndex: 1,
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
  container: {
    flex: 1,
    alignItems: "center",

    backgroundColor: Colors.Background,
  },

  ImageContainer: {
    position: "absolute",
    top: "18%",
    zIndex: 10,

    width: "90%",
    height: "65%",

    borderRadius: 10,

    backgroundColor: Colors.White,
    overflow: "hidden",
  },

  BottomContainer: {
    position: "absolute",
    bottom: 30,

    width: "90%",
    height: 50,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

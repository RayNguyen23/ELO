import { supabase } from "@/config/initSupabase";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";

interface ItemProps {
  Name: string;
}

interface TopNavProps {
  router: any;
}

function Items({ Name }: ItemProps) {
  return (
    <TouchableOpacity
      style={styles.FunctionContainer}
      onPress={() => {
        if (Name === "Vietnamese") {
          Alert.alert("This language will coming soon !");
        }
      }}
    >
      <Text
        style={{
          paddingLeft: "10%",
          width: "80%",
          fontSize: 14,
          fontWeight: "600",
          color: Colors.White,
        }}
      >
        {Name}
      </Text>

      {Name === "English" ? (
        <View
          style={{
            width: "20%",
            height: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.White }}>Selected</Text>
        </View>
      ) : (
        <View
          style={{
            width: "20%",
            height: 30,
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <Image
            alt=""
            style={{ width: "80%", height: "60%" }}
            resizeMode="contain"
            source={require("../../assets/icons/next.png")}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

function TopNav({ router }: TopNavProps) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity
        style={styles.topNavBtn}
        onPress={() => router.replace("/Settings")}
      >
        <Image
          alt=""
          style={{ width: "40%", height: "40%" }}
          resizeMode="contain"
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function Language() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TopNav router={router} />
      <Text style={styles.logo}>E L O</Text>

      <View>
        <Items Name="English" />
        <Items Name="Vietnamese" />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.Background,
  },

  FunctionContainer: {
    marginBottom: 30,
    width: "90%",
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    // backgroundColor: Colors.BlurGray,
  },

  topNav: {
    position: "absolute",
    top: 50,
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingRight: 10,
  },
  topNavBtn: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    position: "absolute",
    color: Colors.White,
    fontSize: 20,
    fontWeight: "bold",
    top: 60,
    zIndex: 1,
  },
});

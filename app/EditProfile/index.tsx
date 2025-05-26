import { supabase } from "@/config/initSupabase";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";

export default function EditProfile() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [IsHide, setIsHide] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) return;

      const uuid = authData.user.id;

      const { data, error } = await supabase
        .from("Elo_Users")
        .select("email, password")
        .eq("uuid", uuid)
        .single();

      if (!error && data) {
        setUserInfo({ email: data.email, password: data.password });
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setDisplayName(data.user.user_metadata.display_name ?? null);
      }
    };

    fetchUser();
  }, []);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.outBtn}
        onPress={() => router.replace("/Settings")}
      >
        <Image
          resizeMode="contain"
          style={{ width: "60%", height: "60%" }}
          alt=""
          source={require("../../assets/icons/back.png")}
        />
      </TouchableOpacity>
      <View style={styles.AvtContainer}>
        <TouchableOpacity style={styles.Avt}>
          <Image
            alt=""
            style={{
              width: "80%",
              height: "80%",
              justifyContent: "center",
              alignItems: "center",
            }}
            source={require("../../assets/icons/user-outlined.png")}
          />
        </TouchableOpacity>
      </View>
      <Text
        style={{
          width: "90%",
          color: Colors.White,
          fontSize: 20,
          fontWeight: "600",
          marginTop: 50,
        }}
      >
        Personal
      </Text>
      <View
        style={{
          marginTop: 20,
          width: "90%",
          height: 40,
          borderRadius: 10,
          justifyContent: "center",
          backgroundColor: Colors.LightGray,
        }}
      >
        <Text style={{ marginLeft: 10, fontWeight: "600", fontSize: 14 }}>
          {displayName}
        </Text>
      </View>
      <View
        style={{
          marginTop: 20,
          width: "90%",
          height: 40,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={styles.info}>
          <Text
            style={{
              width: "80%",
              fontWeight: "600",
              fontSize: 14,
              color: Colors.White,
              textAlign: "center",
            }}
          >
            None
          </Text>
          <Image
            alt=""
            style={{ width: "15%", height: 20, marginRight: 10 }}
            resizeMode="contain"
            source={require("../../assets/icons/gender.png")}
          />
        </View>
        <View style={styles.info}>
          <Text
            style={{
              width: "80%",
              fontWeight: "600",
              fontSize: 14,
              color: Colors.White,
              textAlign: "center",
            }}
          >
            None
          </Text>
          <Image
            alt=""
            style={{ width: "15%", height: 20, marginRight: 10 }}
            resizeMode="contain"
            source={require("../../assets/icons/birthday.png")}
          />
        </View>
      </View>
      <Text
        style={{
          width: "90%",
          color: Colors.White,
          fontSize: 20,
          fontWeight: "600",
          marginTop: 50,
        }}
      >
        Email & Password
      </Text>
      <View
        style={{
          marginTop: 20,
          width: "90%",
          height: 40,
          borderRadius: 10,
          justifyContent: "center",
          backgroundColor: Colors.BlurGray,
        }}
      >
        <Text
          style={{
            marginLeft: 10,
            fontWeight: "600",
            fontSize: 14,
            color: Colors.White,
          }}
        >
          {userInfo?.email}
        </Text>
      </View>
      <View
        style={{
          marginTop: 20,
          width: "90%",
          height: 40,
          borderRadius: 10,
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          backgroundColor: Colors.BlurGray,
        }}
      >
        <Text
          style={{
            marginLeft: 10,
            fontWeight: "600",
            fontSize: 14,
            color: Colors.White,
          }}
        >
          {IsHide ? "••••••••" : userInfo?.password}
        </Text>
        {IsHide ? (
          <TouchableOpacity onPress={() => setIsHide(false)}>
            <Image
              alt=""
              style={{ width: 20, height: 20, marginRight: 10 }}
              resizeMode="contain"
              source={require("../../assets/icons/see.png")}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsHide(true)}>
            <Image
              alt=""
              style={{ width: 20, height: 20, marginRight: 10 }}
              resizeMode="contain"
              source={require("../../assets/icons/hide.png")}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",

    backgroundColor: Colors.Background,
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

  AvtContainer: {
    width: "100%",
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  Avt: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.White,
  },
  info: {
    width: "48%",
    height: "100%",
    borderRadius: 10,
    borderColor: Colors.LightGray,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/config/initSupabase";
import { PUSH } from "@/utils/pushDataToSupabase";
import { REMOVE, REMOVE_BY_UUID_AND_URL } from "@/utils/removeDataFromSupabase";

interface BottomProps {
  IsSaved: boolean;
  ImageUrl: string;
  setIsSaved: (e: boolean) => void;
  MoveToHome: () => void;
}

function BottomNav({ IsSaved, setIsSaved, MoveToHome, ImageUrl }: BottomProps) {
  async function SaveImage(ImageUrl: string) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return;

    const uuid = authData.user.id;
    PUSH("Elo_Saved", { uuid: uuid, ImageUrl: ImageUrl });
  }

  async function RemoveImage() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return;

    const uuid = authData.user.id;
    await REMOVE_BY_UUID_AND_URL("Elo_Saved", uuid, ImageUrl);
  }

  async function checkIfSaved(imageUrl: string): Promise<boolean> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return false;

    const uuid = authData.user.id;

    const { data, error } = await supabase
      .from("Elo_Saved")
      .select("*")
      .eq("uuid", uuid)
      .eq("ImageUrl", imageUrl);

    if (error) {
      console.error("Check saved error:", error);
      return false;
    }

    return data.length > 0;
  }

  useEffect(() => {
    async function checkSavedStatus() {
      if (ImageUrl) {
        const saved = await checkIfSaved(ImageUrl);
        setIsSaved(saved);
      }
    }

    checkSavedStatus();
  }, [ImageUrl]);

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
            SaveImage(ImageUrl);
          } else {
            setIsSaved(false);
            RemoveImage();
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
  const { itemUrl, to } = useLocalSearchParams();
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
        onPress={() => {
          const destination = Array.isArray(to) ? to[0] : to;
          if (destination) {
            router.replace(destination as any);
          } else {
            console.warn("No destination provided.");
          }
        }}
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
        ImageUrl={imageUrl}
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

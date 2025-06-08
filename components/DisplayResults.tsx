import { supabase } from "@/config/initSupabase";
import { Colors } from "@/constants/Colors";
import { PUSH } from "@/utils/pushDataToSupabase";
import axios from "axios";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface DisplayResultsProps {
  setIsShowing: (e: boolean) => void;
  setIsUploaded: (e: boolean) => void;
  ImageKey: string;
  model: string;
  garment: string;
}

function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    { title: "Analyzing your style", icon: "👗", duration: 3000 },
    { title: "Processing garment details", icon: "🎨", duration: 4000 },
    { title: "Applying AI magic", icon: "✨", duration: 4000 },
    { title: "Creating your look", icon: "🔮", duration: 3000 },
    { title: "Almost ready!", icon: "🎉", duration: 1000 },
  ];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Progress and step animation
    let totalTime = 0;
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);

        // Animate progress
        Animated.timing(progressAnim, {
          toValue: (index + 1) / steps.length,
          duration: step.duration,
          useNativeDriver: false,
        }).start();

        setProgress(((index + 1) / steps.length) * 100);
      }, totalTime);

      totalTime += step.duration;
    });

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        style={styles.gradientBackground}
      >
        {/* Floating particles background */}
        <View style={styles.particlesContainer}>
          {[...Array(20)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [0.5 + Math.random() * 0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.loadingContent}>
          {/* Main loading icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.outerRing,
                {
                  transform: [{ rotate: spin }, { scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                style={styles.ringGradient}
              />
            </Animated.View>

            <View style={styles.centerIcon}>
              <Text style={styles.iconEmoji}>
                {steps[currentStep]?.icon || "✨"}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>

          {/* Current step */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {steps[currentStep]?.title || "Processing..."}
            </Text>
            <Text style={styles.stepSubtitle}>
              Creating your perfect look with AI magic
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Did you know?</Text>
            <Text style={styles.tipsText}>
              Our AI analyzes over 1000 style parameters to create the perfect
              fit for you!
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function ResultsScreen({
  result,
  setIsShowing,
  setIsUploaded,
  saveImageToDevice,
  shareImage,
}: {
  result: string;
  setIsShowing: (e: boolean) => void;
  setIsUploaded: (e: boolean) => void;
  saveImageToDevice: () => void;
  shareImage: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.resultsContainer}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your AI Creation</Text>
        <Text style={styles.headerSubtitle}>Swipe to save or share</Text>
      </LinearGradient>

      {/* Result Image */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Image
          alt="AI Generated Result"
          style={styles.resultImage}
          resizeMode="contain"
          source={{ uri: result }}
        />

        {/* Success badge */}
        <View style={styles.successBadge}>
          <Text style={styles.successText}>✨ Ready!</Text>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BlurView intensity={80} style={styles.actionBlur}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setIsShowing(false);
                setIsUploaded(false);
              }}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.buttonGradient}
              >
                <Image
                  style={styles.actionIcon}
                  alt="Home"
                  source={require("../assets/icons/home.png")}
                />
                <Text style={styles.actionText}>Home</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={saveImageToDevice}
            >
              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.buttonGradient}
              >
                <Image
                  style={styles.actionIcon}
                  alt="Download"
                  source={require("../assets/icons/download.png")}
                />
                <Text style={styles.actionText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={shareImage}>
              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                style={styles.buttonGradient}
              >
                <Image
                  style={styles.actionIcon}
                  alt="Share"
                  source={require("../assets/icons/share.png")}
                />
                <Text style={styles.actionText}>Share</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

export default function DisplayResults({
  setIsShowing,
  setIsUploaded,
  ImageKey,
  model,
  garment,
}: DisplayResultsProps) {
  const [result, setResult] = useState<string>("");
  const [CurrentUse, setCurrentUse] = useState<string>("");
  const [Max, setMax] = useState<string>("");
  const [UUID, setUUID] = useState<string>("");

  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms));

  async function GetImage() {
    await delay(15000);
    try {
      const response = await axios.get(
        `https://api.fashn.ai/v1/status/${ImageKey}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_FASHN_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const DATA = response.data.output;
      let elm = "";
      DATA.forEach((element: any) => {
        setResult(element);
        elm = element;
      });
      SendToDb(elm);
      const CurrentUseToInt = Number(CurrentUse);
      const { data, error } = await supabase
        .from("Elo_Users")
        .update({
          current_use: CurrentUseToInt + 1,
        })
        .eq("uuid", UUID);

      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error("❌ Error calling Fashn API:");
    }
  }

  async function saveImageToDevice() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to media library."
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(result);
      Alert.alert("Success", "Image saved to your device.");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save image.");
    }
  }

  async function SendToDb(elm: string) {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error.message);
    } else {
      console.log("User data:", data.user.id);
    }
    PUSH("Elo_Images", {
      model: model,
      garment: garment,
      result: elm,
      userid: data.user?.id,
    });
  }

  async function shareImage() {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        alert("Sharing is not available on this device");
        return;
      }
      await Sharing.shareAsync(result);
    } catch (error) {
      console.error("Error sharing image:", error);
      alert("Failed to share image");
    }
  }

  useEffect(() => {
    GetImage();
  }, []);

  useEffect(() => {
    async function GetTurns() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) return;

      const uuid = authData.user.id;
      const { data, error } = await supabase
        .from("Elo_Users")
        .select("current_use, left")
        .eq("uuid", uuid)
        .single();
      if (error) {
        console.log(error);
      } else {
        setCurrentUse(data.current_use);
        setMax(data.left);
        setUUID(uuid);
      }
    }
    GetTurns();
  }, []);

  return (
    <>
      {result === "" ? (
        <LoadingScreen />
      ) : (
        <ResultsScreen
          result={result}
          setIsShowing={setIsShowing}
          setIsUploaded={setIsUploaded}
          saveImageToDevice={saveImageToDevice}
          shareImage={shareImage}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
  },

  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },

  loadingContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },

  iconContainer: {
    position: "relative",
    marginBottom: 40,
  },

  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  ringGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },

  centerIcon: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },

  iconEmoji: {
    fontSize: 32,
  },

  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },

  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },

  progressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  stepContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  stepTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  stepSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },

  tipsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    backdropFilter: "blur(10px)",
  },

  tipsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  tipsText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    lineHeight: 20,
  },

  // Results Screen Styles
  resultsContainer: {
    flex: 1,
    backgroundColor: Colors.Background,
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
    zIndex: 10,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },

  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },

  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  resultImage: {
    width: "100%",
    height: "100%",
  },

  successBadge: {
    position: "absolute",
    top: 140,
    right: 20,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: "blur(10px)",
  },

  successText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  actionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  actionBlur: {
    borderRadius: 25,
    overflow: "hidden",
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },

  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },

  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  actionIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
    marginBottom: 8,
  },

  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

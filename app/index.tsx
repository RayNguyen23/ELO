import { Colors } from "@/constants/Colors";
import { PUSH } from "@/utils/pushDataToSupabase";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { supabase } from "../config/initSupabase";

const { width, height } = Dimensions.get("window");

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const generateRandomCode = (): string => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  // Sign in with email and password
  const onSignInPress = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert("Sign In Error", error.message);
    setLoading(false);
  };

  const onSignUpPress = async () => {
    if (!email || !password || !displayName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (data.user) {
      await PUSH("Elo_Users", {
        email: email,
        password: password,
        uuid: data.user.id,
        display_name: displayName,
        transfer_code: generateRandomCode(),
      });
    }

    if (error) {
      Alert.alert("Sign Up Error", error.message);
    } else {
      Alert.alert("Success", "Account created successfully!");
    }
    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    // Clear form when switching modes
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Spinner visible={loading} />

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>
            E{"   "}L{"   "}O
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Auth Mode Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !isSignUp && styles.activeToggle]}
              onPress={() => (!isSignUp ? null : toggleAuthMode())}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isSignUp && styles.activeToggleText,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, isSignUp && styles.activeToggle]}
              onPress={() => (isSignUp ? null : toggleAuthMode())}
            >
              <Text
                style={[styles.toggleText, isSignUp && styles.activeToggleText]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                placeholder="Enter your display name"
                placeholderTextColor={Colors.White + "80"}
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.inputField}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={Colors.White + "80"}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              style={styles.inputField}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={Colors.White + "80"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
            />
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor={Colors.White + "80"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.inputField}
              />
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            onPress={isSignUp ? onSignUpPress : onSignInPress}
            style={styles.primaryButton}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {isSignUp ? "Create Account" : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Alternative Action */}
          <View style={styles.alternativeContainer}>
            <Text style={styles.alternativeText}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.alternativeLink}>
                {isSignUp ? " Sign In" : " Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151515",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.White + "80",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#363636",
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: "#2b825b",
  },
  toggleText: {
    color: Colors.White + "80",
    fontSize: 16,
    fontWeight: "500",
  },
  activeToggleText: {
    color: "#fff",
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputField: {
    height: 50,
    borderWidth: 1,
    borderColor: "#363636",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#fff",
    backgroundColor: "#363636",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#2b825b",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2b825b",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  alternativeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  alternativeText: {
    color: Colors.White + "80",
    fontSize: 14,
  },
  alternativeLink: {
    color: "#2b825b",
    fontSize: 14,
    fontWeight: "600",
  },
});

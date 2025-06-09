import { supabase } from "@/config/initSupabase";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Clipboard,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface HeaderProps {
  onBackPress: () => void;
}

interface PaymentMethodCardProps {
  title: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
  icon: string;
  disabled?: boolean;
}

interface BankCardProps {
  accountNumber: string;
  accountName: string;
  bankName: string;
}

interface QRSectionProps {
  qrImage: any;
}

interface TransferDetailsProps {
  transferCode: string;
  amount?: string;
}

const Header: React.FC<HeaderProps> = ({ onBackPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={24} color={Colors.White} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Payment Methods</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
};

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  title,
  subtitle,
  isSelected,
  onPress,
  icon,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.paymentMethodCard,
        isSelected && styles.paymentMethodCardSelected,
        disabled && styles.paymentMethodCardDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`${title} payment method`}
    >
      <View style={styles.paymentMethodContent}>
        <View
          style={[
            styles.paymentMethodIcon,
            isSelected && styles.paymentMethodIconSelected,
          ]}
        >
          <Ionicons
            name={icon as any}
            size={24}
            color={isSelected ? Colors.Background : Colors.LightBlue}
          />
        </View>
        <View style={styles.paymentMethodText}>
          <Text
            style={[styles.paymentMethodTitle, disabled && styles.disabledText]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.paymentMethodSubtitle,
              disabled && styles.disabledText,
            ]}
          >
            {subtitle}
          </Text>
        </View>
        {disabled && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        )}
      </View>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark" size={16} color={Colors.Background} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const QRSection: React.FC<QRSectionProps> = ({ qrImage }) => {
  return (
    <View style={styles.qrSection}>
      <Text style={styles.sectionTitle}>Scan QR Code</Text>
      <View style={styles.qrContainer}>
        <View style={styles.qrWrapper}>
          <Image source={qrImage} style={styles.qrImage} resizeMode="contain" />
        </View>
        <Text style={styles.qrSubtext}>
          Scan this QR code with your banking app
        </Text>
      </View>
    </View>
  );
};

const BankCard: React.FC<BankCardProps> = ({
  accountNumber,
  accountName,
  bankName,
}) => {
  return (
    <View style={styles.bankCard}>
      <View style={styles.bankCardHeader}>
        <Ionicons name="card" size={24} color={Colors.LightBlue} />
        <Text style={styles.bankCardTitle}>Bank Details</Text>
      </View>
      <View style={styles.bankCardContent}>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankDetailLabel}>Account Number</Text>
          <Text style={styles.bankDetailValue}>{accountNumber}</Text>
        </View>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankDetailLabel}>Account Name</Text>
          <Text style={styles.bankDetailValue}>{accountName}</Text>
        </View>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankDetailLabel}>Bank</Text>
          <Text style={styles.bankDetailValue}>{bankName}</Text>
        </View>
      </View>
    </View>
  );
};

const TransferDetails: React.FC<TransferDetailsProps> = ({
  transferCode,
  amount,
}) => {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setString(text);
      if (Platform.OS === "android") {
        ToastAndroid.show(`${label} copied to clipboard`, ToastAndroid.SHORT);
      } else {
        Alert.alert("Copied", `${label} copied to clipboard`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  return (
    <View style={styles.transferDetails}>
      <Text style={styles.sectionTitle}>Transfer Details</Text>

      <View style={styles.transferCard}>
        <View style={styles.transferRow}>
          <Text style={styles.transferLabel}>Transfer Code</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(transferCode, "Transfer code")}
          >
            <Text style={styles.transferValue}>{transferCode}</Text>
            <Ionicons name="copy-outline" size={16} color={Colors.LightBlue} />
          </TouchableOpacity>
        </View>

        {amount && (
          <View style={styles.transferRow}>
            <Text style={styles.transferLabel}>Amount</Text>
            <Text style={styles.transferValue}>{amount}</Text>
          </View>
        )}
      </View>

      <View style={styles.instructionCard}>
        <Ionicons
          name="information-circle"
          size={20}
          color={Colors.LightBlue}
        />
        <Text style={styles.instructionText}>
          Use the transfer code above as the payment reference when making your
          transfer
        </Text>
      </View>
    </View>
  );
};

export default function Payments() {
  const router = useRouter();
  const { amount, to } = useLocalSearchParams();
  const Amount = Array.isArray(amount) ? amount[0] : amount;
  const [TransferCode, setTransferCode] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<
    "domestic" | "international"
  >("domestic");

  const handleBackPress = () => {
    if (to === "Subscriptions") {
      router.replace("/Subscriptions");
    } else if (to === "Store") {
      router.replace("/Store");
    } else {
      console.log("Unknown router");
    }
  };

  const handleMethodSelect = (method: "domestic" | "international") => {
    if (method === "international") {
      Alert.alert(
        "Coming Soon",
        "International payments will be available soon!",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    setSelectedMethod(method);
  };

  const bankData = {
    accountNumber: "49002802",
    accountName: "SCARLET TECHNOLOGY",
    bankName: "TECHCOMBANK",
  };

  async function GetTransferCode() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return;

    const uuid = authData.user.id;
    const { data, error } = await supabase
      .from("Elo_Users")
      .select("transfer_code")
      .eq("uuid", uuid);

    if (error) {
      console.error("Supabase error:", error);
    } else {
      setTransferCode(data?.[0]?.transfer_code);
    }
  }

  async function DoneTransacton() {
    const { data, error } = await supabase.from("Elo_Upgrade").insert({
      transfer_id: TransferCode,
      amount: Amount,
      isDone: false,
    });
    if (error) {
      console.error("Supabase error:", error);
    } else {
      Alert.alert(
        "Processing Your Payment",
        "Please come back in a few minutes!"
      );
      router.replace("/Home");
    }
  }

  useEffect(() => {
    GetTransferCode();
  }, []);

  return (
    <View style={styles.container}>
      <Header onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.methodSelector}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>

          <PaymentMethodCard
            title="Domestic Transfer"
            subtitle="Bank transfer within Vietnam"
            icon="home"
            isSelected={selectedMethod === "domestic"}
            onPress={() => handleMethodSelect("domestic")}
          />

          <PaymentMethodCard
            title="International Transfer"
            subtitle="Global payment options"
            icon="globe"
            isSelected={selectedMethod === "international"}
            onPress={() => handleMethodSelect("international")}
            disabled={true}
          />
        </View>

        {selectedMethod === "domestic" && (
          <>
            <QRSection qrImage={require("../../assets/images/qrcode.jpeg")} />

            <BankCard
              accountNumber={bankData.accountNumber}
              accountName={bankData.accountName}
              bankName={bankData.bankName}
            />

            <TransferDetails transferCode={TransferCode} amount={Amount} />
          </>
        )}
        <TouchableOpacity
          style={{
            marginBottom: 30,
            width: "100%",
            height: 40,
            backgroundColor: Colors.LightBlue,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => DoneTransacton()}
        >
          <Text
            style={{ fontSize: 16, color: Colors.Black, fontWeight: "600" }}
          >
            Complete
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.Background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BlurGray,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.White,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.White,
    marginBottom: 16,
  },
  methodSelector: {
    marginBottom: 32,
  },
  paymentMethodCard: {
    backgroundColor: Colors.BlurGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodCardSelected: {
    borderColor: Colors.LightBlue,
    backgroundColor: Colors.BlurGray,
  },
  paymentMethodCardDisabled: {
    opacity: 0.6,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.Background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  paymentMethodIconSelected: {
    backgroundColor: Colors.LightBlue,
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.White,
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: Colors.LightGray,
  },
  disabledText: {
    color: Colors.LightGray,
  },
  comingSoonBadge: {
    backgroundColor: Colors.LightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.Background,
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.LightBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  qrSection: {
    marginBottom: 32,
  },
  qrContainer: {
    alignItems: "center",
  },
  qrWrapper: {
    width: 200,
    height: 200,
    backgroundColor: Colors.White,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  qrSubtext: {
    fontSize: 14,
    color: Colors.LightGray,
    textAlign: "center",
    maxWidth: 250,
  },
  bankCard: {
    backgroundColor: Colors.BlurGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  bankCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bankCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.White,
    marginLeft: 12,
  },
  bankCardContent: {
    gap: 12,
  },
  bankDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  bankDetailLabel: {
    fontSize: 14,
    color: Colors.LightGray,
  },
  bankDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.White,
  },
  transferDetails: {
    marginBottom: 32,
  },
  transferCard: {
    backgroundColor: Colors.BlurGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  transferRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  transferLabel: {
    fontSize: 14,
    color: Colors.LightGray,
  },
  transferValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.White,
    marginRight: 8,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.Background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.BlurGray,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.LightBlue,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.LightGray,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

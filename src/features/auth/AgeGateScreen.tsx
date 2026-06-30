import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types";
import { useThemedStyles, useTheme } from "@theme";
import { GradientButton } from "@components/index";
import {
  MIN_ACCOUNT_AGE,
  getAgeFromBirthYear,
  isOldEnoughForAccount,
  getPrivacyPolicyUrl,
  openLegalUrlSafe,
} from "@config/legal";
import { useSettingsStore } from "@store/settingsStore";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AgeGate">;
};

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 100;
const MAX_BIRTH_YEAR = CURRENT_YEAR - MIN_ACCOUNT_AGE;

export default function AgeGateScreen({ navigation: _navigation }: Props) {
  const styles = useThemedStyles(createStyles);
  const setAgeGateVerified = useSettingsStore((s) => s.setAgeGateVerified);
  const [birthYear, setBirthYear] = useState(CURRENT_YEAR - 18);
  const [blocked, setBlocked] = useState(false);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = MAX_BIRTH_YEAR; y >= MIN_BIRTH_YEAR; y -= 1) list.push(y);
    return list;
  }, []);

  const age = getAgeFromBirthYear(birthYear);

  const handleContinue = () => {
    if (!isOldEnoughForAccount(birthYear)) {
      setBlocked(true);
      return;
    }
    setAgeGateVerified(age);
  };

  const openPrivacy = async () => {
    try {
      await openLegalUrlSafe(getPrivacyPolicyUrl(), "Privacy Policy");
    } catch {
      Alert.alert("Unable to open Privacy Policy");
    }
  };

  if (blocked) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.blockedWrap}>
          <Text style={styles.blockedTitle}>Sorry!</Text>
          <Text style={styles.blockedBody}>
            LifeQuest is for players age {MIN_ACCOUNT_AGE} and older. We cannot create an account
            for you at this time.
          </Text>
          <Text style={styles.blockedBody}>
            Read our{" "}
            <Text style={styles.link} onPress={() => void openPrivacy()}>
              Privacy Policy
            </Text>{" "}
            to learn how we protect younger users.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.subtitle}>
          We need to verify your age before you can create an account (minimum age {MIN_ACCOUNT_AGE}).
        </Text>

        <Text style={styles.selectedAge}>Age {age}</Text>

        <ScrollView style={styles.yearList} showsVerticalScrollIndicator={false}>
          {years.map((y) => {
            const selected = y === birthYear;
            return (
              <Pressable
                key={y}
                onPress={() => setBirthYear(y)}
                style={[styles.yearRow, selected && styles.yearRowSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.yearText, selected && styles.yearTextSelected]}>{y}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <GradientButton label="Continue" onPress={handleContinue} style={{ width: "100%" }} />

        <Text style={styles.legalNote}>
          By continuing you confirm you are at least {MIN_ACCOUNT_AGE} years old. See our{" "}
          <Text style={styles.link} onPress={() => void openPrivacy()}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
    title: {
      fontFamily: fonts.displayBold,
      fontSize: 26,
      color: colors.t1,
      textAlign: "center",
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.t3,
      textAlign: "center",
      lineHeight: 20,
    },
    selectedAge: {
      fontFamily: fonts.monoSemiBold,
      fontSize: 20,
      color: colors.gold,
      textAlign: "center",
    },
    yearList: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      backgroundColor: colors.bgCard,
    },
    yearRow: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    yearRowSelected: { backgroundColor: `${colors.gold}18` },
    yearText: {
      fontFamily: fonts.body,
      fontSize: 16,
      color: colors.t2,
      textAlign: "center",
    },
    yearTextSelected: {
      fontFamily: fonts.bodySemiBold,
      color: colors.t1,
    },
    legalNote: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.t4,
      textAlign: "center",
      lineHeight: 16,
    },
    link: {
      color: colors.sapphire,
      textDecorationLine: "underline",
    },
    blockedWrap: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
    },
    blockedTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 28,
      color: colors.t1,
      textAlign: "center",
    },
    blockedBody: {
      fontFamily: fonts.body,
      fontSize: 15,
      color: colors.t2,
      textAlign: "center",
      lineHeight: 22,
    },
  });

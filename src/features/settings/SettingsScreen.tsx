import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme, useThemedStyles } from "@theme";
import { useSettingsStore } from "@store/settingsStore";
import { useAuth } from "@features/auth/hooks/useAuth";
import { signOut } from "@features/auth/services/auth";
import {
  getPrivacyPolicyUrl,
  getTermsUrl,
  openLegalUrlSafe,
} from "@config/legal";
import { getNotificationsEnabled } from "@services/persistence";
import { setNotificationsPreference } from "@services/notifications";
import { Card, Divider, SectionLabel, FeedbackPressable } from "@components/index";
import type { RootStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Setting Row (toggle) ─────────────────────────────────────────────────────

function SettingRow({
  icon,
  label,
  desc,
  value,
  onChange,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  iconBg?: string;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View style={rowStyles.row}>
      <View style={[rowStyles.iconWrap, iconBg ? { backgroundColor: iconBg } : undefined]}>
        {icon}
      </View>
      <View style={rowStyles.textWrap}>
        <Text style={[rowStyles.label, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{label}</Text>
        <Text style={[rowStyles.desc, { color: colors.t3, fontFamily: fonts.body }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.emerald, false: colors.bg2 }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  textWrap: { flex: 1, gap: 2 },
  label: { fontSize: 14 },
  desc: { fontSize: 11, lineHeight: 15 },
});

// ─── Nav Row ──────────────────────────────────────────────────────────────────

function NavRow({ icon, label, onPress, iconBg, destructive }: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  iconBg?: string;
  destructive?: boolean;
}) {
  const { colors, fonts } = useTheme();
  return (
    <FeedbackPressable onPress={onPress} style={rowStyles.row}>
      <View style={[rowStyles.iconWrap, iconBg ? { backgroundColor: iconBg } : undefined]}>
        {icon}
      </View>
      <Text style={[rowStyles.textWrap, rowStyles.label,
        { color: destructive ? colors.crimson : colors.t1, fontFamily: fonts.bodySemiBold }]}>
        {label}
      </Text>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round" d="M9 18l6-6-6-6" />
      </Svg>
    </FeedbackPressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);

  const [notif, setNotif] = useState(() => getNotificationsEnabled());

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            // store will handle nav via auth state
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t1} strokeWidth={2.2} strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.displayBold }]}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>

        {/* ── Account ── */}
        <View style={styles.section}>
          <SectionLabel label="Account" />
          <Card style={{ gap: 0 }}>
            <View style={[rowStyles.row, { paddingVertical: 14 }]}>
              <View style={[rowStyles.iconWrap, { backgroundColor: `${colors.sapphire}12` }]}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle stroke={colors.sapphire} strokeWidth={2} cx="12" cy="7" r="4" />
                  <Path stroke={colors.sapphire} strokeWidth={2} strokeLinecap="round"
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                </Svg>
              </View>
              <View style={rowStyles.textWrap}>
                <Text style={[rowStyles.label, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                  {user?.displayName ?? (user?.isGuest ? "Guest" : "Signed In")}
                </Text>
                <Text style={[rowStyles.desc, { color: colors.t3, fontFamily: fonts.body }]}>
                  {user?.isGuest ? "Playing as guest — progress is local only" : (user?.email ?? "Signed in with Google")}
                </Text>
              </View>
            </View>
            {user && !user.isGuest && (
              <>
                <Divider />
                <NavRow
                  icon={
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path stroke={colors.crimson} strokeWidth={2} strokeLinecap="round"
                        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </Svg>
                  }
                  label="Sign Out"
                  onPress={handleSignOut}
                  iconBg={`${colors.crimson}12`}
                  destructive
                />
              </>
            )}
          </Card>
        </View>

        {/* ── Preferences ── */}
        <View style={styles.section}>
          <SectionLabel label="Preferences" />
          <Card style={{ gap: 0 }}>
            <SettingRow
              icon={
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path stroke={colors.sapphire} strokeWidth={2} strokeLinecap="round"
                    d="M9 18V5l12-2v13" />
                  <Circle stroke={colors.sapphire} strokeWidth={2} cx="6" cy="18" r="3" />
                  <Circle stroke={colors.sapphire} strokeWidth={2} cx="18" cy="16" r="3" />
                </Svg>
              }
              label="Sound Effects"
              desc="In-game sounds and music"
              value={soundEnabled}
              onChange={setSoundEnabled}
              iconBg={`${colors.sapphire}12`}
            />
            <Divider />
            <SettingRow
              icon={
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path stroke={colors.emerald} strokeWidth={2} strokeLinecap="round"
                    d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </Svg>
              }
              label="Notifications"
              desc="Daily life reminders"
              value={notif}
              onChange={(v) => { setNotif(v); void setNotificationsPreference(v); }}
              iconBg={`${colors.emerald}12`}
            />
            <Divider />
            <SettingRow
              icon={
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path stroke={colors.orchid} strokeWidth={2} strokeLinecap="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </Svg>
              }
              label="Haptic Feedback"
              desc="Vibration on button press"
              value={hapticsEnabled}
              onChange={setHapticsEnabled}
              iconBg={`${colors.orchid}12`}
            />
            <Divider />
            <SettingRow
              icon={
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path stroke={colors.gold} strokeWidth={2} strokeLinecap="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </Svg>
              }
              label="Reduced Motion"
              desc="Minimize animations and transitions"
              value={reducedMotion}
              onChange={setReducedMotion}
              iconBg={`${colors.gold}12`}
            />
          </Card>
        </View>

        {/* ── Appearance ── */}
        <View style={styles.section}>
          <SectionLabel label="Appearance" />
          <Card>
            <Text style={[styles.schemeLabel, { color: colors.t2, fontFamily: fonts.body }]}>
              Choose light, dark, or match your device setting.
            </Text>
            <View style={styles.schemeRow}>
              {(["light", "dark", "system"] as const).map((scheme) => (
                <Pressable
                  key={scheme}
                  onPress={() => setColorScheme(scheme)}
                  style={[
                    styles.schemeChip,
                    { borderColor: colors.border, backgroundColor: colors.bg2 },
                    colorScheme === scheme && {
                      borderColor: colors.sapphire,
                      backgroundColor: `${colors.sapphire}12`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.schemeChipText,
                      { color: colorScheme === scheme ? colors.sapphire : colors.t3,
                        fontFamily: colorScheme === scheme ? fonts.bodyBold : fonts.body },
                    ]}
                  >
                    {scheme === "light" ? "Light" : scheme === "dark" ? "Dark" : "System"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        {/* ── Legal ── */}
        <View style={styles.section}>
          <SectionLabel label="Legal" />
          <Card style={{ gap: 0 }}>
            <FeedbackPressable
              onPress={() => void openLegalUrlSafe(getPrivacyPolicyUrl(), "Privacy Policy")}
              style={styles.legalRow}
            >
              <Text style={[styles.legalText, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                Privacy Policy
              </Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round" d="M9 18l6-6-6-6" />
              </Svg>
            </FeedbackPressable>
            <Divider />
            <FeedbackPressable
              onPress={() => void openLegalUrlSafe(getTermsUrl(), "Terms of Service")}
              style={styles.legalRow}
            >
              <Text style={[styles.legalText, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                Terms of Service
              </Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round" d="M9 18l6-6-6-6" />
              </Svg>
            </FeedbackPressable>
          </Card>
        </View>

        <Text style={[styles.footer, { color: colors.t4, fontFamily: fonts.body }]}>
          LifeQuesT · Built with purpose
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
    },
    backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 18 },
    section: { gap: spacing.xs },
    schemeLabel: { fontSize: 12, marginBottom: spacing.sm },
    schemeRow: { flexDirection: "row", gap: spacing.sm },
    schemeChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: radii.sm,
      borderWidth: 1.5,
      alignItems: "center",
    },
    schemeChipText: { fontSize: 13 },
    legalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    legalText: { fontSize: 14 },
    footer: { textAlign: "center", fontSize: 12, marginTop: spacing.sm },
  });

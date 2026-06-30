import { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types";
import { useThemedStyles, useTheme } from "@theme";
import { GradientButton } from "@components/index";
import LifeGlyph from "@components/LifeGlyph";
import { useSettingsStore } from "@store/settingsStore";

const { width: SCREEN_W } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Onboarding">;
};

const SLIDES = [
  {
    id: "1",
    title: "Live a Thousand Lives",
    body: "Age up year by year. Every tap writes a new chapter — careers, love, crime, fortune, and fate.",
    emoji: "📖",
  },
  {
    id: "2",
    title: "Focus Your Energy",
    body: "Allocate your focus each year toward health, wealth, relationships, and ambition. Your choices shape what happens next.",
    emoji: "🧭",
  },
  {
    id: "3",
    title: "Begin Your Chronicle",
    body: "Build legacy across generations. Unlock achievements, season rewards, and stories only you could live.",
    emoji: "✨",
  },
] as const;

export default function OnboardingScreen({ navigation: _navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== index) setIndex(i);
  };

  const finish = () => {
    setOnboardingComplete(true);
  };

  const goNext = () => {
    if (index >= SLIDES.length - 1) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <LifeGlyph size={32} />
        <Text style={styles.brand}>
          Life<Text style={styles.brandAccent}>Quest</Text>
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.id}
              style={[styles.dot, i === index && { backgroundColor: colors.gold, width: 20 }]}
            />
          ))}
        </View>

        {index < SLIDES.length - 1 ? (
          <GradientButton label="Next" onPress={goNext} style={{ width: "100%" }} />
        ) : (
          <GradientButton label="Begin Your Chronicle" onPress={finish} style={{ width: "100%" }} />
        )}

        {index < SLIDES.length - 1 && (
          <Pressable onPress={finish} accessibilityRole="button" accessibilityLabel="Skip onboarding">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingTop: spacing.md,
    },
    brand: {
      fontFamily: fonts.displayBold,
      fontSize: 24,
      color: colors.t1,
    },
    brandAccent: { color: colors.gold },
    slide: {
      width: SCREEN_W,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl,
      alignItems: "center",
    },
    emoji: { fontSize: 56, marginBottom: spacing.lg },
    title: {
      fontFamily: fonts.displayBold,
      fontSize: 28,
      color: colors.t1,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    body: {
      fontFamily: fonts.body,
      fontSize: 16,
      color: colors.t2,
      textAlign: "center",
      lineHeight: 24,
      maxWidth: 320,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
      gap: spacing.md,
      alignItems: "center",
    },
    dots: { flexDirection: "row", gap: 6, marginBottom: spacing.sm },
    dot: {
      width: 8,
      height: 8,
      borderRadius: radii.full,
      backgroundColor: colors.border,
    },
    skip: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.t4,
      paddingVertical: spacing.sm,
    },
  });

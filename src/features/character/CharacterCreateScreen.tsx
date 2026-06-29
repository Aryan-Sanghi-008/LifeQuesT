import { useState, useRef, Fragment, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  TextInput,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RouteProp, StackActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, FamilyBackground, Gender } from "../../types";
import { useTheme } from "@theme";
import { DiceBearAvatar } from "../../components/Avatars";
import { GradientButton, FadeInView } from "../../components/index";
import { useGameStore } from "../../store/gameStore";
import {
  COUNTRIES,
  ZODIACS,
  TRAITS,
  FAMILY_BACKGROUNDS,
} from "../../data/gameData";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { CHALLENGES } from "../../engine/challengeEngine";
import { PRESTIGE_TRAITS } from "../../engine/prestigeEngine";

const { width } = Dimensions.get("window");
const STEP_COUNT = 3;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CharacterCreate">;
  route: RouteProp<RootStackParamList, "CharacterCreate">;
};

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepProgressBar({ current }: { current: number }) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getStyles(radii, spacing, shadows);

  const pct = ((current + 1) / STEP_COUNT) * 100;
  const anim = useRef(new Animated.Value((current / STEP_COUNT) * 100)).current;

  Animated.spring(anim, {
    toValue: pct,
    useNativeDriver: false,
    damping: 20,
    stiffness: 180,
  }).start();

  const widthPct = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.spbWrap}>
      <View style={[styles.spbTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.spbFill,
            { width: widthPct, backgroundColor: colors.sapphire },
          ]}
        />
      </View>
      <View style={styles.spbDots}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <Fragment key={i}>
              <View
                style={[
                  styles.spbDot,
                  {
                    backgroundColor: colors.bg2,
                    borderColor: colors.border,
                  },
                  done && {
                    backgroundColor: colors.sapphire,
                    borderColor: colors.sapphire,
                  },
                  active && {
                    borderColor: colors.sapphire,
                    backgroundColor: `${colors.sapphire}12`,
                  },
                ]}
              >
                {done ? (
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </Svg>
                ) : (
                  <Text
                    style={[
                      styles.spbDotNum,
                      { color: colors.t4, fontFamily: fonts.body },
                      active && { color: colors.sapphire },
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < STEP_COUNT - 1 && (
                <View
                  style={[
                    styles.spbConnector,
                    { backgroundColor: colors.border },
                    i < current && { backgroundColor: colors.sapphire },
                  ]}
                />
              )}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

// ─── Gender Picker ────────────────────────────────────────────────────────────

function getGenderOptions(colors: any) {
  return [
    {
      id: "male" as Gender,
      label: "Male",
      color: colors.sapphire,
      icon: (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Circle stroke={colors.sapphire} strokeWidth={2} cx="10" cy="14" r="6" />
          <Path
            stroke={colors.sapphire}
            strokeWidth={2}
            strokeLinecap="round"
            d="M14.5 9.5L19 5M19 5h-4M19 5v4"
          />
        </Svg>
      ),
    },
    {
      id: "female" as Gender,
      label: "Female",
      color: "#EC4899",
      icon: (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Circle stroke="#EC4899" strokeWidth={2} cx="12" cy="9" r="6" />
          <Path
            stroke="#EC4899"
            strokeWidth={2}
            strokeLinecap="round"
            d="M12 15v6M9 18h6"
          />
        </Svg>
      ),
    },
    {
      id: "other" as Gender,
      label: "Other",
      color: colors.orchid,
      icon: (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Circle stroke={colors.orchid} strokeWidth={2} cx="12" cy="12" r="7" />
          <Path
            stroke={colors.orchid}
            strokeWidth={2}
            strokeLinecap="round"
            d="M12 5V2M12 22v-3"
          />
        </Svg>
      ),
    },
  ];
}

// ─── Step 1: Identity ─────────────────────────────────────────────────────────

function Step1({
  name,
  setName,
  gender,
  setGender,
  avatarSeed,
  onNameFocus,
}: {
  name: string;
  setName: (v: string) => void;
  gender: Gender;
  setGender: (v: Gender) => void;
  avatarSeed: string;
  onNameFocus: () => void;
}) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getStyles(radii, spacing, shadows);
  const GENDER_OPTIONS = getGenderOptions(colors);

  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.t1, fontFamily: fonts.displayBold }]}>
        Who are you?
      </Text>
      <Text style={[styles.stepSub, { color: colors.t3, fontFamily: fonts.body }]}>
        Choose your gender, give yourself a name, and see your baby self.
      </Text>

      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold }]}>
        GENDER
      </Text>
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map((g) => {
          const active = g.id === gender;
          return (
            <Pressable
              key={g.id}
              onPress={() => setGender(g.id)}
              style={[
                styles.genderCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                active && {
                  borderColor: g.color,
                  backgroundColor: `${g.color}10`,
                },
              ]}
            >
              {g.icon}
              <Text
                style={[
                  styles.genderLabel,
                  {
                    color: active ? g.color : colors.t3,
                    fontFamily: fonts.bodySemiBold,
                  },
                ]}
              >
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.babyPreviewWrap}>
        <View style={[styles.babyFrame, { backgroundColor: colors.bgCard, borderColor: `${colors.gold}50` }]}>
          <DiceBearAvatar
            seed={avatarSeed}
            lifeStage="infant"
            gender={gender}
            size={94}
            clipCircular
          />
        </View>
        <Text style={[styles.babyLabel, { color: colors.t4, fontFamily: fonts.body }]}>
          Your baby avatar
        </Text>
      </View>

      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold }]}>
        YOUR NAME
      </Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginLeft: spacing.lg }}
        >
          <Path
            stroke={colors.t4}
            strokeWidth={2}
            strokeLinecap="round"
            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
          />
          <Circle stroke={colors.t4} strokeWidth={2} cx="12" cy="7" r="4" />
        </Svg>
        <TextInput
          value={name}
          onChangeText={setName}
          onFocus={onNameFocus}
          placeholder="Enter your name..."
          placeholderTextColor={colors.t4}
          maxLength={24}
          style={[styles.textInput, { color: colors.t1, fontFamily: fonts.bodyMedium }]}
          returnKeyType="done"
        />
      </View>
    </FadeInView>
  );
}

// ─── Step 2: Origins ──────────────────────────────────────────────────────────

function getBgColors(colors: any) {
  return {
    poor: colors.health,
    middle: colors.sapphire,
    wealthy: colors.catFinancial,
    royalty: colors.gold,
  };
}

function getBgIcons(colors: any) {
  return {
    poor: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          stroke={colors.health}
          strokeWidth={2}
          strokeLinecap="round"
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </Svg>
    ),
    middle: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Rect
          stroke={colors.sapphire}
          strokeWidth={2}
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
        />
        <Path
          stroke={colors.sapphire}
          strokeWidth={2}
          strokeLinecap="round"
          d="M9 12l2 2 4-4"
        />
      </Svg>
    ),
    wealthy: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          stroke={colors.catFinancial}
          strokeWidth={2}
          strokeLinecap="round"
          d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
        />
      </Svg>
    ),
    royalty: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill={colors.gold}>
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </Svg>
    ),
  };
}

function Step2({
  country,
  setCountry,
  background,
  setBackground,
  activeChallengeId,
  setActiveChallengeId,
}: {
  country: string;
  setCountry: (v: string) => void;
  background: FamilyBackground;
  setBackground: (v: FamilyBackground) => void;
  activeChallengeId?: string;
  setActiveChallengeId: (id?: string) => void;
}) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getStyles(radii, spacing, shadows);
  const BG_COLORS = getBgColors(colors);
  const BG_ICONS = getBgIcons(colors);

  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.t1, fontFamily: fonts.displayBold }]}>
        Where are you born?
      </Text>
      <Text style={[styles.stepSub, { color: colors.t3, fontFamily: fonts.body }]}>
        Select your home country and starting family circumstances.
      </Text>

      {/* Country List */}
      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold }]}>
        COUNTRY
      </Text>
      <View style={styles.zodiacGrid}>
        {COUNTRIES.map((c) => {
          const active = c.code === country;
          return (
            <Pressable
              key={c.code}
              onPress={() => setCountry(c.code)}
              style={[
                styles.countryChip,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                active && {
                  borderColor: colors.sapphire,
                  backgroundColor: `${colors.sapphire}10`,
                },
              ]}
            >
              <Text style={styles.countryFlag}>{c.flag}</Text>
              <Text
                style={[
                  styles.countryName,
                  { color: colors.t3, fontFamily: fonts.body },
                  active && { color: colors.sapphire, fontFamily: fonts.bodyBold },
                ]}
              >
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Challenges list */}
      {Object.values(CHALLENGES).length > 0 && (
        <Fragment>
          <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold, marginTop: spacing.md }]}>
            ACTIVE CHALLENGE
          </Text>
          <View style={styles.zodiacGrid}>
            <Pressable
              onPress={() => setActiveChallengeId(undefined)}
              style={[
                styles.countryChip,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                activeChallengeId === undefined && {
                  borderColor: colors.t3,
                  backgroundColor: `${colors.t3}10`,
                },
              ]}
            >
              <Text
                style={[
                  styles.countryName,
                  { color: colors.t3, fontFamily: fonts.body },
                  activeChallengeId === undefined && {
                    color: colors.t1,
                    fontFamily: fonts.bodyBold,
                  },
                ]}
              >
                Classic Mode
              </Text>
            </Pressable>

            {Object.values(CHALLENGES).map((ch) => {
              const active = ch.id === activeChallengeId;
              return (
                <Pressable
                  key={ch.id}
                  onPress={() => setActiveChallengeId(ch.id)}
                  style={[
                    styles.countryChip,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                    },
                    active && {
                      borderColor: colors.teal,
                      backgroundColor: `${colors.teal}10`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countryName,
                      { color: colors.t3, fontFamily: fonts.body },
                      active && { color: colors.teal, fontFamily: fonts.bodyBold },
                    ]}
                  >
                    {ch.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Fragment>
      )}

      {/* Family Background */}
      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold, marginTop: spacing.md }]}>
        FAMILY BACKGROUND
      </Text>
      <View style={styles.bgGrid}>
        {FAMILY_BACKGROUNDS.map((item) => {
          const active = item.id === background;
          const tintColor = BG_COLORS[item.id] || colors.sapphire;
          return (
            <Pressable
              key={item.id}
              onPress={() => setBackground(item.id)}
              style={[
                styles.bgCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                active && { borderColor: tintColor },
              ]}
            >
              <View
                style={[
                  styles.bgIconWrap,
                  { backgroundColor: `${tintColor}12` },
                ]}
              >
                {BG_ICONS[item.id]}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bgLabel, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
                  {item.label}
                </Text>
                <Text style={[styles.bgDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                  {item.description}
                </Text>
              </View>
              <View
                style={[
                  styles.wealthPill,
                  { backgroundColor: `${tintColor}12` },
                ]}
              >
                <Text
                  style={[
                    styles.wealthText,
                    { color: tintColor, fontFamily: fonts.monoSemiBold },
                  ]}
                >
                  {item.wealthStart}
                </Text>
              </View>

              {active && (
                <View
                  style={[
                    styles.activeTick,
                    { backgroundColor: tintColor },
                  ]}
                >
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke="#FFFFFF"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </Svg>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </FadeInView>
  );
}

// ─── Step 3: Traits ───────────────────────────────────────────────────────────

function Step3({
  zodiac,
  setZodiac,
  traits,
  toggleTrait,
  isPremium,
}: {
  zodiac: string;
  setZodiac: (v: string) => void;
  traits: string[];
  toggleTrait: (id: string) => void;
  isPremium: boolean;
}) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getStyles(radii, spacing, shadows);

  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.t1, fontFamily: fonts.displayBold }]}>
        Your cosmic traits
      </Text>
      <Text style={[styles.stepSub, { color: colors.t3, fontFamily: fonts.body }]}>
        Configure your zodiac alignment and choose up to two starting traits.
      </Text>

      {/* Zodiac picker */}
      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold }]}>
        ZODIAC SIGN
      </Text>
      <View style={styles.zodiacGrid}>
        {ZODIACS.map((z) => {
          const active = z.id === zodiac;
          return (
            <Pressable
              key={z.id}
              onPress={() => setZodiac(z.id)}
              style={[
                styles.zodiacChip,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                active && {
                  borderColor: colors.orchid,
                  backgroundColor: `${colors.orchid}10`,
                },
              ]}
            >
              <Text
                style={[
                  styles.zodiacLabel,
                  {
                    color: active ? colors.orchid : colors.t2,
                    fontFamily: active ? fonts.bodyBold : fonts.body,
                  },
                ]}
              >
                {z.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Trait Picker */}
      <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold, marginTop: spacing.md }]}>
        PERSONALITY TRAITS (MAX 2)
      </Text>
      <Text style={[styles.traitHint, { color: colors.t4, fontFamily: fonts.body }]}>
        Tap to select. Selected traits will influence your start metrics.
      </Text>

      <View style={styles.traitGrid}>
        {TRAITS.map((t) => {
          const active = traits.includes(t.id);
          return (
            <Pressable
              key={t.id}
              onPress={() => toggleTrait(t.id)}
              style={[
                styles.traitCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                active && {
                  borderColor: `${colors.orchid}50`,
                  backgroundColor: `${colors.orchid}08`,
                },
              ]}
            >
              {active && (
                <View
                  style={[
                    styles.traitCheck,
                    { backgroundColor: colors.orchid },
                  ]}
                >
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke="#FFFFFF"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </Svg>
                </View>
              )}
              <Text
                style={[
                  styles.traitLabel,
                  { color: colors.t1, fontFamily: fonts.bodyBold },
                  active && { color: colors.orchid },
                ]}
              >
                {t.label}
              </Text>
              <Text style={[styles.traitDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                {t.description}
              </Text>
            </Pressable>
          );
        })}

        {PRESTIGE_TRAITS.map((pt) => {
          const active = traits.includes(pt.id);
          const locked = !isPremium;
          return (
            <Pressable
              key={pt.id}
              disabled={locked}
              onPress={() => toggleTrait(pt.id)}
              style={[
                styles.traitCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                { borderColor: colors.gold },
                active && {
                  borderColor: `${colors.gold}80`,
                  backgroundColor: `${colors.gold}08`,
                },
                locked && styles.traitCardLocked,
              ]}
            >
              {active && (
                <View
                  style={[
                    styles.traitCheck,
                    { backgroundColor: colors.gold },
                  ]}
                >
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      stroke="#FFFFFF"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                    />
                  </Svg>
                </View>
              )}
              <Text
                style={[
                  styles.traitLabel,
                  { color: colors.gold, fontFamily: fonts.body },
                  active && { fontFamily: fonts.bodyBold },
                ]}
              >
                {pt.label}
              </Text>
              <Text style={[styles.traitDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                {pt.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FadeInView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function CharacterCreateScreen({ navigation, route }: Props) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getStyles(radii, spacing, shadows);

  const createCharacter = useGameStore((s) => s.createCharacter);
  const character = useGameStore((s) => s.character);
  const isPremium = useGameStore((s) => s.character?.isPremium ?? false);
  const carriedFromStore = useGameStore((s) => s.carriedStatsForCreate);
  const carriedStats = carriedFromStore ?? route.params?.carriedStats;
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [country, setCountry] = useState("IN");
  const [background, setBackground] = useState<FamilyBackground>("middle");
  const [zodiac, setZodiac] = useState("leo");
  const [traits, setTraits] = useState<string[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | undefined>(
    undefined,
  );
  const [isCreating, setIsCreating] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const avatarSeedRef = useRef<string | null>(null);

  const ensureAvatarSeed = () => {
    if (!avatarSeedRef.current && name.trim()) {
      avatarSeedRef.current = `${name.trim()}-${Date.now()}`;
    }
    return avatarSeedRef.current ?? "NewBorn";
  };

  useEffect(() => {
    if (character && isCreating) {
      navigation.dispatch(StackActions.replace("MainTabs"));
    }
  }, [character, isCreating, navigation]);

  const toggleTrait = (id: string) => {
    setTraits((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length < 2
        ? [...prev, id]
        : prev,
    );
  };

  const nextStep = () => {
    if (step === 0 && !name.trim()) return;
    if (step === 0) ensureAvatarSeed();
    if (step < STEP_COUNT - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -16,
          duration: 130,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      setStep((s) => s + 1);
    } else {
      setIsCreating(true);
      const selectedZodiac = ZODIACS.find((z) => z.id === zodiac);
      createCharacter({
        name: name.trim(),
        gender,
        avatarSeed: ensureAvatarSeed(),
        countryCode: country,
        zodiac,
        zodiacBonusStat: selectedZodiac?.bonusStat,
        familyBackground: background,
        traits,
        carriedStats: carriedStats ?? undefined,
        activeChallengeId,
      });
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("SaveSlots");
    }
  };

  const canProceed = step === 0 ? name.trim().length > 0 : true;

  const STEP_LABELS = ["Identity", "Origins", "Traits"];
  const STEP_COLORS = [colors.sapphire, colors.catCareer, colors.orchid];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 100 : 20}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
            <Pressable onPress={prevStep} style={[styles.backBtn, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  stroke={colors.t2}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 12H5M12 19l-7-7 7-7"
                />
              </Svg>
            </Pressable>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={[styles.stepChapterLabel, { color: colors.t4, fontFamily: fonts.body }]}>
                Step {step + 1} of {STEP_COUNT}
              </Text>
              <Text
                style={[
                  styles.stepChapterName,
                  { color: STEP_COLORS[step], fontFamily: fonts.bodyBold },
                ]}
              >
                {STEP_LABELS[step]}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress */}
          <StepProgressBar current={step} />

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              {step === 0 && (
                <Step1
                  name={name}
                  setName={setName}
                  gender={gender}
                  setGender={setGender}
                  avatarSeed={ensureAvatarSeed()}
                  onNameFocus={() =>
                    scrollRef.current?.scrollToEnd({ animated: true })
                  }
                />
              )}
              {step === 1 && (
                <Step2
                  country={country}
                  setCountry={setCountry}
                  background={background}
                  setBackground={setBackground}
                  activeChallengeId={activeChallengeId}
                  setActiveChallengeId={setActiveChallengeId}
                />
              )}
              {step === 2 && (
                <Step3
                  zodiac={zodiac}
                  setZodiac={setZodiac}
                  traits={traits}
                  toggleTrait={toggleTrait}
                  isPremium={isPremium}
                />
              )}
            </Animated.View>
          </ScrollView>

          <View style={[styles.ctaWrap, { backgroundColor: colors.bgCard, borderTopColor: colors.border }]}>
            <GradientButton
              label={step < STEP_COUNT - 1 ? "Continue" : "Begin Your Life"}
              onPress={nextStep}
              colors={[
                STEP_COLORS[step],
                step < STEP_COUNT - 1 ? `${STEP_COLORS[step]}CC` : colors.gold3 || "#D97706",
              ]}
              textColor="#FFFFFF"
              disabled={!canProceed}
              style={{ width: "100%" }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (
  radii: any,
  spacing: any,
  shadows: any,
) =>
  StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      marginBottom: spacing.xl,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: radii.sm,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    stepChapterLabel: { fontSize: 11 },
    stepChapterName: { fontSize: 15, marginTop: 2 },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
    },
    stepContainer: { gap: spacing.md },
    stepTitle: { fontSize: 28, marginTop: spacing.sm },
    stepSub: { fontSize: 14, lineHeight: 21, marginBottom: spacing.sm },
    inputLabel: {
      fontSize: 10,
      letterSpacing: 2,
      marginBottom: spacing.sm,
    },

    // Gender
    genderRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
    genderCard: {
      flex: 1,
      alignItems: "center",
      gap: spacing.xs,
      borderRadius: radii.md,
      padding: spacing.md,
      borderWidth: 2,
      ...shadows.subtle,
    },
    genderLabel: { fontSize: 13 },

    // Baby preview
    babyPreviewWrap: { alignItems: "center", marginVertical: spacing.lg },
    babyFrame: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      ...shadows.card,
    },
    babyLabel: { fontSize: 12, marginTop: spacing.sm },

    // Input
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: radii.md,
      borderWidth: 1.5,
      overflow: "hidden",
    },
    textInput: { fontSize: 16, paddingVertical: 15, paddingHorizontal: spacing.md, flex: 1 },

    // Country
    countryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.full,
      borderWidth: 1.5,
    },
    countryFlag: { fontSize: 16 },
    countryName: { fontSize: 12 },

    // Background
    bgGrid: { gap: spacing.sm },
    bgCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radii.md,
      borderWidth: 2,
      position: "relative",
      overflow: "hidden",
      ...shadows.subtle,
    },
    bgIconWrap: {
      width: 44,
      height: 44,
      borderRadius: radii.sm,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    bgLabel: { fontSize: 14 },
    bgDesc: { fontSize: 12, marginTop: 2 },
    wealthPill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radii.full,
    },
    wealthText: { fontSize: 11 },
    activeTick: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    // Zodiac
    zodiacGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    zodiacChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.full,
      borderWidth: 1.5,
    },
    zodiacLabel: { fontSize: 13 },

    // Traits
    traitHint: {
      fontSize: 12,
      marginBottom: spacing.sm,
      marginTop: -spacing.sm,
    },
    traitGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    traitCard: {
      width: (width - spacing.xl * 2 - spacing.sm) / 2 - 0.5,
      padding: spacing.md,
      borderRadius: radii.md,
      borderWidth: 2,
      gap: 4,
      position: "relative",
      ...shadows.subtle,
    },
    traitCardLocked: { opacity: 0.4 },
    traitCheck: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    traitLabel: { fontSize: 14 },
    traitDesc: { fontSize: 11 },

    // CTA
    ctaWrap: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
      paddingTop: spacing.md,
      borderTopWidth: 1,
    },

    // StepProgressBar Styles
    spbWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
    spbTrack: {
      height: 4,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: spacing.md,
    },
    spbFill: { height: "100%", borderRadius: 2 },
    spbDots: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    spbDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    spbDotNum: { fontSize: 11 },
    spbConnector: {
      flex: 1,
      height: 2,
      marginHorizontal: 4,
      maxWidth: 40,
    },
  });

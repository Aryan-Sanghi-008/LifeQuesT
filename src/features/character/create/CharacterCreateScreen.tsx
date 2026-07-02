import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RouteProp, StackActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import {
  RootStackParamList,
  FamilyBackground,
  Gender,
  BigFivePersonality,
  ScenarioId,
} from "@/types";
import { useTheme } from "@theme";
import { GradientButton } from "@components/index";
import { ZODIACS } from "@data/gameData";
import { useCharacter } from "../hooks/useCharacter";
import { useGameStore } from "@store/gameStore";
import {
  STEP_COUNT,
  STEP_LABELS,
  getStepColors,
  StepProgressBar,
} from "./WizardProgress";
import { CharacterPreview } from "./CharacterPreview";
import { StepIdentity } from "./StepIdentity";
import { StepBirthplace } from "./StepBirthplace";
import { StepFamily } from "./StepFamily";
import { StepPersonality } from "./StepPersonality";
import { StepScenario } from "./StepScenario";
import { getCreateStyles } from "./styles";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CharacterCreate">;
  route: RouteProp<RootStackParamList, "CharacterCreate">;
};

export function CharacterCreateScreen({ navigation, route }: Props) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);
  const stepColors = getStepColors(colors);

  const { createCharacter, character, carriedStatsForCreate: carriedFromStore } = useCharacter();
  const isPremium = character?.isPremium ?? false;
  const unlockedPrestigeTraitIds = useGameStore((s) => s.globalPrestige.unlockedTraitIds ?? []);
  const hasDynastyTraitExpansion = useGameStore((s) =>
    (s.globalPrestige.unlockedDynastyPerkIds ?? []).includes('dynasty_trait_expansion'),
  );
  const familyCrestId = useGameStore((s) => s.globalPrestige.familyCrestId);
  const carriedStats = carriedFromStore ?? route.params?.carriedStats;
  const scenarioId = route.params?.scenarioId;
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [country, setCountry] = useState("IN");
  const [background, setBackground] = useState<FamilyBackground>("middle");
  const [zodiac, setZodiac] = useState("leo");
  const [traits, setTraits] = useState<string[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | undefined>(undefined);
  const [personality, setPersonality] = useState<BigFivePersonality>({
    openness: 55,
    conscientiousness: 55,
    extraversion: 55,
    agreeableness: 55,
    neuroticism: 40,
  });
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>(scenarioId ?? "classic");
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
        scenarioId: selectedScenario,
        personality,
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

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 100 : 20}
        >
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
                  { color: stepColors[step], fontFamily: fonts.bodyBold },
                ]}
              >
                {STEP_LABELS[step]}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <StepProgressBar current={step} />

          <CharacterPreview
            name={name}
            gender={gender}
            avatarSeed={ensureAvatarSeed()}
            countryCode={country}
            familyBackground={background}
            zodiac={zodiac}
            traits={traits}
            personality={personality}
            selectedScenario={selectedScenario}
            familyCrestId={familyCrestId}
          />

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              {step === 0 && (
                <StepIdentity
                  name={name}
                  setName={setName}
                  gender={gender}
                  setGender={setGender}
                  onNameFocus={() =>
                    scrollRef.current?.scrollToEnd({ animated: true })
                  }
                />
              )}
              {step === 1 && (
                <StepBirthplace
                  country={country}
                  setCountry={setCountry}
                  background={background}
                  setBackground={setBackground}
                  activeChallengeId={activeChallengeId}
                  setActiveChallengeId={setActiveChallengeId}
                />
              )}
              {step === 2 && (
                <StepFamily
                  zodiac={zodiac}
                  setZodiac={setZodiac}
                  traits={traits}
                  toggleTrait={toggleTrait}
                  isPremium={isPremium}
                  unlockedPrestigeTraitIds={unlockedPrestigeTraitIds}
                  hasDynastyTraitExpansion={hasDynastyTraitExpansion}
                />
              )}
              {step === 3 && (
                <StepPersonality
                  personality={personality}
                  setPersonality={setPersonality}
                />
              )}
              {step === 4 && (
                <StepScenario
                  selectedScenario={selectedScenario}
                  setSelectedScenario={setSelectedScenario}
                />
              )}
            </Animated.View>
          </ScrollView>

          <View style={[styles.ctaWrap, { backgroundColor: colors.bgCard, borderTopColor: colors.border }]}>
            <GradientButton
              label={step < STEP_COUNT - 1 ? "Continue" : "Begin Your Life"}
              onPress={nextStep}
              colors={[
                stepColors[step],
                step < STEP_COUNT - 1 ? `${stepColors[step]}CC` : colors.gold3 || "#D97706",
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

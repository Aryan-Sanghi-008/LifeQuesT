import { useState, useRef, Fragment } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated,
  TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, FamilyBackground, Gender } from '../types';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { DiceBearAvatar } from '../components/Avatars';
import { GradientButton, FadeInView } from '../components/index';
import { useGameStore } from '../store/gameStore';
import { COUNTRIES, ZODIACS, TRAITS, FAMILY_BACKGROUNDS } from '../data/gameData';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const STEP_COUNT = 3;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CharacterCreate'>;
  route: RouteProp<RootStackParamList, 'CharacterCreate'>;
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <View style={si.row}>
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <Fragment key={i}>
          <View style={[si.dot, i < current && si.dotDone, i === current && si.dotActive]}>
            {i < current ? (
              <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                <Path stroke={COLORS.bg} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
              </Svg>
            ) : (
              <Text style={si.dotNum}>{i + 1}</Text>
            )}
          </View>
          {i < STEP_COUNT - 1 && (
            <View style={[si.line, i < current && si.lineDone]} />
          )}
        </Fragment>
      ))}
    </View>
  );
}

const si = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: SPACING.xl },
  dot:      { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.bgCard2, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  dotActive:{ borderColor: COLORS.gold, backgroundColor: `${COLORS.gold}18` },
  dotDone:  { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  dotNum:   { fontFamily: FONTS.monoSemiBold, fontSize: 11, color: COLORS.t3 },
  line:     { flex: 1, height: 1.5, backgroundColor: COLORS.border, marginHorizontal: 4, maxWidth: 40 },
  lineDone: { backgroundColor: COLORS.gold },
});

// ─── Gender Picker ────────────────────────────────────────────────────────────
const GENDER_OPTIONS: Array<{ id: Gender; label: string; icon: string }> = [
  { id: 'male',   label: 'Male',   icon: '♂' },
  { id: 'female', label: 'Female', icon: '♀' },
  { id: 'other',  label: 'Other',  icon: '⚧' },
];

// ─── Step 1: Identity ─────────────────────────────────────────────────────────
function Step1({
  name, setName, gender, setGender,
}: {
  name: string; setName: (v: string) => void;
  gender: Gender; setGender: (v: Gender) => void;
}) {
  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Who are you?</Text>
      <Text style={styles.stepSub}>Choose your gender, give yourself a name, and see your baby self.</Text>

      {/* Gender picker */}
      <Text style={styles.inputLabel}>GENDER</Text>
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map(g => {
          const active = g.id === gender;
          return (
            <Pressable
              key={g.id}
              onPress={() => setGender(g.id)}
              style={[styles.genderCard, active && styles.genderCardActive]}
            >
              <Text style={styles.genderIcon}>{g.icon}</Text>
              <Text style={[styles.genderLabel, active && { color: COLORS.gold }]}>{g.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Baby avatar preview */}
      <View style={styles.babyPreviewWrap}>
        <View style={styles.babyFrame}>
          <DiceBearAvatar
            seed={name || 'NewBorn'}
            lifeStage="infant"
            gender={gender}
            size={88}
          />
        </View>
        <Text style={styles.babyLabel}>Your baby avatar</Text>
      </View>

      {/* Name input */}
      <Text style={styles.inputLabel}>YOUR NAME</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name..."
          placeholderTextColor={COLORS.t4}
          maxLength={24}
          style={styles.textInput}
          returnKeyType="done"
        />
      </View>
    </FadeInView>
  );
}

// ─── Step 2: Origins ──────────────────────────────────────────────────────────
function Step2({
  country, setCountry, background, setBackground,
}: {
  country: string; setCountry: (v: string) => void;
  background: FamilyBackground; setBackground: (v: FamilyBackground) => void;
}) {
  const bgColors: Record<FamilyBackground, string> = {
    poor: COLORS.crimson,
    middle: COLORS.sapphire,
    wealthy: COLORS.teal,
    royalty: COLORS.gold,
  };

  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Origins</Text>
      <Text style={styles.stepSub}>Where you were born shapes your destiny.</Text>

      <Text style={styles.inputLabel}>COUNTRY OF BIRTH</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.xl }}>
        <View style={{ flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: 2 }}>
          {COUNTRIES.map(c => {
            const active = c.code === country;
            return (
              <Pressable
                key={c.code}
                onPress={() => setCountry(c.code)}
                style={[styles.countryChip, active && styles.countryChipActive]}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text style={[styles.countryName, active && { color: COLORS.gold }]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.inputLabel}>FAMILY BACKGROUND</Text>
      <View style={styles.bgGrid}>
        {FAMILY_BACKGROUNDS.map(bg => {
          const active = (bg.id as FamilyBackground) === background;
          const accentColor = bgColors[bg.id as FamilyBackground];
          return (
            <Pressable
              key={bg.id}
              onPress={() => setBackground(bg.id as FamilyBackground)}
              style={[styles.bgCard, active && { borderColor: accentColor, backgroundColor: `${accentColor}10` }]}
            >
              <View style={[styles.bgDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.bgLabel, active && { color: accentColor }]}>{bg.label}</Text>
              <Text style={styles.bgDesc}>{bg.description}</Text>
              <Text style={[styles.bgWealth, { color: accentColor }]}>Wealth: {bg.wealthStart}</Text>
            </Pressable>
          );
        })}
      </View>
    </FadeInView>
  );
}

// ─── Step 3: Traits & Zodiac ──────────────────────────────────────────────────
function Step3({
  zodiac, setZodiac, traits, toggleTrait,
}: {
  zodiac: string; setZodiac: (v: string) => void;
  traits: string[]; toggleTrait: (id: string) => void;
}) {
  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Nature</Text>
      <Text style={styles.stepSub}>Pick your zodiac and up to 2 personality traits.</Text>

      <Text style={styles.inputLabel}>ZODIAC SIGN</Text>
      <View style={styles.zodiacGrid}>
        {ZODIACS.map(z => {
          const active = z.id === zodiac;
          return (
            <Pressable
              key={z.id}
              onPress={() => setZodiac(z.id)}
              style={[styles.zodiacChip, active && styles.zodiacChipActive]}
            >
              <Text style={[styles.zodiacLabel, active && { color: COLORS.gold }]}>{z.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.inputLabel, { marginTop: SPACING.xl }]}>PERSONALITY TRAITS</Text>
      <Text style={styles.traitHint}>Choose up to 2 traits that define you</Text>
      <View style={styles.traitGrid}>
        {TRAITS.map(t => {
          const active = traits.includes(t.id);
          const locked = !active && traits.length >= 2;
          return (
            <Pressable
              key={t.id}
              onPress={() => !locked && toggleTrait(t.id)}
              style={[
                styles.traitCard,
                active && styles.traitCardActive,
                locked && styles.traitCardLocked,
              ]}
            >
              {active && (
                <View style={styles.traitCheck}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path stroke={COLORS.orchid} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                  </Svg>
                </View>
              )}
              <Text style={[styles.traitLabel, active && { color: COLORS.orchid }]}>{t.label}</Text>
              <Text style={styles.traitDesc}>{t.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </FadeInView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function CharacterCreateScreen({ navigation, route }: Props) {
  const createCharacter = useGameStore(s => s.createCharacter);
  const carriedFromStore = useGameStore(s => s.carriedStatsForCreate);
  const carriedStats = carriedFromStore ?? route.params?.carriedStats;

  const [step, setStep]           = useState(0);
  const [name, setName]           = useState('');
  const [gender, setGender]       = useState<Gender>('male');
  const [country, setCountry]     = useState('IN');
  const [background, setBackground] = useState<FamilyBackground>('middle');
  const [zodiac, setZodiac]       = useState('leo');
  const [traits, setTraits]       = useState<string[]>([]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleTrait = (id: string) => {
    setTraits(prev => prev.includes(id) ? prev.filter(t => t !== id) : prev.length < 2 ? [...prev, id] : prev);
  };

  const nextStep = () => {
    if (step === 0 && !name.trim()) return;
    if (step < STEP_COUNT - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      setStep(s => s + 1);
    } else {
      const selectedZodiac = ZODIACS.find(z => z.id === zodiac);
      createCharacter({
        name: name.trim(),
        gender,
        countryCode: country,
        zodiac,
        zodiacBonusStat: selectedZodiac?.bonusStat,
        familyBackground: background,
        traits,
        carriedStats: carriedStats ?? undefined,
      });
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
    else navigation.goBack();
  };

  const canProceed = step === 0 ? name.trim().length > 0 : true;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[COLORS.bg, '#0A0F1A', COLORS.bg]} style={StyleSheet.absoluteFill} />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Pressable onPress={prevStep} style={styles.backBtn}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path stroke={COLORS.t2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </Svg>
            </Pressable>
            <StepIndicator current={step} />
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              {step === 0 && <Step1 name={name} setName={setName} gender={gender} setGender={setGender} />}
              {step === 1 && <Step2 country={country} setCountry={setCountry} background={background} setBackground={setBackground} />}
              {step === 2 && <Step3 zodiac={zodiac} setZodiac={setZodiac} traits={traits} toggleTrait={toggleTrait} />}
            </Animated.View>
          </ScrollView>

          <View style={styles.ctaWrap}>
            <GradientButton
              label={step < STEP_COUNT - 1 ? 'Continue  →' : 'Begin Your Life'}
              onPress={nextStep}
              colors={step < STEP_COUNT - 1 ? [COLORS.sapphire, COLORS.sapphire2] : [COLORS.gold, COLORS.gold3]}
              textColor={step < STEP_COUNT - 1 ? COLORS.t1 : '#160D00'}
              disabled={!canProceed}
              style={{ width: '100%' }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  orb1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: `${COLORS.gold}06`, top: -60, right: -80 },
  orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: `${COLORS.orchid}06`, bottom: 100, left: -60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl },
  stepContainer: { gap: SPACING.md },
  stepTitle: { fontFamily: FONTS.displayBold, fontSize: 28, color: COLORS.t1, marginTop: SPACING.sm },
  stepSub: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.t3, lineHeight: 21, marginBottom: SPACING.sm },
  inputLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2, marginBottom: SPACING.sm },
  inputWrap: { borderRadius: RADII.md, backgroundColor: COLORS.bgCard, borderWidth: 1.5, borderColor: COLORS.border, overflow: 'hidden' },
  textInput: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.t1, paddingVertical: 16, paddingHorizontal: SPACING.lg },

  // Gender
  genderRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  genderCard: {
    flex: 1, alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.bgCard, borderRadius: RADII.md,
    padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border,
  },
  genderCardActive: { borderColor: COLORS.gold, backgroundColor: `${COLORS.gold}08` },
  genderIcon: { fontSize: 22 },
  genderLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t3 },

  // Baby preview
  babyPreviewWrap: { alignItems: 'center', marginVertical: SPACING.lg },
  babyFrame: { borderRadius: RADII.xl, borderWidth: 2.5, borderColor: COLORS.goldBorder, overflow: 'hidden', padding: 4, backgroundColor: COLORS.bgCard },
  babyLabel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, marginTop: SPACING.sm },

  // Country
  countryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.border },
  countryChipActive: { borderColor: COLORS.gold, backgroundColor: `${COLORS.gold}10` },
  countryFlag: { fontSize: 16 },
  countryName: { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.t3 },

  // Backgrounds
  bgGrid: { gap: SPACING.sm },
  bgCard: { padding: SPACING.md, borderRadius: RADII.md, backgroundColor: COLORS.bgCard, borderWidth: 1.5, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.sm },
  bgDot: { width: 8, height: 8, borderRadius: 4 },
  bgLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t2 },
  bgDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, flex: 1, marginLeft: 4 },
  bgWealth: { fontFamily: FONTS.monoSemiBold, fontSize: 11, marginLeft: 'auto' },

  // Zodiac
  zodiacGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  zodiacChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.border },
  zodiacChipActive: { borderColor: COLORS.gold, backgroundColor: `${COLORS.gold}12` },
  zodiacLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t3 },

  // Traits
  traitHint: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, marginBottom: SPACING.sm, marginTop: -SPACING.sm },
  traitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  traitCard: { width: (width - SPACING.xl * 2 - SPACING.sm) / 2 - 0.5, padding: SPACING.md, borderRadius: RADII.md, backgroundColor: COLORS.bgCard, borderWidth: 1.5, borderColor: COLORS.border, gap: 3, position: 'relative' },
  traitCardActive: { borderColor: COLORS.orchid, backgroundColor: `${COLORS.orchid}08` },
  traitCardLocked: { opacity: 0.38 },
  traitCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: `${COLORS.orchid}20`, alignItems: 'center', justifyContent: 'center' },
  traitLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t2 },
  traitDesc: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3 },

  // CTA
  ctaWrap: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: `${COLORS.bg}F0` },
});

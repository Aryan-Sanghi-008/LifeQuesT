import { useState, useRef, Fragment, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated,
  TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, StackActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, FamilyBackground, Gender } from '../types';
import { COLORS, FONTS, RADII, SPACING, SHADOWS } from '../constants/theme';
import { DiceBearAvatar } from '../components/Avatars';
import { GradientButton, FadeInView } from '../components/index';
import { useGameStore } from '../store/gameStore';
import { COUNTRIES, ZODIACS, TRAITS, FAMILY_BACKGROUNDS } from '../data/gameData';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { CHALLENGES } from '../engine/challengeEngine';
import { PRESTIGE_TRAITS } from '../engine/prestigeEngine';

const { width } = Dimensions.get('window');
const STEP_COUNT = 3;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CharacterCreate'>;
  route: RouteProp<RootStackParamList, 'CharacterCreate'>;
};

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepProgressBar({ current }: { current: number }) {
  const pct = ((current + 1) / STEP_COUNT) * 100;
  const anim = useRef(new Animated.Value((current / STEP_COUNT) * 100)).current;

  // Animate on step change
  Animated.spring(anim, { toValue: pct, useNativeDriver: false, damping: 20, stiffness: 180 } as any).start();

  const widthPct = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });

  return (
    <View style={spb.wrap}>
      <View style={spb.track}>
        <Animated.View style={[spb.fill, { width: widthPct }]} />
      </View>
      <View style={spb.dots}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <Fragment key={i}>
              <View style={[
                spb.dot,
                done   && spb.dotDone,
                active && spb.dotActive,
              ]}>
                {done ? (
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                  </Svg>
                ) : (
                  <Text style={[spb.dotNum, active && { color: COLORS.sapphire }]}>{i + 1}</Text>
                )}
              </View>
              {i < STEP_COUNT - 1 && (
                <View style={[spb.connector, i < current && { backgroundColor: COLORS.sapphire }]} />
              )}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

const spb = StyleSheet.create({
  wrap:      { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  track:     { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: SPACING.md },
  fill:      { height: '100%', backgroundColor: COLORS.sapphire, borderRadius: 2 },
  dots:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot:       { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.bg2, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  dotActive: { borderColor: COLORS.sapphire, backgroundColor: `${COLORS.sapphire}12` },
  dotDone:   { backgroundColor: COLORS.sapphire, borderColor: COLORS.sapphire },
  dotNum:    { fontFamily: FONTS.monoSemiBold, fontSize: 11, color: COLORS.t4 },
  connector: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4, maxWidth: 40 },
});

// ─── Gender Picker ────────────────────────────────────────────────────────────

const GENDER_OPTIONS: Array<{ id: Gender; label: string; icon: React.ReactNode; color: string }> = [
  {
    id: 'male', label: 'Male', color: COLORS.sapphire,
    icon: <Svg width={28} height={28} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.sapphire} strokeWidth={2} cx="10" cy="14" r="6"/><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M14.5 9.5L19 5M19 5h-4M19 5v4"/></Svg>,
  },
  {
    id: 'female', label: 'Female', color: '#EC4899',
    icon: <Svg width={28} height={28} viewBox="0 0 24 24" fill="none"><Circle stroke="#EC4899" strokeWidth={2} cx="12" cy="9" r="6"/><Path stroke="#EC4899" strokeWidth={2} strokeLinecap="round" d="M12 15v6M9 18h6"/></Svg>,
  },
  {
    id: 'other', label: 'Other', color: COLORS.orchid,
    icon: <Svg width={28} height={28} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.orchid} strokeWidth={2} cx="12" cy="12" r="7"/><Path stroke={COLORS.orchid} strokeWidth={2} strokeLinecap="round" d="M12 5V2M12 22v-3"/></Svg>,
  },
];

// ─── Step 1: Identity ─────────────────────────────────────────────────────────

function Step1({ name, setName, gender, setGender, avatarSeed, onNameFocus }: {
  name: string; setName: (v: string) => void;
  gender: Gender; setGender: (v: Gender) => void;
  avatarSeed: string;
  onNameFocus: () => void;
}) {
  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Who are you?</Text>
      <Text style={styles.stepSub}>Choose your gender, give yourself a name, and see your baby self.</Text>

      <Text style={styles.inputLabel}>GENDER</Text>
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map(g => {
          const active = g.id === gender;
          return (
            <Pressable
              key={g.id}
              onPress={() => setGender(g.id)}
              style={[styles.genderCard, active && { borderColor: g.color, backgroundColor: `${g.color}10` }]}
            >
              {g.icon}
              <Text style={[styles.genderLabel, { color: active ? g.color : COLORS.t3 }]}>{g.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.babyPreviewWrap}>
        <View style={[styles.babyFrame, { borderColor: `${COLORS.gold}50` }]}>
          <DiceBearAvatar
            seed={avatarSeed}
            lifeStage="infant"
            gender={gender}
            size={94}
            clipCircular
          />
        </View>
        <Text style={styles.babyLabel}>Your baby avatar</Text>
      </View>

      <Text style={styles.inputLabel}>YOUR NAME</Text>
      <View style={styles.inputWrap}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginLeft: SPACING.lg }}>
          <Path stroke={COLORS.t4} strokeWidth={2} strokeLinecap="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <Circle stroke={COLORS.t4} strokeWidth={2} cx="12" cy="7" r="4"/>
        </Svg>
        <TextInput
          value={name}
          onChangeText={setName}
          onFocus={onNameFocus}
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

const BG_COLORS: Record<FamilyBackground, string> = {
  poor:    COLORS.health,
  middle:  COLORS.sapphire,
  wealthy: COLORS.catFinancial,
  royalty: COLORS.gold,
};

const BG_ICONS: Record<string, React.ReactNode> = {
  poor:    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.health} strokeWidth={2} strokeLinecap="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></Svg>,
  middle:  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Rect stroke={COLORS.sapphire} strokeWidth={2} x="3" y="3" width="18" height="18" rx="2"/><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M9 12l2 2 4-4"/></Svg>,
  wealthy: <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.catFinancial} strokeWidth={2} strokeLinecap="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></Svg>,
  royalty: <Svg width={20} height={20} viewBox="0 0 24 24" fill={COLORS.gold}><Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Svg>,
};

function Step2({ country, setCountry, background, setBackground, activeChallengeId, setActiveChallengeId }: {
  country: string; setCountry: (v: string) => void;
  background: FamilyBackground; setBackground: (v: FamilyBackground) => void;
  activeChallengeId: string | undefined; setActiveChallengeId: (v: string | undefined) => void;
}) {
  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Origins</Text>
      <Text style={styles.stepSub}>Where you were born shapes your destiny.</Text>

      <Text style={styles.inputLabel}>COUNTRY OF BIRTH</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.xl }}>
        <View style={{ flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: 2, paddingBottom: 4 }}>
          {COUNTRIES.map(c => {
            const active = c.code === country;
            return (
              <Pressable
                key={c.code}
                onPress={() => setCountry(c.code)}
                style={[
                  styles.countryChip,
                  active && { borderColor: COLORS.sapphire, backgroundColor: `${COLORS.sapphire}10` },
                ]}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text style={[styles.countryName, active && { color: COLORS.sapphire, fontFamily: FONTS.bodyBold }]}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.inputLabel}>FAMILY BACKGROUND</Text>
      <View style={styles.bgGrid}>
        {FAMILY_BACKGROUNDS.map(bg => {
          const active = (bg.id as FamilyBackground) === background;
          const accentColor = BG_COLORS[bg.id as FamilyBackground];
          return (
            <Pressable
              key={bg.id}
              onPress={() => setBackground(bg.id as FamilyBackground)}
              style={[
                styles.bgCard,
                active && { borderColor: `${accentColor}50`, backgroundColor: `${accentColor}08` },
              ]}
            >
              <View style={[styles.bgIconWrap, { backgroundColor: `${accentColor}15` }]}>
                {BG_ICONS[bg.id]}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bgLabel, active && { color: accentColor }]}>{bg.label}</Text>
                <Text style={styles.bgDesc}>{bg.description}</Text>
              </View>
              <View style={[styles.wealthPill, { backgroundColor: `${accentColor}15` }]}>
                <Text style={[styles.wealthText, { color: accentColor }]}>{bg.wealthStart}</Text>
              </View>
              {active && (
                <View style={[styles.activeTick, { backgroundColor: accentColor }]}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" d="M20 6L9 17l-5-5"/>
                  </Svg>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.inputLabel, { marginTop: SPACING.xl }]}>CHALLENGE MODE (OPTIONAL)</Text>
      <Text style={styles.traitHint}>Select a challenge constraints to earn bonus Prestige Points</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
        <View style={{ flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: 2, paddingBottom: 4 }}>
          <Pressable
            onPress={() => setActiveChallengeId(undefined)}
            style={[
              styles.countryChip,
              activeChallengeId === undefined && { borderColor: COLORS.t3, backgroundColor: `${COLORS.t3}10` },
            ]}
          >
            <Text style={[styles.countryName, activeChallengeId === undefined && { color: COLORS.t1, fontFamily: FONTS.bodyBold }]}>
              Standard Life (No Challenge)
            </Text>
          </Pressable>
          {Object.values(CHALLENGES).map(c => {
            const active = c.id === activeChallengeId;
            return (
              <Pressable
                key={c.id}
                onPress={() => setActiveChallengeId(c.id)}
                style={[
                  styles.countryChip,
                  active && { borderColor: COLORS.teal, backgroundColor: `${COLORS.teal}10` },
                ]}
              >
                <Text style={[styles.countryName, active && { color: COLORS.teal, fontFamily: FONTS.bodyBold }]}>
                  {c.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </FadeInView>
  );
}

// ─── Step 3: Traits & Zodiac ──────────────────────────────────────────────────

function Step3({ zodiac, setZodiac, traits, toggleTrait, isPremium }: {
  zodiac: string; setZodiac: (v: string) => void;
  traits: string[]; toggleTrait: (id: string) => void;
  isPremium: boolean;
}) {
  const globalPrestige = useGameStore(s => s.globalPrestige);
  const unlockedPrestige = globalPrestige.unlockedTraitIds ?? [];
  return (
    <FadeInView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Nature</Text>
      <Text style={styles.stepSub}>Pick your zodiac sign and up to 2 personality traits.</Text>

      <Text style={styles.inputLabel}>ZODIAC SIGN</Text>
      <View style={styles.zodiacGrid}>
        {ZODIACS.map(z => {
          const active = z.id === zodiac;
          return (
            <Pressable
              key={z.id}
              onPress={() => setZodiac(z.id)}
              style={[styles.zodiacChip, active && { borderColor: COLORS.orchid, backgroundColor: `${COLORS.orchid}10` }]}
            >
              <Text style={[styles.zodiacLabel, { color: active ? COLORS.orchid : COLORS.t2, fontFamily: active ? FONTS.bodyBold : FONTS.body }]}>
                {z.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.inputLabel, { marginTop: SPACING.xl }]}>PERSONALITY TRAITS</Text>
      <Text style={styles.traitHint}>Select up to 2 — they shape your starting stats</Text>
      <View style={styles.traitGrid}>
        {TRAITS.map(t => {
          const active = traits.includes(t.id);
          const locked = !active && traits.length >= 2;
          const premiumLocked = 'premiumOnly' in t && t.premiumOnly && !isPremium;
          return (
            <Pressable
              key={t.id}
              onPress={() => {
                if (premiumLocked) {
                  Alert.alert('Premium Trait', 'Unlock LifeQuest Premium to use this trait.');
                  return;
                }
                if (!locked) toggleTrait(t.id);
              }}
              style={[
                styles.traitCard,
                active && { borderColor: `${COLORS.orchid}50`, backgroundColor: `${COLORS.orchid}08` },
                (locked || premiumLocked) && styles.traitCardLocked,
              ]}
            >
              {premiumLocked && (
                <Text style={styles.traitDesc}>Premium</Text>
              )}
              {active && (
                <View style={[styles.traitCheck, { backgroundColor: COLORS.orchid }]}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" d="M20 6L9 17l-5-5"/>
                  </Svg>
                </View>
              )}
              <Text style={[styles.traitLabel, active && { color: COLORS.orchid }]}>{t.label}</Text>
              <Text style={styles.traitDesc}>{t.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Prestige Unlocked Traits */}
      {unlockedPrestige.length > 0 && (
        <>
          <Text style={[styles.inputLabel, { marginTop: SPACING.xl }]}>PRESTIGE TRAITS</Text>
          <Text style={styles.traitHint}>Unlocks from your cross-life Achievements and Prestige progress</Text>
          <View style={styles.traitGrid}>
            {PRESTIGE_TRAITS.filter(pt => unlockedPrestige.includes(pt.id)).map(pt => {
              const active = traits.includes(pt.id);
              const locked = !active && traits.length >= 2;
              return (
                <Pressable
                  key={pt.id}
                  onPress={() => {
                    if (!locked) toggleTrait(pt.id);
                  }}
                  style={[
                    styles.traitCard,
                    { borderColor: COLORS.gold },
                    active && { borderColor: `${COLORS.gold}80`, backgroundColor: `${COLORS.gold}08` },
                    locked && styles.traitCardLocked,
                  ]}
                >
                  {active && (
                    <View style={[styles.traitCheck, { backgroundColor: COLORS.gold }]}>
                      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                        <Path stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" d="M20 6L9 17l-5-5"/>
                      </Svg>
                    </View>
                  )}
                  <Text style={[styles.traitLabel, { color: COLORS.gold }, active && { fontFamily: FONTS.bodyBold }]}>
                    {pt.label}
                  </Text>
                  <Text style={styles.traitDesc}>{pt.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </FadeInView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function CharacterCreateScreen({ navigation, route }: Props) {
  const createCharacter   = useGameStore(s => s.createCharacter);
  const character         = useGameStore(s => s.character);
  const isPremium         = useGameStore(s => s.character?.isPremium ?? false);
  const carriedFromStore  = useGameStore(s => s.carriedStatsForCreate);
  const carriedStats      = carriedFromStore ?? route.params?.carriedStats;
  const insets = useSafeAreaInsets();

  const [step, setStep]             = useState(0);
  const [name, setName]             = useState('');
  const [gender, setGender]         = useState<Gender>('male');
  const [country, setCountry]       = useState('IN');
  const [background, setBackground] = useState<FamilyBackground>('middle');
  const [zodiac, setZodiac]         = useState('leo');
  const [traits, setTraits]         = useState<string[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const avatarSeedRef = useRef<string | null>(null);

  const ensureAvatarSeed = () => {
    if (!avatarSeedRef.current && name.trim()) {
      avatarSeedRef.current = `${name.trim()}-${Date.now()}`;
    }
    return avatarSeedRef.current ?? 'NewBorn';
  };

  useEffect(() => {
    if (character && isCreating) {
      navigation.dispatch(StackActions.replace('MainTabs'));
    }
  }, [character, isCreating, navigation]);

  const toggleTrait = (id: string) => {
    setTraits(prev => prev.includes(id) ? prev.filter(t => t !== id) : prev.length < 2 ? [...prev, id] : prev);
  };

  const nextStep = () => {
    if (step === 0 && !name.trim()) return;
    if (step === 0) ensureAvatarSeed();
    if (step < STEP_COUNT - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -16, duration: 130, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
      setStep(s => s + 1);
    } else {
      setIsCreating(true);
      const selectedZodiac = ZODIACS.find(z => z.id === zodiac);
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
      setStep(s => s - 1);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('SaveSlots');
    }
  };

  const canProceed = step === 0 ? name.trim().length > 0 : true;

  const STEP_LABELS = ['Identity', 'Origins', 'Traits'];
  const STEP_COLORS = [COLORS.sapphire, COLORS.catCareer, COLORS.orchid];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 100 : 20}
        >

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={prevStep} style={styles.backBtn}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path stroke={COLORS.t2} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
              </Svg>
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.stepChapterLabel}>Step {step + 1} of {STEP_COUNT}</Text>
              <Text style={[styles.stepChapterName, { color: STEP_COLORS[step] }]}>{STEP_LABELS[step]}</Text>
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
                  onNameFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
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

          <View style={styles.ctaWrap}>
            <GradientButton
              label={step < STEP_COUNT - 1 ? 'Continue' : 'Begin Your Life'}
              onPress={nextStep}
              colors={[STEP_COLORS[step], step < STEP_COUNT - 1 ? `${STEP_COLORS[step]}CC` : COLORS.gold3]}
              textColor="#FFFFFF"
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
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: RADII.sm,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border,
  },
  stepChapterLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 },
  stepChapterName:  { fontFamily: FONTS.bodyBold, fontSize: 15, marginTop: 2 },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  stepContainer: { gap: SPACING.md },
  stepTitle: { fontFamily: FONTS.displayBold, fontSize: 28, color: COLORS.t1, marginTop: SPACING.sm },
  stepSub:   { fontFamily: FONTS.body, fontSize: 14, color: COLORS.t3, lineHeight: 21, marginBottom: SPACING.sm },
  inputLabel:{ fontFamily: FONTS.bodyBold, fontSize: 10, color: COLORS.t4, letterSpacing: 2, marginBottom: SPACING.sm },

  // Gender
  genderRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  genderCard: {
    flex: 1, alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.bgCard, borderRadius: RADII.md,
    padding: SPACING.md, borderWidth: 2, borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  genderLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 13 },

  // Baby preview
  babyPreviewWrap: { alignItems: 'center', marginVertical: SPACING.lg },
  babyFrame: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.card,
  },
  babyLabel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, marginTop: SPACING.sm },

  // Input
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: RADII.md, backgroundColor: COLORS.bgCard, borderWidth: 1.5, borderColor: COLORS.border, overflow: 'hidden' },
  textInput: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.t1, paddingVertical: 15, paddingHorizontal: SPACING.md, flex: 1 },

  // Country
  countryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADII.full, borderWidth: 1.5, borderColor: COLORS.border },
  countryFlag: { fontSize: 16 },
  countryName: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 },

  // Background
  bgGrid: { gap: SPACING.sm },
  bgCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderRadius: RADII.md,
    backgroundColor: COLORS.bgCard, borderWidth: 2, borderColor: COLORS.border,
    position: 'relative', overflow: 'hidden', ...SHADOWS.subtle,
  },
  bgIconWrap: { width: 44, height: 44, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bgLabel:   { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.t1 },
  bgDesc:    { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 2 },
  wealthPill:{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADII.full },
  wealthText:{ fontFamily: FONTS.monoSemiBold, fontSize: 11 },
  activeTick:{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Zodiac
  zodiacGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  zodiacChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADII.full, borderWidth: 1.5, borderColor: COLORS.border },
  zodiacLabel:{ fontSize: 13 },

  // Traits
  traitHint: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, marginBottom: SPACING.sm, marginTop: -SPACING.sm },
  traitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  traitCard: {
    width: (width - SPACING.xl * 2 - SPACING.sm) / 2 - 0.5,
    padding: SPACING.md, borderRadius: RADII.md,
    backgroundColor: COLORS.bgCard, borderWidth: 2, borderColor: COLORS.border,
    gap: 4, position: 'relative', ...SHADOWS.subtle,
  },
  traitCardLocked: { opacity: 0.40 },
  traitCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  traitLabel: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.t1 },
  traitDesc:  { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3 },

  // CTA
  ctaWrap: {
    paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl, paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.bgCard,
  },
});

import { useRef, useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated,
  StatusBar, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types';
import { COLORS, FONTS, RADII, SPACING } from '@constants/theme';
import LifeGlyph from '@components/LifeGlyph';
import { GradientButton } from '@components/index';
import { DiceBearAvatar } from '@components/Avatars';
import { signInWithGoogle, signInAsGuest, isGoogleSignInAvailable } from '@services/auth';
import { useGameStore } from '@store/gameStore';
import { logEvent } from '@services/analytics';
import { getPrivacyPolicyUrl, getTermsUrl, openLegalUrl } from '@config/legal';
import Svg, { Path, G } from 'react-native-svg';
import type { LifeStage, Gender } from '@/types';

const { width: W, height: H } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

// ─── Google Icon ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <G>
        <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </G>
    </Svg>
  );
}

// ─── Particle Background ───────────────────────────────────────────────────────
const PARTICLE_COUNT = 24;

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  anim: Animated.Value;
  dur: number;
  offset: number;
}

function useParticles(): Particle[] {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 1.5 + Math.random() * 3,
      color: [COLORS.gold, COLORS.teal, COLORS.sapphire, COLORS.orchid, COLORS.crimson][i % 5],
      anim: new Animated.Value(0),
      dur: 3000 + Math.random() * 4000,
      offset: 8 + Math.random() * 20,
    }))
  ).current;

  useEffect(() => {
    particles.forEach(p => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p.anim, { toValue: 1, duration: p.dur, useNativeDriver: true }),
          Animated.timing(p.anim, { toValue: 0, duration: p.dur, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return particles;
}

function ParticleField() {
  const particles = useParticles();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -p.offset] });
        const opacity = p.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.5, 0.15] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
              transform: [{ translateY }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Character Carousel ────────────────────────────────────────────────────────
const CAROUSEL_CHARS: Array<{ seed: string; stage: LifeStage; gender: Gender; label: string }> = [
  { seed: 'hero_alex', stage: 'young_adult', gender: 'male',   label: 'The Achiever'  },
  { seed: 'hero_maya', stage: 'adult',       gender: 'female', label: 'The Strategist' },
  { seed: 'hero_sam',  stage: 'teen',        gender: 'other',  label: 'The Explorer'  },
];

function CharacterCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out + slide
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -30, duration: 350, useNativeDriver: true }),
      ]).start(() => {
        setActiveIdx(prev => (prev + 1) % CAROUSEL_CHARS.length);
        slideAnim.setValue(30);
        // Fade in
        Animated.parallel([
          Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 180 }),
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 180 }),
        ]).start();
      });
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const char = CAROUSEL_CHARS[activeIdx];

  return (
    <Animated.View style={[styles.carouselWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.carouselAvatarRing}>
        <DiceBearAvatar
          seed={char.seed}
          lifeStage={char.stage}
          gender={char.gender}
          size={84}
          showFrame
          frameColor={COLORS.goldBorder}
        />
      </View>
      <Text style={styles.carouselLabel}>{char.label}</Text>
      <View style={styles.carouselDots}>
        {CAROUSEL_CHARS.map((_, i) => (
          <View
            key={i}
            style={[styles.carouselDot, i === activeIdx && styles.carouselDotActive]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Feature Pills ─────────────────────────────────────────────────────────────
const FEATURE_PILLS = [
  { label: '🔫 Crime & Karma',     color: COLORS.crimson   },
  { label: '🏢 Business Empire',   color: COLORS.gold      },
  { label: '💑 Relationships',     color: COLORS.orchid    },
  { label: '🎓 Education Paths',   color: COLORS.sapphire  },
  { label: '🌍 50+ Countries',     color: COLORS.teal      },
];

function FeaturePills() {
  return (
    <View style={styles.pillsWrap}>
      {FEATURE_PILLS.map(pill => (
        <View key={pill.label} style={[styles.pill, { borderColor: `${pill.color}40`, backgroundColor: `${pill.color}10` }]}>
          <Text style={[styles.pillText, { color: pill.color }]}>{pill.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Stagger Animation Hook ────────────────────────────────────────────────────
function useStaggeredEntrance(count: number, delay = 100) {
  const anims = useRef<Animated.Value[]>(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.stagger(
      delay,
      anims.map(a =>
        Animated.spring(a, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 180 })
      )
    ).start();
  }, []);

  return anims;
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function AuthScreen({ navigation }: Props) {
  const onUserChanged = useGameStore(s => s.onUserChanged);
  const [loading, setLoading] = useState<'google' | 'guest' | null>(null);
  const googleSignInAvailable = isGoogleSignInAvailable();

  const anims = useStaggeredEntrance(6, 120);

  const makeEntrance = (idx: number) => ({
    opacity: anims[idx],
    transform: [{
      translateY: anims[idx].interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
    }],
  });

  // Floating orbs
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;
  const orb3Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = (anim: Animated.Value, dur: number, offset: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -offset, duration: dur, useNativeDriver: true }),
          Animated.timing(anim, { toValue: offset,  duration: dur, useNativeDriver: true }),
        ])
      ).start();
    float(orb1Y, 4000, 18);
    float(orb2Y, 5500, 14);
    float(orb3Y, 3800, 22);
  }, []);

  const goToSlots = () => navigation.replace('SaveSlots');

  const handleGoogle = async () => {
    setLoading('google');
    try {
      const user = await signInWithGoogle();
      await onUserChanged(user);
      void logEvent('sign_in', { method: 'google' });
      goToSlots();
    } catch (e) {
      Alert.alert('Sign In Failed', (e as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleGuest = async () => {
    setLoading('guest');
    try {
      const user = await signInAsGuest();
      await onUserChanged(user);
      void logEvent('sign_in', { method: 'guest' });
      goToSlots();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleOpenLegal = async (url: string, label: string) => {
    try {
      await openLegalUrl(url);
    } catch {
      Alert.alert('Unable to open link', `Could not open ${label}. Check your network connection.`);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Floating orbs */}
      <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.orb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />
      <Animated.View style={[styles.orb, styles.orb3, { transform: [{ translateY: orb3Y }] }]} />

      {/* Particle field */}
      <ParticleField />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>

          {/* Logo + character carousel */}
          <Animated.View style={[styles.heroSection, makeEntrance(0)]}>
            <View style={styles.logoRow}>
              <LifeGlyph size={44} />
              <Text style={styles.wordmark}>
                Life<Text style={styles.wordmarkAccent}>Quest</Text>
              </Text>
            </View>
            <CharacterCarousel />
            <Text style={styles.tagline}>Every choice writes a different story.</Text>
          </Animated.View>

          {/* Feature pills */}
          <Animated.View style={makeEntrance(1)}>
            <FeaturePills />
          </Animated.View>

          {/* Divider */}
          <Animated.View style={[styles.dividerWrap, makeEntrance(2)]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>BEGIN YOUR JOURNEY</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* CTA buttons */}
          <Animated.View style={[styles.actions, makeEntrance(3)]}>
            {googleSignInAvailable ? (
              <Pressable
                onPress={() => void handleGoogle()}
                disabled={loading !== null}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
                style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
              >
                {loading === 'google' ? <ActivityIndicator color={COLORS.t2} /> : <GoogleIcon />}
                <Text style={styles.googleText}>Continue with Google</Text>
              </Pressable>
            ) : (
              <Text style={styles.unavailableHint}>
                Google Sign-In available in a development build. Use guest mode in Expo Go.
              </Text>
            )}

            <GradientButton
              label={loading === 'guest' ? '' : 'Play as Guest'}
              accessibilityLabel="Play as guest"
              onPress={() => void handleGuest()}
              colors={[COLORS.sapphire, COLORS.sapphire2]}
              textColor="#FFFFFF"
              loading={loading === 'guest'}
              disabled={loading !== null}
              style={{ width: '100%' }}
            />
          </Animated.View>

          {/* Social proof + rating */}
          <Animated.View style={[styles.proof, makeEntrance(4)]}>
            <View style={styles.stars}>
              {[0,1,2,3,4].map(i => (
                <Text key={i} style={styles.star}>★</Text>
              ))}
            </View>
            <Text style={styles.proofText}>4.8 · #1 Life Sim · 2M+ lives lived</Text>
          </Animated.View>

          {/* Legal */}
          <Animated.View style={makeEntrance(5)}>
            <Text style={styles.legal}>
              By continuing you agree to our{' '}
              <Text
                style={styles.legalLink}
                onPress={() => void handleOpenLegal(getTermsUrl(), 'Terms of Service')}
                accessibilityRole="link"
              >
                Terms
              </Text>
              {' '}and{' '}
              <Text
                style={styles.legalLink}
                onPress={() => void handleOpenLegal(getPrivacyPolicyUrl(), 'Privacy Policy')}
                accessibilityRole="link"
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safe: { flex: 1 },

  // Orbs
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 320, height: 320, backgroundColor: `${COLORS.gold}09`, top: -80, right: -100 },
  orb2: { width: 280, height: 280, backgroundColor: `${COLORS.teal}07`, bottom: 100, left: -100 },
  orb3: { width: 200, height: 200, backgroundColor: `${COLORS.crimson}05`, bottom: 250, right: -50 },

  // Layout
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },

  // Hero
  heroSection: { alignItems: 'center', gap: SPACING.sm },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  wordmark: {
    fontFamily: FONTS.displayBlack,
    fontSize: 38,
    color: COLORS.t1,
    letterSpacing: -0.5,
  },
  wordmarkAccent: { color: COLORS.gold },
  tagline: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.t3,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Carousel
  carouselWrap: { alignItems: 'center', gap: SPACING.sm },
  carouselAvatarRing: {
    width: 96,
    height: 96,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: `${COLORS.gold}50`,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
  },
  carouselLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.t2,
    letterSpacing: 0.5,
  },
  carouselDots: { flexDirection: 'row', gap: 5 },
  carouselDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.border },
  carouselDotActive: { backgroundColor: COLORS.gold, width: 14 },

  // Feature pills
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.full,
    borderWidth: 1.5,
  },
  pillText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },

  // Divider
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.t4,
    letterSpacing: 1.5,
  },

  // Actions
  actions: {
    width: '100%',
    gap: SPACING.md,
    alignItems: 'center',
  },
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  googleText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.t1,
  },
  unavailableHint: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t4,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.sm,
  },

  // Social proof
  proof: { alignItems: 'center', gap: 3 },
  stars: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 13, color: COLORS.gold },
  proofText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.t4,
    textAlign: 'center',
  },

  // Legal
  legal: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.t4,
    textAlign: 'center',
    lineHeight: 15,
  },
  legalLink: {
    color: COLORS.t3,
    textDecorationLine: 'underline',
  },
});

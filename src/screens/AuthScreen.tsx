import { useRef, useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import LifeGlyph from '../components/LifeGlyph';
import { GradientButton, FadeInView } from '../components/index';
import { signInWithGoogle, signInAsGuest, isGoogleSignInAvailable } from '../services/auth';
import { useGameStore } from '../store/gameStore';
import { logEvent } from '../services/analytics';
import Svg, { Path, G } from 'react-native-svg';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

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

export default function AuthScreen({ navigation }: Props) {
  const setUser = useGameStore(s => s.setUser);
  const [loading, setLoading] = useState<'google' | 'guest' | null>(null);
  const googleSignInAvailable = isGoogleSignInAvailable();
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
      setUser(user);
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
      setUser(user);
      void logEvent('sign_in', { method: 'guest' });
      goToSlots();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Background orbs */}
      <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.orb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />
      <Animated.View style={[styles.orb, styles.orb3, { transform: [{ translateY: orb3Y }] }]} />

      {/* Subtle grid */}
      <View style={styles.grid} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>

          {/* Glyph */}
          <FadeInView delay={100} style={styles.glyphWrap}>
            <LifeGlyph size={104} />
          </FadeInView>

          {/* Wordmark */}
          <FadeInView delay={220}>
            <Text style={styles.wordmark}>
              Life<Text style={styles.wordmarkAccent}>Quest</Text>
            </Text>
            <Text style={styles.tagline}>Every choice writes a different story.</Text>
          </FadeInView>

          {/* Divider */}
          <FadeInView delay={340} style={styles.dividerWrap}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Begin your journey</Text>
            <View style={styles.dividerLine} />
          </FadeInView>

          {/* CTA buttons */}
          <FadeInView delay={460} style={styles.actions}>
            {googleSignInAvailable ? (
              <Pressable
                onPress={() => void handleGoogle()}
                disabled={loading !== null}
                android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
                style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
              >
                {loading === 'google' ? <ActivityIndicator color={COLORS.t2} /> : <GoogleIcon />}
                <Text style={styles.googleText}>Continue with Google</Text>
              </Pressable>
            ) : (
              <Text style={styles.unavailableHint}>
                Google Sign-In is available in a development build. Use guest mode in Expo Go.
              </Text>
            )}

            <GradientButton
              label="Play as Guest"
              onPress={() => void handleGuest()}
              colors={[COLORS.gold, COLORS.gold3]}
              textColor="#160D00"
              loading={loading === 'guest'}
              disabled={loading !== null}
              style={{ width: '100%' }}
            />

            <Pressable onPress={() => void handleGuest()} style={styles.guestBtn} disabled={loading !== null}>
              <Text style={styles.guestText}>Skip sign-in (offline guest)</Text>
            </Pressable>
          </FadeInView>

          {/* Social proof */}
          <FadeInView delay={560} style={styles.proof}>
            <View style={styles.stars}>
              {[0,1,2,3,4].map(i => (
                <Text key={i} style={styles.star}>★</Text>
              ))}
            </View>
            <Text style={styles.proofText}>4.8 · Ranked #1 Life Sim · 2M+ lives lived</Text>
          </FadeInView>

          {/* Legal */}
          <FadeInView delay={640}>
            <Text style={styles.legal}>
              By continuing you agree to our{' '}
              <Text style={styles.legalLink}>Terms</Text>
              {' '}and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>.
            </Text>
          </FadeInView>
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
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 320, height: 320,
    backgroundColor: `${COLORS.gold}09`,
    top: -80, right: -100,
    shadowColor: COLORS.gold, shadowRadius: 80, shadowOpacity: 0.12, elevation: 0,
  },
  orb2: {
    width: 280, height: 280,
    backgroundColor: `${COLORS.teal}07`,
    bottom: 100, left: -100,
  },
  orb3: {
    width: 200, height: 200,
    backgroundColor: `${COLORS.crimson}05`,
    bottom: 250, right: -50,
  },
  grid: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    // Handled via opacity overlay; actual grid is visual-only
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl + 4,
    paddingBottom: SPACING.xxxl,
    gap: 8,
  },
  glyphWrap: {
    marginBottom: SPACING.lg,
  },
  wordmark: {
    fontFamily: FONTS.displayBlack,
    fontSize: 42,
    color: COLORS.t1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  wordmarkAccent: {
    color: COLORS.gold,
  },
  tagline: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.t3,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: SPACING.lg,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t4,
    letterSpacing: 0.5,
  },
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  googleText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.t1,
  },
  unavailableHint: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.t4,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.sm,
  },
  guestBtn: {
    paddingVertical: 12,
  },
  guestText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.t3,
  },
  proof: {
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: 3,
  },
  star: {
    fontSize: 14,
    color: COLORS.gold,
  },
  proofText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t4,
    textAlign: 'center',
  },
  legal: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.t4,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: SPACING.sm,
  },
  legalLink: {
    color: COLORS.t3,
    textDecorationLine: 'underline',
  },
});
import { useRef, useCallback } from 'react';
import { View, Text, Pressable, Share, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@theme';
import { CharacterNameText } from '@shared/components/CharacterNameText';
import { Character } from '@/types';
import { formatCurrency } from '@utils/currency';

interface Props {
  character: Character;
  deathAge: number;
  score: number;
  country: string;
}

export function DeathShareCard({ character, deathAge, score, country }: Props) {
  const { colors, fonts, radii } = useTheme();
  const shotRef = useRef<any>(null);

  const handleShare = useCallback(async () => {
    try {
      const uri = await shotRef.current?.capture?.();
      if (uri) {
        await Share.share({ url: uri, message: `${character.name} — ${deathAge} years. LifeQuest.` });
      } else {
        await Share.share({ message: `${character.name} lived to age ${deathAge} with a score of ${score}. LifeQuest.` });
      }
    } catch {
      await Share.share({ message: `${character.name} lived to age ${deathAge}. LifeQuest.` });
    }
  }, [character.name, deathAge, score]);

  return (
    <View>
      <ViewShot ref={shotRef} options={{ format: 'jpg', quality: 0.95 }}>
        <LinearGradient
          colors={['#0D1117', '#1A1F2E']}
          style={[styles.shareCard, { borderRadius: radii.lg, borderColor: `${colors.gold}40` }]}
        >
          <Text style={[styles.brand, { color: colors.gold, fontFamily: fonts.bodyBold }]}>LIFEQUESTTM</Text>
          <CharacterNameText
            name={character.name}
            style={[styles.shareName, { color: '#FFFFFF', fontFamily: fonts.displayBlack }]}
          />
          <Text style={[styles.shareAge, { color: colors.t3, fontFamily: fonts.body }]}>
            {character.birthYear} – {character.birthYear + deathAge} · Aged {deathAge}
          </Text>
          <View style={styles.shareStats}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.statNum, { color: colors.gold, fontFamily: fonts.displayBold }]}>{score.toLocaleString()}</Text>
              <Text style={[styles.statLbl, { color: '#AAAAAA', fontFamily: fonts.body }]}>Life Score</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.statNum, { color: colors.emerald, fontFamily: fonts.displayBold }]}>
                {formatCurrency(character.bankBalance, country)}
              </Text>
              <Text style={[styles.statLbl, { color: '#AAAAAA', fontFamily: fonts.body }]}>Net Worth</Text>
            </View>
          </View>
        </LinearGradient>
      </ViewShot>

      <Pressable
        onPress={handleShare}
        style={[styles.shareBtn, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.md }]}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path stroke={colors.t1} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
        </Svg>
        <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 14, marginLeft: 8 }}>Share Memory Card</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shareCard: { padding: 24, borderWidth: 1, gap: 8, marginBottom: 12 },
  brand: { fontSize: 10, letterSpacing: 3 },
  shareName: { fontSize: 28, color: '#FFFFFF' },
  shareAge: { fontSize: 13, letterSpacing: 1 },
  shareStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  statNum: { fontSize: 20 },
  statLbl: { fontSize: 11, letterSpacing: 1, marginTop: 2 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1 },
});

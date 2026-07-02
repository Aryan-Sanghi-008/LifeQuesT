import { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { AchievementDef } from '@data/achievements';
import { useTheme } from '@theme';
import { AchievementCategoryIcon } from './AchievementCategoryIcon';
import { getAchievementIconCategory } from './achievementIconCategories';

export interface AchievementShareCardHandle {
  capture: () => Promise<string | undefined>;
}

interface Props {
  achievement: AchievementDef;
  characterName: string;
  characterAge: number;
}

export const AchievementShareCard = forwardRef<AchievementShareCardHandle, Props>(
  function AchievementShareCard({ achievement, characterName, characterAge }, ref) {
    const { colors, fonts } = useTheme();
    const shotRef = useRef<any>(null);
    const category = getAchievementIconCategory(achievement.id);

    useImperativeHandle(ref, () => ({
      capture: async () => shotRef.current?.capture?.(),
    }));

    return (
      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot ref={shotRef} options={{ format: 'jpg', quality: 0.95 }}>
          <LinearGradient
            colors={['#0D1117', '#1A1F2E']}
            style={[styles.card, { borderColor: `${achievement.color}55` }]}
          >
            <Text style={[styles.brand, { color: colors.gold, fontFamily: fonts.bodyBold }]}>LifeQuest</Text>

            <View style={[styles.iconWrap, { backgroundColor: `${achievement.color}22` }]}>
              <AchievementCategoryIcon category={category} color={achievement.color} size={44} />
            </View>

            <Text style={styles.header}>ACHIEVEMENT UNLOCKED</Text>
            <Text style={[styles.title, { color: achievement.color }]}>{achievement.label}</Text>
            <Text style={styles.description}>{achievement.description}</Text>

            <View style={styles.divider} />

            <Text style={styles.characterName}>{characterName}</Text>
            <Text style={styles.characterAge}>Age {characterAge}</Text>

            <View style={[styles.cta, { borderColor: `${achievement.color}66` }]}>
              <Text style={[styles.ctaText, { color: achievement.color }]}>Play LifeQuest</Text>
            </View>
          </LinearGradient>
        </ViewShot>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
    opacity: 0,
  },
  card: {
    width: 320,
    padding: 28,
    borderWidth: 1.5,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    color: '#C9A84C',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  header: {
    color: '#C9A84C',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: '#9AA3B2',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#2A3142',
    marginVertical: 8,
  },
  characterName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  characterAge: {
    color: '#7A8494',
    fontSize: 13,
    marginBottom: 4,
  },
  cta: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
